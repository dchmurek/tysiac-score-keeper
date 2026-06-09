import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    name: v.string(),
    code: v.string(),
    hostName: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("finished"),
    ),
    targetScore: v.number(),
    allowSpectators: v.boolean(),
    createdAt: v.number(),
    scoreA: v.optional(v.number()),
    scoreB: v.optional(v.number()),
    currentDealer: v.optional(v.string()),
    winner: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
      ),
    ),
  }).index("by_code", ["code"]),

  roomParticipants: defineTable({
    roomId: v.id("rooms"),
    nickname: v.string(),
    participantType: v.union(
      v.literal("account"),
      v.literal("guest"),
    ),
    role: v.union(
      v.literal("host"),
      v.literal("player"),
      v.literal("spectator"),
    ),
    team: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
      ),
    ),
    canEnterScores: v.boolean(),
    joinedAt: v.number(),
  }).index("by_room", ["roomId"]),

  rounds: defineTable({
    roomId: v.id("rooms"),
    number: v.number(),
    leadingTeam: v.union(
      v.literal("A"),
      v.literal("B"),
    ),
    pointsA: v.number(),
    pointsB: v.number(),
    scoreAfterA: v.number(),
    scoreAfterB: v.number(),
    enteredBy: v.string(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]),
});