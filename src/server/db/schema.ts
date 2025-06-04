import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  json,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  week: integer("week").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).default("pending").notNull(),
  subtasks: json("subtasks").$type<{ id: string; title: string; completed: boolean }[]>(),
  isDraft: boolean("is_draft").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewQueue = pgTable("review_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id).notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  course: one(courses, {
    fields: [tasks.courseId],
    references: [courses.id],
  }),
  reviewQueue: one(reviewQueue, {
    fields: [tasks.id],
    references: [reviewQueue.taskId],
  }),
}));

// SQL function to delete courses and related data older than 8 months
export const deleteOldCourses = sql`
  WITH old_courses AS (
    SELECT id FROM courses 
    WHERE updated_at < NOW() - INTERVAL '8 months'
  ),
  deleted_tasks AS (
    DELETE FROM tasks 
    WHERE course_id IN (SELECT id FROM old_courses)
    RETURNING id
  ),
  deleted_review_queue AS (
    DELETE FROM review_queue 
    WHERE task_id IN (SELECT id FROM deleted_tasks)
    RETURNING id
  )
  DELETE FROM courses 
  WHERE id IN (SELECT id FROM old_courses)
  RETURNING id;
`;
