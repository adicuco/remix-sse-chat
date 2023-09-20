import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";

export function getNote({ id }: Pick<Note, "id">) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true, userId: true },
    where: { id },
  });
}

export function getNoteListItems() {
  return prisma.note.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
