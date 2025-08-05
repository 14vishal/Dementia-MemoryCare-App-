import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("patient"), // "patient" or "caregiver"
  profilePhotoUrl: text("profile_photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  photoUrls: text("photo_urls").array(),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const familiarFaces = pgTable("familiar_faces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  photoUrl: text("photo_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyTasks = pgTable("daily_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  steps: jsonb("steps"),
  category: text("category").notNull(), // "morning", "medication", "evening", etc.
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  scheduledTime: text("scheduled_time"), // "09:00", "12:30", etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // "once daily", "twice daily", etc.
  times: text("times").array(), // ["09:00", "21:00"]
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").references(() => medications.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenAt: timestamp("taken_at"),
  status: text("status").notNull().default("pending"), // "pending", "taken", "missed", "skipped"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const behaviorLogs = pgTable("behavior_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  caregiverId: varchar("caregiver_id").references(() => users.id),
  mood: text("mood").notNull(), // "happy", "calm", "confused", "agitated", "sad"
  sleepHours: integer("sleep_hours"),
  appetite: text("appetite"), // "good", "fair", "poor"
  activityLevel: text("activity_level"), // "active", "moderate", "low"
  notes: text("notes"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  photoUrl: text("photo_url"),
  category: text("category").notNull().default("family"), // "family", "medical", "emergency"
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caregiverPatients = pgTable("caregiver_patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caregiverId: varchar("caregiver_id").references(() => users.id).notNull(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMemorySchema = insertMemorySchema.partial();

export const insertFamiliarFaceSchema = createInsertSchema(familiarFaces).omit({
  id: true,
  createdAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBehaviorLogSchema = createInsertSchema(behaviorLogs).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertCaregiverPatientSchema = createInsertSchema(caregiverPatients).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type FamiliarFace = typeof familiarFaces.$inferSelect;
export type InsertFamiliarFace = z.infer<typeof insertFamiliarFaceSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type BehaviorLog = typeof behaviorLogs.$inferSelect;
export type InsertBehaviorLog = z.infer<typeof insertBehaviorLogSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type CaregiverPatient = typeof caregiverPatients.$inferSelect;
export type InsertCaregiverPatient = z.infer<typeof insertCaregiverPatientSchema>;
