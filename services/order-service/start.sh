#!/bin/sh
# Startup script for Order Service

echo "Starting Order Service..."

# Run database migrations and seed
echo "Running database seed..."
python -m app.db.seed

# Start the application
echo "Starting uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
