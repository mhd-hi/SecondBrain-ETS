import type { AdapterAccountType } from 'next-auth/adapters';
import { relations, sql } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

// NextAuth.js user and authentication tables
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  streakDays: integer('streak_days').notNull().default(0),
  lastCompletedPomodoroDate: timestamp('last_completed_pomodoro_date', { mode: 'date' }),
});

export const accounts = pgTable('account', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, account => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
}));

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, verificationToken => ({
  compositePk: primaryKey({
    columns: [verificationToken.identifier, verificationToken.token],
  }),
}));

export const terms = pgTable('terms', {
  id: text('id').primaryKey(), // '20253'
  label: text('label'), // 'Automne 2025'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  term: text('term').notNull().references(() => terms.id, { onDelete: 'restrict' }),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  week: integer('week').notNull(),
  type: text('type', { enum: ['theorie', 'pratique', 'exam', 'homework', 'lab'] }).notNull().default('theorie'),
  status: text('status', { enum: ['IN_PROGRESS', 'TODO', 'COMPLETED'] }).default('TODO').notNull(),
  estimatedEffort: real('estimated_effort').notNull().default(1),
  actualEffort: real('actual_effort').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  dueDate: timestamp('due_date').notNull(),
});

export const subtasks = pgTable('subtasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', { enum: ['theorie', 'pratique', 'exam', 'homework', 'lab'] }).notNull().default('theorie'),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['IN_PROGRESS', 'TODO', 'COMPLETED'] }).default('TODO').notNull(),
  estimatedEffort: real('estimated_effort').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  dueDate: timestamp('due_date'),
});

export const pomodoroDaily = pgTable('pomodoro_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  day: date('day', { mode: 'date' }).notNull(),
  totalMinutes: integer('total_minutes').notNull().default(0),
  taskIds: uuid('task_ids').array().notNull().default(sql`ARRAY[]::uuid[]`),
}, t => ({
  uniqUserDay: uniqueIndex('pomodoro_daily_user_day_uq').on(t.userId, t.day),
}));

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull().default('custom'),
  imageUrl: text('image_url'),

  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => ({
  // Composite index for the main query: WHERE user_id = ? AND course_id = ?
  userCourseIdx: index('idx_links_user_course').on(table.userId, table.courseId),
  // Index for user-specific queries (dashboard links where course_id IS NULL)
  userIdx: index('idx_links_user_id').on(table.userId),
  // Index for course-specific queries
  courseIdx: index('idx_links_course_id').on(table.courseId),
}));

export const coursesCache = pgTable('courses_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseCode: text('course_code').notNull().unique(),
  parsedContent: json('parsed_content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  courses: many(courses),
  tasks: many(tasks),
  links: many(links),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, { fields: [courses.userId], references: [users.id] }),
  tasks: many(tasks),
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  course: one(courses, { fields: [links.courseId], references: [courses.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  course: one(courses, {
    fields: [tasks.courseId],
    references: [courses.id],
  }),
  subtasks: many(subtasks),
}));

// SQL function to delete courses and related data older than 8 months for all users
export const deleteOldCourses = sql`
  DELETE FROM courses 
  WHERE updated_at < NOW() - INTERVAL '8 months'
  RETURNING id;
`;
