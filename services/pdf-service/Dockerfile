FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PDF generation and plotting
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libfreetype6-dev \
    libpng-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for artifacts
RUN mkdir -p /data/artifacts/reports /data/artifacts/charts

# Expose port
EXPOSE 8020

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8020/ || exit 1

# Run the application
CMD ["python", "app/main.py"]
