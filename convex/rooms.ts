import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode(length = 4): string {
  let code = "";

  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[index];
  }

  return code;
}

export const createRoom = mutation({
  args: {
    name: v.string(),
    hostName: v.string(),
    allowSpectators: v.boolean(),
  },

  handler: async (ctx, args) => {
    let code = generateRoomCode();

    while (
      await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
    ) {
      code = generateRoomCode();
    }

    const roomId = await ctx.db.insert("rooms", {
      name: args.name.trim(),
      code,
      hostName: args.hostName.trim(),
      status: "waiting",
      targetScore: 1000,
      allowSpectators: args.allowSpectators,
      createdAt: Date.now(),
    });

    await ctx.db.insert("roomParticipants", {
      roomId,
      nickname: args.hostName.trim(),
      participantType: "account",
      role: "host",
      canEnterScores: true,
      joinedAt: Date.now(),
    });

    return {
      roomId,
      code,
    };
  },
});

export const getRoomByCode = query({
  args: {
    code: v.string(),
  },

  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) =>
        q.eq("code", args.code.trim().toUpperCase()),
      )
      .unique();

    if (!room) {
      return null;
    }

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    return {
      ...room,
      participants,
    };
  },
});