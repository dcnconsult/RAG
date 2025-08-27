"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create domains table
    op.create_table('domains',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create documents table
    op.create_table('documents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('domain_id', sa.UUID(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create document_chunks table
    op.create_table('document_chunks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('document_id', sa.UUID(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('embedding', postgresql.VECTOR(dimensions=1536), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create chats table
    op.create_table('chats',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('domain_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create chat_messages table
    op.create_table('chat_messages',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('chat_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['chat_id'], ['chats.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create external_models table
    op.create_table('external_models',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('model_type', sa.String(length=50), nullable=False),
        sa.Column('config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create vector_search_logs table
    op.create_table('vector_search_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('results_count', sa.Integer(), nullable=False),
        sa.Column('response_time', sa.Float(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_domains_name', 'domains', ['name'])
    op.create_index('ix_documents_domain_id', 'documents', ['domain_id'])
    op.create_index('ix_documents_status', 'documents', ['status'])
    op.create_index('ix_document_chunks_document_id', 'document_chunks', ['document_id'])
    op.create_index('ix_document_chunks_chunk_index', 'document_chunks', ['chunk_index'])
    op.create_index('ix_chats_domain_id', 'chats', ['domain_id'])
    op.create_index('ix_chat_messages_chat_id', 'chat_messages', ['chat_id'])
    op.create_index('ix_chat_messages_role', 'chat_messages', ['role'])
    op.create_index('ix_external_models_provider', 'external_models', ['provider'])
    op.create_index('ix_external_models_is_active', 'external_models', ['is_active'])
    op.create_index('ix_vector_search_logs_created_at', 'vector_search_logs', ['created_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_vector_search_logs_created_at', 'vector_search_logs')
    op.drop_index('ix_external_models_is_active', 'external_models')
    op.drop_index('ix_external_models_provider', 'external_models')
    op.drop_index('ix_chat_messages_role', 'chat_messages')
    op.drop_index('ix_chat_messages_chat_id', 'chat_messages')
    op.drop_index('ix_chats_domain_id', 'chats')
    op.drop_index('ix_document_chunks_chunk_index', 'document_chunks')
    op.drop_index('ix_document_chunks_document_id', 'document_chunks')
    op.drop_index('ix_documents_status', 'documents')
    op.drop_index('ix_documents_domain_id', 'documents')
    op.drop_index('ix_domains_name', 'domains')
    
    # Drop tables
    op.drop_table('vector_search_logs')
    op.drop_table('external_models')
    op.drop_table('chat_messages')
    op.drop_table('chats')
    op.drop_table('document_chunks')
    op.drop_table('documents')
    op.drop_table('domains')
