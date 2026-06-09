import { query } from "./_generated/server";

export const check = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      message: "Convex backend is working",
    };
  },
});