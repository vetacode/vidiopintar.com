# Vidiopintar.com

AI-powered YouTube video learning platform. Submit a YouTube link to get video summaries and chat with the content using AI.

![Demo 1](http://res.cloudinary.com/dr15yjl8w/image/upload/v1750910596/public/gtvf4kejtuxr3fvethqe.png)

![Demo 2](http://res.cloudinary.com/dr15yjl8w/image/upload/v1750910570/public/jke8sblctm6hmqnbpfnp.png)

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth
- **AI**: OpenAI & Google AI SDK

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:
- Database connection
- OpenAI API key
- Google AI API key
- Auth secrets
