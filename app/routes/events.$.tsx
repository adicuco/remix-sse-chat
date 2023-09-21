import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";

import { emitter } from "~/events";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  const path = `/${params["*"]}`;

  return eventStream(request.signal, (send) => {
    const handler = (message: string) => {
      send({ data: JSON.stringify(message) ?? Date.now().toString() });
    };

    emitter.addListener(path, handler);
    return () => {
      emitter.removeListener(path, handler);
    };
  });
};
