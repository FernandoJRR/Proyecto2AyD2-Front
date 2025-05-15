import type { Entity } from "../utils/entity";

const CURRENT_GAME_URI = "/v1/games";

export interface Game extends Entity {
  reservationId: string;
  players: Player[];
  hasFinished: boolean;
  currentHole: number;
}

export interface Player extends Entity {
  name: string;
  playerNumber: number
}

export interface ScoresHoleResponse {
  playerScores: ScoreHolePlayer[]
}

export interface ScoreHolePlayer {
  id: string
  name: string
  totalShots: number
}

export interface UpdateScoreGamePayload {
  holeNumber: number
  scorePlayers: ScorePlayerPayload[]
}

export interface ScorePlayerPayload {
  playerId: string
  shotsPlayer: number
}

export interface UpdatePlayersGame {
  players: PlayersGamePayload[]
}

export interface PlayersGamePayload {
  name: string
  playerNumber: number
}

export const getAllGames = async () => {
  const response = await $api<Game[]>(`${CURRENT_GAME_URI}`, {
    method: "GET",
  });
  return response;
}

export const getGameById = async (game_id: string) => {
  const response = await $api<Game>(`${CURRENT_GAME_URI}/${game_id}`, {
    method: "GET",
  });
  return response;
}

export const getScoreHole = async (game_id: string, hole_num: number) => {
  const response = await $api<ScoresHoleResponse>(`${CURRENT_GAME_URI}/score/${game_id}/${hole_num}`, {
    method: "GET",
  });
  return response;
}

export const getScoreGame = async (game_id: string) => {
  const response = await $api<ScoresHoleResponse>(`${CURRENT_GAME_URI}/score/${game_id}`, {
    method: "GET",
  });
  return response;
}

export const updateScoreGame = async (game_id: string, payload: UpdateScoreGamePayload) => {
  const response = await $api<ScoresHoleResponse>(`${CURRENT_GAME_URI}/score/${game_id}`, {
    method: "PATCH",
    body: payload
  });
  return response;
}

export const updatePlayerGame = async (game_id: string, payload: UpdatePlayersGame) => {
  const response = await $api<ScoresHoleResponse>(`${CURRENT_GAME_URI}/players/${game_id}`, {
    method: "PATCH",
    body: payload
  });
  return response;
}
