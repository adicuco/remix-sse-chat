import { EventEmitter } from "events";

export const emitter = new EventEmitter();

export const EVENTS = {
  NOTES_ADDED: ({
    id,
    title,
    email,
  }: {
    id: string;
    title: string;
    email: string;
  }) => {
    emitter.emit("/notes");
    emitter.emit(`/notes/${id}`);
    emitter.emit(`/chat-messages-added`, {
      email: "system",
      message: `New note added: "${title}" by ${email}`,
      timestamp: new Date().toISOString(),
    });
  },
  NOTES_DELETED: (noteId: string) => {
    emitter.emit("/notes");
    emitter.emit(`/notes/${noteId}`);
  },
  CHAT_USER_JOINED: (email: string) => {
    emitter.emit("/chat-user-joined", {
      email,
      timestamp: new Date().toISOString(),
    });
  },
  CHAT_USER_LEFT: (email: string) => {
    emitter.emit("/chat-user-left", {
      email,
      timestamp: new Date().toISOString(),
    });
  },
  CHAT_MESSAGE_ADDED: (message: { email: string; message: string }) => {
    emitter.emit(`/chat-messages-added`, {
      ...message,
      timestamp: new Date().toISOString(),
    });
  },
};
