# Employee Salary Management System

A robust Node.js backend API service for the Employee Salary Management System, powered by Express.js, PostgreSQL, and Prisma ORM.

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js (v5)
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Uploads**: Multer

## Project Structure

```
├── lib/
│   └── prisma.js              # Prisma Client instance
├── middleware/
│   ├── authMiddleware.js      # JWT authentication middleware
│   └── uploadMiddleware.js    # File upload handling (Multer)
├── prisma/
│   └── schema.prisma          # Prisma schema definition
├── routes/
│   ├── authRoutes.js          # Authentication (Register / Login)
│   ├── workspaceRoutes.js     # Workspace management
│   └── taskRoutes.js          # Task management & attachments
├── uploads/                   # Local file attachment storage
├── .env                       # Environment configuration
├── package.json               # Project metadata & dependencies
├── prisma.config.js           # Prisma CLI configuration
├── server.js                  # Application entry point & server setup
└── README.md                  # Project documentation
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Synchronize Database Schema
```bash
npm run db:push
```

### 3. Start the Server
- **Development (with hot reload)**:
  ```bash
  npm run dev
  ```
- **Production / Watch mode**:
  ```bash
  npm start
  ```

## API Endpoints

### System Info
- `GET /` — Returns system health and metadata

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`username`, `email`, `password`)
- `POST /api/auth/login` — Login user and receive a JWT Bearer token

### Workspaces (`/api/workspaces`) — *Requires Authorization: Bearer <token>*
- `GET /api/workspaces` — List workspaces belonging to authenticated user
- `POST /api/workspaces` — Create a new workspace
- `PUT /api/workspaces/:wsId` — Update workspace details
- `DELETE /api/workspaces/:wsId` — Delete workspace and associated data

### Tasks & Salary Workflows (`/api/workspaces/:wsId/tasks`) — *Requires Authorization: Bearer <token>*
- `GET /api/workspaces/:wsId/tasks` — List tasks for a workspace
- `POST /api/workspaces/:wsId/tasks` — Create task with optional file attachment (`multipart/form-data`)
- `PUT /api/workspaces/:wsId/tasks/:id` — Update task details
- `DELETE /api/workspaces/:wsId/tasks/:id` — Remove a task
- `POST /api/workspaces/:wsId/tasks/:id/move` — Move task across workspaces
- `GET /api/workspaces/:wsId/tasks/:id/download` — Download task attachment file
