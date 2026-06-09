// Realistic mock data shaped for future Convex integration.
// Replace function bodies with Convex queries/mutations later.

export type UserId = string;

export interface User {
  id: UserId;
  username: string;
  email: string;
  initials: string;
  joinedAt: string;
}

export interface Guest {
  id: string;
  nickname: string;
  initials: string;
  linkedUserId?: UserId;
}

export interface Team {
  id: "A" | "B";
  name: string;
  players: Array<{ id: string; name: string; isGuest: boolean }>;
  score: number;
}

export interface Round {
  id: string;
  number: number;
  leadingTeam: "A" | "B";
  pointsA: number;
  pointsB: number;
  scoreAfterA: number;
  scoreAfterB: number;
  enteredBy: string;
  timestamp: string;
  note?: string;
  isCorrection?: boolean;
}

export type RoomStatus = "active" | "paused" | "finished";

export interface Room {
  id: string;
  code: string;
  name: string;
  hostId: UserId;
  targetScore: number;
  status: RoomStatus;
  createdAt: string;
  teamA: Team;
  teamB: Team;
  rounds: Round[];
  currentDealer: string;
  winner?: "A" | "B";
  durationMinutes?: number;
}

export interface Match {
  id: string;
  date: string;
  roomName: string;
  teamA: { players: string[]; score: number };
  teamB: { players: string[]; score: number };
  winner: "A" | "B";
  rounds: number;
  durationMinutes: number;
  status: "finished" | "paused";
}

export interface PendingConfirmation {
  id: string;
  matchId: string;
  hostName: string;
  date: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  type: "confirmation" | "trusted-host" | "guest-match" | "accepted" | "rejected";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PlayerStats {
  userId: UserId;
  username: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  totalPoints: number;
  highestScore: number;
  lowestScore: number;
  mostFrequentPartner: string;
  bestPartner: string;
  mostFrequentOpponent: string;
  recentForm: Array<"W" | "L">;
}

export interface PairStats {
  id: string;
  player1: string;
  player2: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  highestWin: number;
  biggestLoss: number;
}

export const currentUser: User = {
  id: "u-adam",
  username: "Adam",
  email: "adam@example.com",
  initials: "AD",
  joinedAt: "2025-01-12",
};

export const users: User[] = [
  currentUser,
  { id: "u-kuba", username: "Kuba", email: "kuba@example.com", initials: "KU", joinedAt: "2025-02-04" },
  { id: "u-bartek", username: "Bartek", email: "bartek@example.com", initials: "BA", joinedAt: "2025-01-30" },
  { id: "u-michal", username: "Michał", email: "michal@example.com", initials: "MI", joinedAt: "2025-03-19" },
  { id: "u-ola", username: "Ola", email: "ola@example.com", initials: "OL", joinedAt: "2025-04-02" },
  { id: "u-piotr", username: "Piotr", email: "piotr@example.com", initials: "PI", joinedAt: "2025-04-22" },
];

export const activeRoom: Room = {
  id: "r-active",
  code: "K8P2",
  name: "Saturday Match",
  hostId: "u-adam",
  targetScore: 1000,
  status: "active",
  createdAt: "2026-06-08T19:00:00Z",
  currentDealer: "Bartek",
  teamA: {
    id: "A",
    name: "Team A",
    players: [
      { id: "u-adam", name: "Adam", isGuest: false },
      { id: "u-kuba", name: "Kuba", isGuest: false },
    ],
    score: 840,
  },
  teamB: {
    id: "B",
    name: "Team B",
    players: [
      { id: "u-bartek", name: "Bartek", isGuest: false },
      { id: "u-michal", name: "Michał", isGuest: false },
    ],
    score: 720,
  },
  rounds: [
    { id: "rnd-1", number: 1, leadingTeam: "A", pointsA: 110, pointsB: 50, scoreAfterA: 110, scoreAfterB: 50, enteredBy: "Adam", timestamp: "2026-06-08T19:08:00Z" },
    { id: "rnd-2", number: 2, leadingTeam: "B", pointsA: 60, pointsB: 120, scoreAfterA: 170, scoreAfterB: 170, enteredBy: "Adam", timestamp: "2026-06-08T19:18:00Z" },
    { id: "rnd-3", number: 3, leadingTeam: "A", pointsA: 130, pointsB: 40, scoreAfterA: 300, scoreAfterB: 210, enteredBy: "Adam", timestamp: "2026-06-08T19:31:00Z", note: "Strong hand." },
    { id: "rnd-4", number: 4, leadingTeam: "B", pointsA: 30, pointsB: 140, scoreAfterA: 330, scoreAfterB: 350, enteredBy: "Adam", timestamp: "2026-06-08T19:44:00Z" },
    { id: "rnd-5", number: 5, leadingTeam: "A", pointsA: 150, pointsB: 50, scoreAfterA: 480, scoreAfterB: 400, enteredBy: "Adam", timestamp: "2026-06-08T19:58:00Z" },
    { id: "rnd-6", number: 6, leadingTeam: "A", pointsA: 120, pointsB: 80, scoreAfterA: 600, scoreAfterB: 480, enteredBy: "Adam", timestamp: "2026-06-08T20:12:00Z" },
    { id: "rnd-7", number: 7, leadingTeam: "B", pointsA: 80, pointsB: 140, scoreAfterA: 680, scoreAfterB: 620, enteredBy: "Adam", timestamp: "2026-06-08T20:25:00Z" },
    { id: "rnd-8", number: 8, leadingTeam: "A", pointsA: 160, pointsB: 100, scoreAfterA: 840, scoreAfterB: 720, enteredBy: "Adam", timestamp: "2026-06-08T20:39:00Z" },
  ],
};

export const pausedRoom: Room = {
  ...activeRoom,
  id: "r-paused",
  code: "M3X7",
  name: "Friday Rematch",
  status: "paused",
  createdAt: "2026-06-05T18:30:00Z",
  teamA: { ...activeRoom.teamA, score: 620 },
  teamB: { ...activeRoom.teamB, score: 540 },
  rounds: activeRoom.rounds.slice(0, 5),
};

export const recentMatches: Match[] = [
  { id: "m-1", date: "2026-06-01", roomName: "Sunday Evening", teamA: { players: ["Adam", "Kuba"], score: 1000 }, teamB: { players: ["Bartek", "Michał"], score: 870 }, winner: "A", rounds: 11, durationMinutes: 62, status: "finished" },
  { id: "m-2", date: "2026-05-28", roomName: "Quick Game", teamA: { players: ["Adam", "Bartek"], score: 760 }, teamB: { players: ["Kuba", "Michał"], score: 1000 }, winner: "B", rounds: 9, durationMinutes: 48, status: "finished" },
  { id: "m-3", date: "2026-05-22", roomName: "Marathon", teamA: { players: ["Adam", "Michał"], score: 1000 }, teamB: { players: ["Kuba", "Bartek"], score: 920 }, winner: "A", rounds: 14, durationMinutes: 85, status: "finished" },
  { id: "m-4", date: "2026-05-15", roomName: "Friday Night", teamA: { players: ["Adam", "Ola"], score: 820 }, teamB: { players: ["Piotr", "Michał"], score: 1000 }, winner: "B", rounds: 10, durationMinutes: 55, status: "finished" },
  { id: "m-5", date: "2026-05-09", roomName: "Saturday Match", teamA: { players: ["Adam", "Kuba"], score: 1000 }, teamB: { players: ["Bartek", "Piotr"], score: 740 }, winner: "A", rounds: 12, durationMinutes: 70, status: "finished" },
];

export const pendingConfirmations: PendingConfirmation[] = [
  { id: "pc-1", matchId: "m-99", hostName: "Adam", date: "2026-05-22", message: "Adam added you to a match on May 22, 2026" },
  { id: "pc-2", matchId: "m-98", hostName: "Bartek", date: "2026-05-18", message: "Bartek added you to a match on May 18, 2026" },
];

export const notifications: NotificationItem[] = [
  { id: "n-1", type: "confirmation", message: "Adam added you to a match.", timestamp: "2026-06-07T11:20:00Z", read: false },
  { id: "n-2", type: "trusted-host", message: "Bartek wants to allow you to add him to matches automatically.", timestamp: "2026-06-06T09:15:00Z", read: false },
  { id: "n-3", type: "guest-match", message: "A guest match can be connected to your account.", timestamp: "2026-06-05T20:01:00Z", read: true },
  { id: "n-4", type: "accepted", message: "Michał accepted your match invitation.", timestamp: "2026-06-04T22:30:00Z", read: true },
  { id: "n-5", type: "rejected", message: "Ola declined a match participation.", timestamp: "2026-06-03T18:45:00Z", read: true },
];

export const playerStats: PlayerStats = {
  userId: "u-adam",
  username: "Adam",
  games: 48,
  wins: 31,
  losses: 17,
  winRate: 0.646,
  averageScore: 912,
  totalPoints: 43_780,
  highestScore: 1000,
  lowestScore: 540,
  mostFrequentPartner: "Kuba",
  bestPartner: "Kuba (72% wins)",
  mostFrequentOpponent: "Bartek",
  recentForm: ["W", "W", "L", "W", "L", "W", "W", "L", "W", "W"],
};

export const playerRanking: Array<{
  rank: number;
  username: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
}> = [
  { rank: 1, username: "Adam", games: 48, wins: 31, losses: 17, winRate: 0.646, averageScore: 912 },
  { rank: 2, username: "Kuba", games: 42, wins: 26, losses: 16, winRate: 0.619, averageScore: 905 },
  { rank: 3, username: "Michał", games: 39, wins: 22, losses: 17, winRate: 0.564, averageScore: 880 },
  { rank: 4, username: "Bartek", games: 45, wins: 23, losses: 22, winRate: 0.511, averageScore: 870 },
  { rank: 5, username: "Ola", games: 18, wins: 9, losses: 9, winRate: 0.5, averageScore: 855 },
  { rank: 6, username: "Piotr", games: 12, wins: 5, losses: 7, winRate: 0.417, averageScore: 820 },
];

export const pairStats: PairStats[] = [
  { id: "p-1", player1: "Adam", player2: "Kuba", games: 22, wins: 16, losses: 6, winRate: 0.727, averageScore: 940, highestWin: 1000, biggestLoss: 640 },
  { id: "p-2", player1: "Bartek", player2: "Michał", games: 20, wins: 10, losses: 10, winRate: 0.5, averageScore: 880, highestWin: 1000, biggestLoss: 590 },
  { id: "p-3", player1: "Adam", player2: "Michał", games: 14, wins: 9, losses: 5, winRate: 0.643, averageScore: 905, highestWin: 1000, biggestLoss: 700 },
  { id: "p-4", player1: "Kuba", player2: "Ola", games: 6, wins: 4, losses: 2, winRate: 0.667, averageScore: 890, highestWin: 1000, biggestLoss: 720 },
  { id: "p-5", player1: "Piotr", player2: "Ola", games: 1, wins: 1, losses: 0, winRate: 1, averageScore: 1000, highestWin: 1000, biggestLoss: 0 },
];

export const trustedHosts: Array<{ id: string; username: string; status: "active" | "pending" }> = [
  { id: "th-1", username: "Kuba", status: "active" },
  { id: "th-2", username: "Bartek", status: "pending" },
];

export function getMatchById(id: string): Match | undefined {
  return recentMatches.find((m) => m.id === id);
}
