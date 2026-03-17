## Biblion - Library Management System

A full-stack library management system built with React, TypeScript, Tailwind CSS, and Cloudflare Workers with D1 Database.

### Features

- **Frontend**: Modern React application with responsive design
- **Backend**: Cloudflare Workers API with Hono framework
- **Database**: Cloudflare D1 (SQLite) for data persistence
- **UI**: Beautiful interface with shadcn/ui components

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Hono, Cloudflare Workers
- **Database**: Cloudflare D1
- **UI Components**: Radix UI, Lucide Icons

### API Endpoints

#### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

#### Loans
- `GET /api/loans` - Get all loans with book and user details
- `POST /api/loans` - Create new loan
- `PUT /api/loans/:id/return` - Return a book

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5174](http://localhost:5174) in your browser

### Database Setup

The database schema is automatically created when you run the application. It includes tables for:
- `books` - Book catalog
- `users` - Library members
- `loans` - Book borrowing records

### Deployment

This application is designed to deploy to Cloudflare Pages and Workers.

To deploy:
```bash
npm run build
npx wrangler deploy
```

### Project Structure

```
src/
├── data/
│   └── books.ts          # Book types and sample data
├── react-app/
│   ├── components/       # React components
│   ├── lib/
│   │   ├── api.ts        # API service functions
│   │   └── utils.ts      # Utility functions
│   ├── pages/            # Page components
│   └── main.tsx          # App entry point
└── worker/
    ├── index.ts          # Cloudflare Worker API
    └── types.ts          # TypeScript types
```


