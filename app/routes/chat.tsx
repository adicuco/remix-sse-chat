import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, Outlet, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EVENTS } from "~/events";
import { useEventSource } from "~/hooks/useEventSource";
import { requireUser } from "~/session.server";

import { useUser } from "~/utils";

// type ChatUser = {
//   email: string;
//   lastActive: number;
// };
// const users: ChatUser[] = [];

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const user = await requireUser(request);

//   if (!users.some((u) => u.email === user.email)) {
//     users.push({
//       email: user.email,
//       lastActive: Date.now(),
//     });
//     // EVENTS.CHAT_USER_JOINED(user.email);
//   } else {
//     const index = users.findIndex((u) => u.email === user.email);
//     users[index].lastActive = Date.now();
//   }

//   // remove user after 5 minutes of inactivity
//   users.forEach((u, i) => {
//     if (Date.now() - u.lastActive > 1000 * 60) {
//       users.splice(i, 1);
//       EVENTS.CHAT_USER_LEFT(u.email);
//     }
//   });

//   return json({ users });
// };

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  EVENTS.CHAT_USER_LEFT(user.email);

  return redirect("/chat");
};
// if (!users.some((u) => u.email === user.email)) {
//   users.push({

type ChatUser = {
  email: string;
  isActive: boolean;
};

export default function ChatPage() {
  // const { users } = useLiveLoader<typeof loader>();

  const { pathname } = useLocation();

  const user = useUser();

  const [users, setUsers] = useState<ChatUser[]>([]);

  const userJoined = useEventSource("/events/chat-user-joined");
  const userLeft = useEventSource("/events/chat-user-left");

  useEffect(() => {
    if (userJoined) {
      const { email } = JSON.parse(userJoined) as {
        email: string;
      };

      setUsers((users) => {
        const newEmail = email.replace(/"/g, "");
        const index = users.findIndex((u) => u.email === newEmail);

        if (index !== -1) {
          users[index].isActive = true;
          return users;
        }

        return [
          ...users,
          {
            email: newEmail,
            isActive: true,
          },
        ];
      });
    }
  }, [userJoined]);

  useEffect(() => {
    if (userLeft) {
      const { email } = JSON.parse(userLeft) as {
        email: string;
      };

      setUsers((users) => {
        const newEmail = email.replace(/"/g, "");
        const index = users.findIndex((u) => u.email === newEmail);
        if (index === -1) return users;

        const newUsers = [...users];
        newUsers.splice(index, 1);

        return [
          ...newUsers,
          {
            email: newEmail,
            isActive: false,
          },
        ];
      });
    }
  }, [userLeft]);

  return (
    <div className="flex h-full min-h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Chat</Link>
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

      <main className="flex h-full bg-white overflow-hidden">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="/notes" className="block p-4 text-xl text-blue-500">
            Notes
          </Link>

          <hr />

          {pathname.includes("live") && (
            <Form method="post">
              <button type="submit" className="block p-4 text-xl text-red-500">
                Leave chat
              </button>
            </Form>
          )}

          <hr />

          <ol>
            {users.map(({ email, isActive }) => (
              <li key={email}>
                <div className="block border-b p-4 text-xl">
                  {isActive ? "🟢" : "🔴"} {email}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex-1 px-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
