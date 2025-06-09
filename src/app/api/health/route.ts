import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db/health';

/**
 * Health check endpoint for monitoring deployment status
 * This endpoint verifies that the database and application are properly configured
 */
export async function GET() {
  try {
    // Check database health
    const dbHealth = await healthCheck();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
