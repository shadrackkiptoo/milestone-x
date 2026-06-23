import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
} from "drizzle-orm/pg-core"

// ----------------------------------------------------------------------------
// Better Auth tables (do not rename columns)
// ----------------------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("donor"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ----------------------------------------------------------------------------
// Application tables
// ----------------------------------------------------------------------------
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  ownerId: text("ownerId").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("community"),
  location: text("location"),
  imageUrl: text("imageUrl"),
  fundingGoal: integer("fundingGoal").notNull().default(0),
  fundedAmount: integer("fundedAmount").notNull().default(0),
  escrowBalance: integer("escrowBalance").notNull().default(0),
  releasedAmount: integer("releasedAmount").notNull().default(0),
  // pending | approved | rejected | funding | completed
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull().default(0),
  dueDate: timestamp("dueDate"),
  orderIndex: integer("orderIndex").notNull().default(0),
  // pending | submitted | verifying | approved | rejected | released
  status: text("status").notNull().default("pending"),
  evidenceNote: text("evidenceNote"),
  evidenceUrls: text("evidenceUrls"),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  donorId: text("donorId").notNull(),
  donorName: text("donorName"),
  amount: integer("amount").notNull(),
  // donation | investment
  kind: text("kind").notNull().default("donation"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestoneId").notNull(),
  projectId: integer("projectId").notNull(),
  verifierId: text("verifierId").notNull(),
  verifierName: text("verifierName"),
  // approve | reject
  decision: text("decision").notNull(),
  report: text("report").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  milestoneId: integer("milestoneId"),
  // contribution | escrow_in | release | refund
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  actorId: text("actorId"),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  raisedById: text("raisedById").notNull(),
  raisedByName: text("raisedByName"),
  subject: text("subject").notNull(),
  details: text("details").notNull(),
  // open | investigating | resolved
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
