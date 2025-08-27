-- RAG Explorer Database Initialization Script
-- This script sets up the initial database structure for the RAG application

-- Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom types
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE model_provider AS ENUM ('openai', 'anthropic', 'cohere', 'local');

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100),
    status document_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create document_chunks table for storing text chunks
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_length INTEGER NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chats table for storing chat sessions
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    title VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create chat_messages table for storing individual messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vector_search_logs table for analytics
CREATE TABLE IF NOT EXISTS vector_search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    results_count INTEGER NOT NULL,
    search_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create external_models table for configuration
CREATE TABLE IF NOT EXISTS external_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider model_provider NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_domain_id ON documents(domain_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chats_domain_id ON chats(domain_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_vector_search_logs_domain_id ON vector_search_logs(domain_id);
CREATE INDEX IF NOT EXISTS idx_external_models_provider ON external_models(provider);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_models_updated_at BEFORE UPDATE ON external_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default external models
INSERT INTO external_models (name, provider, model_name, is_active) VALUES
    ('GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', true),
    ('GPT-4', 'openai', 'gpt-4', true),
    ('Claude-3 Haiku', 'anthropic', 'claude-3-haiku-20240307', true),
    ('Claude-3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', true),
    ('Claude-3 Opus', 'anthropic', 'claude-3-opus-20240229', true)
ON CONFLICT DO NOTHING;

-- Create a function to search similar vectors
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant permissions to the rag_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rag_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rag_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO rag_user;

-- Create a view for document statistics
CREATE OR REPLACE VIEW document_stats AS
SELECT 
    d.domain_id,
    dom.name as domain_name,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as processed_documents,
    COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_documents,
    COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_documents,
    SUM(d.file_size) as total_size_bytes,
    AVG(d.file_size) as avg_file_size_bytes
FROM documents d
JOIN domains dom ON d.domain_id = dom.id
GROUP BY d.domain_id, dom.name;

-- Create a view for chat statistics
CREATE OR REPLACE VIEW chat_stats AS
SELECT 
    c.domain_id,
    dom.name as domain_name,
    COUNT(c.id) as total_chats,
    COUNT(cm.id) as total_messages,
    MAX(c.updated_at) as last_activity
FROM chats c
JOIN domains dom ON c.domain_id = dom.id
LEFT JOIN chat_messages cm ON c.id = cm.chat_id
GROUP BY c.domain_id, dom.name;
