# Use a slim Python 3.11 base image
FROM python:3.11-slim

# Copy the uv binary directly from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Enable bytecode compilation for faster starts
ENV UV_COMPILE_BYTECODE=1

# Copy configuration files first to cache dependency install step
COPY pyproject.toml uv.lock ./

# Install dependencies directly into the system Python environment inside the container
RUN uv pip install --system -r pyproject.toml

# Copy application directories
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose port
EXPOSE 7860 8000

# Start uvicorn. By default, Hugging Face Spaces uses port 7860.
# Render and other providers define the PORT environment variable.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
