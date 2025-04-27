import { pgTable, integer, boolean, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Basic Files/ Folder Structure
    name: text("name").notNull(),
    path: text("path").notNull(), // / document/ project/ resume.png
    size: integer("size").notNull(),
    type: text("type").notNull(), // if folder we will hardcore the value of it

    // storage information
    fileUrl: text("file_url").notNull(), // url to access file
    filethumbnailUrl: text("thumbnail_url"), // url to access thumbnail of file

    // Ownership
    userId: text("user_id").notNull(), // user id of the user who uploaded the file
    parentId: uuid("parent_id"), // parent id of the file/folder

    // file/folder flags
    isFolder: boolean("is_folder").default(false).notNull(), // if true then it is a folder
    isStarred: boolean("is_starred").default(false).notNull(), // if true then it is starred
    isTrashed: boolean("is_trashed").default(false).notNull(), // if true then it is trashed

    // timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(), // timestamp of when the file was created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // timestamp of when the file was updated
})

// parent : Each file/folder can have one parent folder

// children : Each file/ folder can have many children files/folder


export const filesRelations = relations(files, ({ one, many }) => (
    {
        parent: one(files, {
            fields: [files.parentId],
            references: [files.id]
        }),

        // relationship to child file/folder
        children: many(files)
    })); 

// type definations

export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;