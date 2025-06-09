# Infrastructure as Code (IaaC) Setup

This project uses Infrastructure as Code principles to automatically manage database setup, migrations, and deployments without any manual intervention.

## 🏗️ Architecture Overview

The infrastructure is fully automated through:

- **GitHub Actions**: Handles CI/CD pipeline
- **Drizzle ORM**: Manages database schema and migrations
- **Vercel**: Hosts the application with automatic deployments
- **Supabase**: Provides the PostgreSQL database

## 🚀 Automated Infrastructure Pipeline

### 1. Code Push Triggers
- Push to `main` → Production deployment
- Push to `develop` → Preview deployment  
- Pull Request → Preview deployment with health checks

### 2. Infrastructure Job
1. **Dependency Installation**: Bun installs all packages
2. **Code Quality**: TypeScript checking and ESLint validation
3. **Database Health Check**: Verifies database connectivity and schema
4. **Infrastructure Deployment**: Runs migrations and seeding automatically
5. **Application Build**: Compiles the Next.js application

### 3. Deployment Job
1. **Vercel Deploy**: Deploys to appropriate environment
2. **Post-deployment Health Check**: Validates deployment success
3. **PR Comments**: Automatic deployment URL sharing

## 🗄️ Database Infrastructure

### Schema Management
- **Automatic migrations**: Generated from schema changes
- **Zero-downtime deployments**: Migrations run before application deployment
- **Environment isolation**: Separate databases for production/preview

### Database Operations
```bash
# These run automatically in CI/CD:
bun run db:generate  # Generate migration files
bun run db:migrate   # Apply migrations
bun run db:seed      # Initialize required data
```

### Build Integration
The `build` script automatically runs database deployment:
```json
"build": "bun run db:deploy && next build"
```

## 🔧 Environment Configuration

### Required Secrets (GitHub Repository Settings)
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Environment Variables (Vercel Project Settings)
- `DATABASE_URL`: Production database connection
- `NODE_ENV`: Set to `production`

## 📊 Monitoring & Health Checks

### Health Endpoint
- **URL**: `/health` or `/api/health`
- **Purpose**: Validates database connectivity and application status
- **Usage**: Automated monitoring and deployment verification

### Response Format
```json
{
  "status": "healthy",
  "timestamp": "2025-06-08T10:00:00.000Z",
  "database": {
    "healthy": true,
    "tables": ["user", "account", "session", "courses", "tasks"]
  },
  "environment": "production"
}
```

## 🔄 Database Migration Strategy

### Automatic Migration Flow
1. **Schema Changes**: Modify `src/server/db/schema.ts`
2. **Commit Changes**: Push to repository
3. **CI/CD Pipeline**: Automatically generates and applies migrations
4. **Deployment**: Application deploys with updated schema

### Migration Safety
- **Validation**: Migrations are validated before deployment
- **Rollback**: Vercel provides instant rollback capabilities
- **Zero-downtime**: Database changes apply before application deployment

## 🚨 Failure Handling

### Database Issues
- **Connection failures**: Deployment stops, no broken deployments
- **Migration errors**: Detailed logs in GitHub Actions
- **Schema conflicts**: Automatic detection and error reporting

### Application Issues
- **Build failures**: Prevent deployment automatically
- **Health check failures**: Alert through monitoring
- **Rollback**: One-click rollback in Vercel dashboard

## 🔒 Security & Best Practices

### Infrastructure Security
- **No manual access**: All changes through code
- **Environment isolation**: Separate database per environment  
- **Secret management**: All credentials in encrypted GitHub secrets
- **Audit trail**: Full deployment history in GitHub Actions

### Database Security
- **Connection encryption**: SSL-required connections to Supabase
- **User isolation**: Row-level security in application layer
- **Backup strategy**: Automatic backups via Supabase

## 📈 Scaling Considerations

### Database Scaling
- **Supabase**: Automatic scaling and connection pooling
- **Migration performance**: Optimized migration scripts
- **Connection management**: Drizzle ORM connection pooling

### Application Scaling
- **Vercel**: Automatic edge scaling
- **Build optimization**: Cached dependencies and artifacts
- **Environment separation**: Independent scaling per environment

## 🛠️ Troubleshooting

### Common Issues
1. **Migration failures**: Check database connection and schema syntax
2. **Build failures**: Verify TypeScript and lint errors
3. **Deployment issues**: Check Vercel token and project configuration

### Debug Commands (Local Development)
```bash
# Test database connection
bun run -e "import { healthCheck } from './src/lib/db/health.ts'; await healthCheck();"

# Run infrastructure locally (for testing deployment scripts)
./deploy/infrastructure.sh

# Reset database (development only)
bun run db:reset
```

## 🎯 Benefits of This Approach

1. **Zero Manual Setup**: Everything automated through code
2. **Consistent Environments**: Same process for all deployments
3. **Fast Deployments**: Parallel infrastructure and build processes
4. **Easy Rollbacks**: One-click rollback for any deployment
5. **Audit Trail**: Complete history of all infrastructure changes
6. **Error Prevention**: Validation and health checks prevent broken deployments
