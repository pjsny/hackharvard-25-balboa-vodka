import { pgTable, varchar, timestamp, unique, uuid, boolean, text, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"




export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	emailVerified: boolean("email_verified").default(false),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);


