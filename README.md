# SecondBrain - Your Course Management Assistant

A Next.js application that helps students manage their course workload by intelligently parsing course plans and creating manageable tasks.

## Project Overview

SecondBrain uses AI to parse ETS course plans and break them down into manageable tasks, helping students stay organized and on track with their studies.

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [OpenAI API](https://openai.com)

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) >= 1.0.0 (recommended package manager)
- Node.js (if you prefer npm/yarn)

### Installation

1. Clone the repository
2. Install dependencies using Bun (recommended):
   ```bash
   bun install
   ```
3. Set up environment variables :
- By copying `.env.example` to `.env`

4. Set up the database:
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Scripts

### Essential Commands
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun typecheck` - Run TypeScript compiler check
