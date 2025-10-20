# AI Canvas

A simple infinite canvas application built with Next.js and Convex.

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up Convex:
```bash
npx convex dev
```

3. Copy environment variables:
```bash
cp env.example .env.local
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Next.js 15 with App Router
- Convex backend
- TypeScript
- Tailwind CSS
- Infinite canvas (coming soon)

## Project Structure

```
├── src/
│   └── app/
│       ├── canvas/          # Canvas page
│       ├── layout.tsx       # Root layout
│       ├── page.tsx         # Home page
│       └── globals.css      # Global styles
├── convex/                  # Convex backend
│   ├── documents.ts         # Document mutations/queries
│   └── schema.ts            # Database schema
└── package.json
```
