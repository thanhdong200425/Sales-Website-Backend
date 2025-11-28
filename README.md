<!-- PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=mydb

DATABASE_URL="postgresql://postgres:123456@127.0.0.1:5432/mydb?schema=public" -->

# Express.js + PostgreSQL Backend

A backend project using Express.js and PostgreSQL with Docker.

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Start the Express server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check with database status

## Environment Variables

See `.env` file for configuration options.

## Docker Commands

- Start PostgreSQL: `docker-compose up -d`
- Stop PostgreSQL: `docker-compose down`
- View logs: `docker-compose logs -f`
- Reset database: `docker-compose down -v` (removes volumes)