import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { EVENTS } from "~/events";
import { useEventSource } from "~/hooks/useEventSource";
import { useUser } from "~/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const message = formData.get("message") as string;
  const email = formData.get("email") as string;

  EVENTS.CHAT_MESSAGE_ADDED({ message, email });

  return json({});
};

type Message = {
  email: string;
  message: string;
  createdAt: string;
};

export default function ChatLivePage() {
  const divRef = useRef<HTMLDivElement>(null);

  let navigation = useNavigation();
  let isAdding = navigation.state == "submitting";
  let formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);

  const handleMessage = (
    message: string,
    email?: string,
    timestamp?: string,
  ) => {
    setMessages((messages) => {
      if (messages.some((m) => m.createdAt === timestamp)) return messages;

      return [
        ...messages,
        {
          email: email ?? user.email,
          message,
          createdAt: timestamp ?? new Date().toISOString(),
        },
      ];
    });
  };

  const userJoined = useEventSource("/events/chat-user-joined");
  const userLeft = useEventSource("/events/chat-user-left");
  const newMessage = useEventSource("/events/chat-messages-added");

  useEffect(() => {
    if (userJoined) {
      const { email, timestamp } = JSON.parse(userJoined) as {
        email: string;
        timestamp: string;
      };
      handleMessage(`${email} joined the chat`, "system", timestamp);
    }
  }, [userJoined]);

  useEffect(() => {
    if (userLeft) {
      const { email, timestamp } = JSON.parse(userLeft) as {
        email: string;
        timestamp: string;
      };
      handleMessage(`${email} left the chat`, "system", timestamp);
    }
  }, [userLeft]);

  useEffect(() => {
    if (newMessage) {
      const { message, email, timestamp } = JSON.parse(newMessage) as {
        message: string;
        email: string;
        timestamp: string;
      };
      handleMessage(message, email, timestamp);
    }
  }, [newMessage]);

  return (
    <div className="flex flex-col min-h-0 h-full overflow-auto">
      <ul className="flex flex-col justify-end gap-2 p-4 flex-1 mb-20">
        {messages.map((message) => (
          <li
            key={message.createdAt}
            className={clsx("flex items-start", {
              "justify-end": message.email === user.email,
              "justify-start": message.email !== user.email,
            })}
          >
            <div
              className={clsx("flex flex-col rounded-md p-3", {
                "bg-green-300":
                  message.email === "system" &&
                  message.message.includes("joined"),
                "bg-red-300":
                  message.email === "system" &&
                  message.message.includes("left"),
                "bg-purple-300":
                  message.email === "system" &&
                  message.message.includes("added"),
                "bg-blue-300":
                  message.email !== "system" && message.email === user.email,
                "bg-gray-300":
                  message.email !== "system" && message.email !== user.email,
              })}
            >
              <div className="flex items-center">
                <img
                  src={`https://eu.ui-avatars.com/api/?name=${message.email}`}
                  alt={message.email}
                  className="w-8 h-8 rounded-full"
                />

                <div className="ml-2">
                  <div className="text-sm font-bold">{message.email}</div>
                  <div className="text-sm text-gray-500">
                    {message.createdAt}
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-lg">{message.message}</p>
              </div>
            </div>
          </li>
        ))}

        <div ref={divRef} />
      </ul>

      <Form
        ref={formRef}
        method="post"
        className="flex items-center w-4/5 bg-slate-200/30 rounded-lg justify-between p-4 absolute bottom-0 left-0 right-0 mx-auto mb-4"
      >
        <input
          type="text"
          name="message"
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-md p-2"
        />

        <input type="hidden" name="email" value={user.email} />

        <button
          type="submit"
          className="ml-2 rounded bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 active:bg-blue-700"
        >
          Send
        </button>
      </Form>
    </div>
  );
}
