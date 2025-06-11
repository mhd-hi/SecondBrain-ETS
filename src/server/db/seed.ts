/* eslint-disable no-console */
import { db } from './index';
import { users } from './schema';

/**
 * Database seeding for development and initial setup
 * This runs automatically during deployment to ensure required data exists
 */

export async function seedDatabase() {
  // TODO: seed openai data
  console.log('🌱 Starting database seeding...');

  try {
    // Check if database is already seeded (has any users)
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length > 0) {
      console.log('✅ Database already contains data, skipping seed');
      return;
    }

    console.log('📝 Database is empty, running initial seed...');

    // Add any initial data setup here if needed
    // For example, default categories, system users, etc.

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  void seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
