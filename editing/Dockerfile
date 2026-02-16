FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose the port
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3100/api/modules || exit 1

# Run the server
CMD ["bun", "run", "server.ts"]
