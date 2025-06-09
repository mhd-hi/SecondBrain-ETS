# Infrastructure as Code Deployment

> **Note**: This project uses fully automated Infrastructure as Code (IaaC). No manual setup required!

## 🚀 Quick Start

1. **Add GitHub Secrets** (one-time setup)
2. **Push your code** - everything else is automatic!

## Required GitHub Secrets

Add these to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `DATABASE_URL` | Supabase PostgreSQL connection | Copy from Supabase dashboard |
| `VERCEL_TOKEN` | Vercel deployment token | [Create at vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Copy from team settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Copy from project settings |

## 🔄 Automated Infrastructure

Every code push automatically:

✅ **Validates code quality** (TypeScript + ESLint)  
✅ **Checks database health**  
✅ **Generates migrations** from schema changes  
✅ **Applies database migrations**  
✅ **Seeds required data**  
✅ **Builds and deploys application**  
✅ **Runs post-deployment health checks**  

## 🌍 Environment Strategy

- **Production**: `main` branch → production deployment
- **Preview**: `develop` branch + PRs → preview deployments
- **Local**: `bun run dev` with local database

## 📊 Monitoring

**Health Check Endpoint**: `/health`
- Database connectivity
- Schema validation  
- Application status

## 🛠️ Local Development

```bash
# Start development (with automatic DB setup)
bun run dev

# Reset database (development only)
bun run db:reset

# Check deployment readiness
bun run deploy:check
```

## 🚨 Troubleshooting

### Deployment Failures
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure database connection is valid

### Database Issues
- Migrations are validated before deployment
- Rollback available through Vercel dashboard
- Health checks prevent broken deployments

## 🔒 Security Features

- All credentials stored as encrypted GitHub secrets
- Environment isolation (separate databases)
- SSL-required database connections
- Audit trail for all infrastructure changes

---

**Previous manual setup approach has been replaced with Infrastructure as Code for better reliability and zero manual intervention.**
