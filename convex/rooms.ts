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
      scoreA: 0,
      scoreB: 0,
      currentDealer: args.hostName.trim(),
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

export const getGameRoom = query({
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

    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("asc")
      .collect();

    const teamAPlayers = participants
      .filter((participant) => participant.team === "A")
      .map((participant) => ({
        id: participant._id,
        name: participant.nickname,
        isGuest: participant.participantType === "guest",
      }));

    const teamBPlayers = participants
      .filter((participant) => participant.team === "B")
      .map((participant) => ({
        id: participant._id,
        name: participant.nickname,
        isGuest: participant.participantType === "guest",
      }));

    return {
      id: room._id,
      code: room.code,
      name: room.name,
      targetScore: room.targetScore,
      status: room.status,
      currentDealer: room.currentDealer ?? room.hostName,
      winner: room.winner,

      teamA: {
        id: "A" as const,
        name: "Team A",
        players: teamAPlayers,
        score: room.scoreA ?? 0,
      },

      teamB: {
        id: "B" as const,
        name: "Team B",
        players: teamBPlayers,
        score: room.scoreB ?? 0,
      },

      rounds: rounds.map((round) => ({
        id: round._id,
        number: round.number,
        leadingTeam: round.leadingTeam,
        pointsA: round.pointsA,
        pointsB: round.pointsB,
        scoreAfterA: round.scoreAfterA,
        scoreAfterB: round.scoreAfterB,
        enteredBy: round.enteredBy,
        timestamp: new Date(round.createdAt).toISOString(),
        note: round.note,
      })),
    };
  },
});

export const addRound = mutation({
  args: {
    code: v.string(),
    leadingTeam: v.union(
      v.literal("A"),
      v.literal("B"),
    ),
    pointsA: v.number(),
    pointsB: v.number(),
    note: v.optional(v.string()),
    enteredBy: v.string(),
  },

  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) =>
        q.eq("code", args.code.trim().toUpperCase()),
      )
      .unique();

    if (!room) {
      throw new Error("Room not found.");
    }

    if (room.status !== "active") {

      throw new Error("Only an active match can be modified.");

    }

    if (room.status !== "active") {
      throw new Error("This match is not active.");
    }

    if (!Number.isInteger(args.pointsA) || !Number.isInteger(args.pointsB)) {
      throw new Error("Round points must be whole numbers.");
    }

    const currentA = room.scoreA ?? 0;
    const currentB = room.scoreB ?? 0;

    const applyScoreRule = (
      currentScore: number,
      addedPoints: number,
      didLeadRound: boolean,
    ) => {
      const rawScore = currentScore + addedPoints;

      if (rawScore >= room.targetScore) {
        if (didLeadRound) {
          return {
            finalScore: room.targetScore,
            won: true,
          };
        }

        return {
          finalScore: 990,
          won: false,
        };
      }

      return {
        finalScore: rawScore,
        won: false,
      };
    };

    const resultA = applyScoreRule(
      currentA,
      args.pointsA,
      args.leadingTeam === "A",
    );

    const resultB = applyScoreRule(
      currentB,
      args.pointsB,
      args.leadingTeam === "B",
    );

    const winner =
      resultA.won
        ? "A"
        : resultB.won
          ? "B"
          : undefined;

    const existingRounds = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const roundNumber = existingRounds.length + 1;

    const roundId = await ctx.db.insert("rounds", {
      roomId: room._id,
      number: roundNumber,
      leadingTeam: args.leadingTeam,
      pointsA: args.pointsA,
      pointsB: args.pointsB,
      scoreAfterA: resultA.finalScore,
      scoreAfterB: resultB.finalScore,
      enteredBy: args.enteredBy.trim(),
      note: args.note?.trim() || undefined,
      createdAt: Date.now(),
    });

    await ctx.db.patch(room._id, {
      scoreA: resultA.finalScore,
      scoreB: resultB.finalScore,
      status: winner ? "finished" : "active",
      winner,
    });

    return {
      roundId,
      roundNumber,
      scoreA: resultA.finalScore,
      scoreB: resultB.finalScore,
      winner,
    };
  },
});

export const pauseRoom = mutation({
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
      throw new Error("Room not found.");
    }

    if (room.status !== "active") {
      throw new Error("Only an active match can be paused.");
    }

    await ctx.db.patch(room._id, {
      status: "paused",
    });

    return {
      status: "paused" as const,
    };
  },
});

export const resumeRoom = mutation({
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
      throw new Error("Room not found.");
    }

    if (room.status !== "paused") {
      throw new Error("Only a paused match can be resumed.");
    }

    await ctx.db.patch(room._id, {
      status: "active",
    });

    return {
      status: "active" as const,
    };
  },
});

export const undoLastRound = mutation({
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
      throw new Error("Room not found.");
    }

    const lastRound = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("desc")
      .first();

    if (!lastRound) {
      throw new Error("There is no round to undo.");
    }

    await ctx.db.delete(lastRound._id);

    const previousRound = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("desc")
      .first();

    const scoreA = previousRound?.scoreAfterA ?? 0;
    const scoreB = previousRound?.scoreAfterB ?? 0;

    await ctx.db.patch(room._id, {
      scoreA,
      scoreB,
      winner: undefined,
      status: "active",
    });

    return {
      removedRoundNumber: lastRound.number,
      scoreA,
      scoreB,
    };
  },
});

export const discardRoom = mutation({
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
      throw new Error("Room not found.");
    }

    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    for (const round of rounds) {
      await ctx.db.delete(round._id);
    }

    const participants = await ctx.db
      .query("roomParticipants")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }

    await ctx.db.delete(room._id);

    return {
      discarded: true,
    };
  },
});