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

export const startRoom = mutation({
  args: {
    code: v.string(),
    players: v.array(
      v.object({
        nickname: v.string(),
        participantType: v.union(
          v.literal("account"),
          v.literal("guest"),
        ),
        team: v.union(
          v.literal("A"),
          v.literal("B"),
        ),
        canEnterScores: v.boolean(),
        isHost: v.boolean(),
      }),
    ),
  },

  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "waiting") {
      throw new Error("This room has already started.");
    }

    if (args.players.length !== 4) {
      throw new Error("Exactly four players are required.");
    }

    const normalizedPlayers = args.players.map((player) => ({
      ...player,
      nickname: player.nickname.trim(),
    }));

    if (normalizedPlayers.some((player) => !player.nickname)) {
      throw new Error("Every player must have a nickname.");
    }

    const uniqueNicknames = new Set(
      normalizedPlayers.map((player) => player.nickname.toLowerCase()),
    );

    if (uniqueNicknames.size !== normalizedPlayers.length) {
      throw new Error("Player nicknames must be unique.");
    }

    const teamA = normalizedPlayers.filter((player) => player.team === "A");
    const teamB = normalizedPlayers.filter((player) => player.team === "B");

    if (teamA.length !== 2 || teamB.length !== 2) {
      throw new Error("Each team must contain exactly two players.");
    }

    const hosts = normalizedPlayers.filter((player) => player.isHost);

    if (hosts.length !== 1) {
      throw new Error("The room must have exactly one host.");
    }

    const existingParticipants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    for (const participant of existingParticipants) {
      await ctx.db.delete(participant._id);
    }

    for (const player of normalizedPlayers) {
      await ctx.db.insert("roomParticipants", {
        roomId: room._id,
        nickname: player.nickname,
        participantType: player.participantType,
        role: player.isHost ? "host" : "player",
        team: player.team,
        canEnterScores: player.isHost ? true : player.canEnterScores,
        joinedAt: Date.now(),
      });
    }

    await ctx.db.patch(room._id, {
      status: "active",
    });

    return {
      roomId: room._id,
      code: room.code,
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