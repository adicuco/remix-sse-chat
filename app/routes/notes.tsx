import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useEventSource } from "~/hooks/useEventSource";

import { useLiveLoader } from "~/hooks/useLiveLoader";

import { getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const noteListItems = await getNoteListItems();
  return json({ noteListItems });
};

export default function NotesPage() {
  const data = useLiveLoader<typeof loader>();
  const user = useUser();

  const [messagesNotifications, setMessagesNotifications] = useState(0);

  const newMessages = useEventSource("/events/chat-messages-added");

  useEffect(() => {
    if (newMessages) {
      setMessagesNotifications((n) => n + 1);
    }
  }, [newMessages]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full  w-80 border-r bg-gray-50">
          <Link
            to="/chat"
            className=" p-4 text-xl text-green-500 flex items-center"
          >
            <span>Chat</span>

            {messagesNotifications > 0 && (
              <span className="text-sm ml-4 rounded-full px-2.5 py-1 bg-green-600 text-white">
                {messagesNotifications > 5 ? "5+" : messagesNotifications}
              </span>
            )}
          </Link>

          <hr />

          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />

          {data.noteListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={note.id}
                  >
                    📝 {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
