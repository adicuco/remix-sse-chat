import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { EVENTS } from "~/events";
import { requireUser } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  EVENTS.CHAT_USER_JOINED(user.email);

  return redirect("/chat/live");
};

export default function ChatIndex() {
  return (
    <div className="flex flex-1 justify-center items-center gap-2 flex-col w-full h-full">
      <h1 className="text-2xl font-bold">Join the chat!</h1>

      <Form method="post">
        <button
          type="submit"
          className="rounded bg-green-500 font-bold px-4 py-2 text-blue-100 hover:bg-green-600 active:bg-green-600"
        >
          Join
        </button>
      </Form>
    </div>
  );
}
