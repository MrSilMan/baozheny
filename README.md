# 宝针 BaoZhen

**Buy from China, Built for the World.**

BaoZhen is a full-stack B2B/B2C China sourcing and trading platform that connects global buyers with verified Chinese suppliers. Built with Next.js 15, PostgreSQL, Redis, and Stripe.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (ioredis) |
| Auth | NextAuth.js v5 (Credentials + Google OAuth) |
| Payments | Stripe |
| File Storage | AWS S3 / Cloudflare R2 |
| Email | Resend + React Email |
| Logging | Winston |
| Monitoring | Sentry |
| Styling | Tailwind CSS v4 + shadcn/ui |
| CI/CD | GitHub Actions |

---

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- A Stripe account (test mode is fine)
- A Resend account (for email)
- Google OAuth credentials (optional)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/baozhen.git
cd baozhen
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:
- `DATABASE_URL`
- `REDIS_URL`
- `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`

### 3. Start infrastructure with Docker

```bash
# Start PostgreSQL + Redis only (for local dev)
docker compose up postgres redis -d

# Or start everything including the app
docker compose up -d
```

### 4. Run database migrations and seed

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed with test data
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@baozhen.com | Admin@12345 |
| Buyer | buyer@baozhen.com | Buyer@12345 |
| Supplier | supplier@baozhen.com | Supplier@12345 |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |
| `npm run test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```
baozhen/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── (dashboard)/     # Buyer + Admin dashboards
│   ├── (public)/        # Landing, Products, Suppliers
│   └── api/             # API routes (auth, webhooks, upload)
├── actions/             # Next.js Server Actions
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── shared/          # Navbar, Footer, ProductCard
│   └── dashboard/       # StatCard, OrderTimeline, DataTable
├── emails/              # React Email templates
├── hooks/               # useCart, useDebounce, useToast
├── lib/
│   ├── validations/     # Zod schemas
│   ├── prisma.ts        # Prisma client
│   ├── redis.ts         # Redis client + helpers
│   ├── logger.ts        # Winston logger
│   ├── stripe.ts        # Stripe utilities
│   └── s3.ts            # AWS S3 / R2 utilities
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeder
├── types/               # TypeScript types
└── __tests__/           # Jest test suite
```

---

## Docker Deployment

### Build and run production

```bash
docker compose up --build -d
```

### Run migrations in production

```bash
docker compose exec app npx prisma migrate deploy
```

### View logs

```bash
docker compose logs -f app
```

---

## Environment Variables Reference

See [`.env.example`](.env.example) for a complete list of required and optional environment variables.

---

## CI/CD

The GitHub Actions workflow at `.github/workflows/ci.yml` runs:

1. **Lint** — ESLint + Prettier
2. **Typecheck** — `tsc --noEmit`
3. **Test** — Jest with real PostgreSQL + Redis
4. **Build** — `next build`
5. **Deploy** — Configurable target via `DEPLOY_TARGET` variable: `railway`, `vps`, or `render`

Set `DEPLOY_TARGET` in your GitHub repository variables to activate deployment.

---

## Stripe Webhooks

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Set the `STRIPE_WEBHOOK_SECRET` from the CLI output in your `.env`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*BaoZhen — 宝针 — "Precious Needle" — Precision sourcing from China to the world.*
