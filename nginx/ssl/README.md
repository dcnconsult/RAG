# SSL Certificates Directory

This directory contains SSL certificates for HTTPS production deployment.

## Files Required

- `cert.pem` - SSL certificate file
- `key.pem` - Private key file

## Development Setup

For development, you can generate self-signed certificates:

```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate self-signed certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Production Setup

For production, use proper SSL certificates from a trusted Certificate Authority (CA) like Let's Encrypt.

## Security Notes

- Never commit private keys to version control
- Keep private keys secure and restrict access
- Rotate certificates regularly
- Use strong key sizes (2048 bits minimum)
