import { EventEmitter } from "events";

export const emitter = new EventEmitter();

export const EVENTS = {
  NOTES_ADDED: (noteId: string) => {
    emitter.emit("/notes");
    emitter.emit(`/notes/${noteId}`);
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
