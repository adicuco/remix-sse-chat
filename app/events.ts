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
};
