import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  week: integer("week").notNull(),
  type: text("type", { enum: ["theorie", "pratique", "exam", "homework", "lab"] }).notNull().default("theorie"),
  status: text("status", { enum: ["draft", "pending", "in_progress", "completed"] }).default("draft").notNull(),
  estimatedEffort: integer("estimated_effort").notNull().default(1),
  subtasks: json("subtasks").$type<{ id: string; title: string; completed: boolean; notes?: string; estimatedEffort?: number }[]>(),
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
}));

// SQL function to delete courses and related data older than 8 months
export const deleteOldCourses = sql`
  DELETE FROM courses 
  WHERE updated_at < NOW() - INTERVAL '8 months'
  RETURNING id;
`;
