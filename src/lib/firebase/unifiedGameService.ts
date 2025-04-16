/**
 * Unified Game Service
 * 
 * This service provides a unified API for game operations that works with both 
 * Firestore and Realtime Database. It uses the database selector to determine
 * which implementation to use at runtime.
 */

import { selectDatabase } from './databaseSelector';
import * as FirestoreService from './gameService';
import * as RTDBService from './rtdbGameService';
import type { Game, Team, Player, Word } from '@/types/firestore';
import { doc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './config';

// Define function types for all operations
type CreateGameFn = () => Promise<{ id: string, code: string }>;
type FindGameByCodeFn = (code: string) => Promise<Game | null>;

type AddTeamFn = (gameId: string, teamData: Omit<Team, 'id' | 'score'>) => Promise<string>;
type UpdateTeamFn = (gameId: string, teamId: string, teamData: Partial<Omit<Team, 'id'>>) => Promise<void>;
type GetAllTeamsFn = (gameId: string) => Promise<Team[]>;
type GetTeamByIdFn = (gameId: string, teamId: string) => Promise<Team | null>;
type DeleteTeamFn = (gameId: string, teamId: string) => Promise<void>;
type UpdateTeamScoreFn = (gameId: string, teamId: string, score: number) => Promise<void>;

type AddPlayerFn = (gameId: string, playerData: Omit<Player, 'id' | 'joinedAt'>) => Promise<string>;
type UpdatePlayerFn = (gameId: string, playerId: string, playerData: Partial<Omit<Player, 'id' | 'joinedAt'>>) => Promise<void>;
type GetAllPlayersFn = (gameId: string) => Promise<Player[]>;
type GetPlayerByIdFn = (gameId: string, playerId: string) => Promise<Player | null>;
type GetPlayersForTeamFn = (gameId: string, teamId: string) => Promise<Player[]>;
type AssignPlayerToTeamFn = (gameId: string, playerId: string, teamId: string) => Promise<void>;
type RemovePlayerFn = (gameId: string, playerId: string) => Promise<void>;

type AddWordFn = (gameId: string, playerId: string, text: string) => Promise<string>;
type GetAllWordsFn = (gameId: string) => Promise<Word[]>;
type GetPlayerWordsFn = (gameId: string, playerId: string) => Promise<Word[]>;
type UpdateWordStateFn = (gameId: string, wordId: string, wordData: Partial<Omit<Word, 'id' | 'text' | 'submittedByPlayerId'>>) => Promise<void>;
type DeleteWordFn = (gameId: string, wordId: string) => Promise<void>;

type UpdateGameStateFn = (gameId: string, gameData: Partial<Omit<Game, 'id' | 'code' | 'createdAt'>>) => Promise<void>;
type StartGameFn = (gameId: string, turnOrder: string[]) => Promise<void>;
type AdvanceToNextRoundFn = (gameId: string) => Promise<void>;
type AdvanceToNextTurnFn = (gameId: string) => Promise<void>;
type MarkWordAsGuessedFn = (gameId: string, wordId: string) => Promise<void>;
type GetWordCountsFn = (gameId: string, round: number) => Promise<{ total: number, guessed: number }>;
type VerifyGameCanStartFn = (gameId: string) => Promise<{ valid: boolean, errors: string[] }>;

// Game creation and lookup
export const createNewGame = () => selectDatabase(
  FirestoreService.createNewGame as CreateGameFn,
  RTDBService.createNewGameRTDB
)();

export const findGameByCode = (code: string) => selectDatabase(
  FirestoreService.findGameByCode as FindGameByCodeFn,
  RTDBService.findGameByCodeRTDB
)(code);

// Game state listeners
export const onGameChange = (gameId: string, callback: (game: Game | null) => void) => selectDatabase(
  (id: string, cb: (game: Game | null) => void) => {
    // Set up Firestore listener for game document
    const gameRef = doc(db, "games", id);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
        cb(gameData);
      } else {
        cb(null);
      }
    });
    return unsubscribe;
  },
  RTDBService.onGameChange
)(gameId, callback);

export const onTeamsChange = (gameId: string, callback: (teams: Team[]) => void) => selectDatabase(
  (id: string, cb: (teams: Team[]) => void) => {
    // Set up Firestore listener for teams collection
    const teamsQuery = query(collection(db, "games", id, "teams"), orderBy("name"));
    const unsubscribe = onSnapshot(teamsQuery, (querySnapshot) => {
      const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      cb(teamsData);
    });
    return unsubscribe;
  },
  RTDBService.onTeamsChange
)(gameId, callback);

export const onPlayersChange = (gameId: string, callback: (players: Player[]) => void) => selectDatabase(
  (id: string, cb: (players: Player[]) => void) => {
    // Set up Firestore listener for players collection
    const playersQuery = query(collection(db, "games", id, "players"));
    const unsubscribe = onSnapshot(playersQuery, (querySnapshot) => {
      const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      cb(playersData);
    });
    return unsubscribe;
  },
  RTDBService.onPlayersChange
)(gameId, callback);

// Team operations
export const addTeamToGame = (gameId: string, teamData: Omit<Team, 'id' | 'score'>) => selectDatabase(
  FirestoreService.addTeamToGame as AddTeamFn,
  RTDBService.addTeamToGameRTDB
)(gameId, teamData);

export const updateTeam = (gameId: string, teamId: string, teamData: Partial<Omit<Team, 'id'>>) => selectDatabase(
  // Use a type assertion for the fallback function
  (FirestoreService as any).updateTeam || 
    ((gameId: string, teamId: string, teamData: Partial<Omit<Team, 'id'>>) => Promise.resolve()) as UpdateTeamFn,
  RTDBService.updateTeamRTDB
)(gameId, teamId, teamData);

export const getAllTeams = (gameId: string) => selectDatabase(
  (FirestoreService as any).getAllTeams || 
    ((gameId: string) => Promise.resolve([])) as GetAllTeamsFn,
  RTDBService.getAllTeamsRTDB
)(gameId);

export const getTeamById = (gameId: string, teamId: string) => selectDatabase(
  (FirestoreService as any).getTeamById || 
    ((gameId: string, teamId: string) => Promise.resolve(null)) as GetTeamByIdFn,
  RTDBService.getTeamByIdRTDB
)(gameId, teamId);

export const deleteTeam = (gameId: string, teamId: string) => selectDatabase(
  (FirestoreService as any).deleteTeam || 
    ((gameId: string, teamId: string) => Promise.resolve()) as DeleteTeamFn,
  RTDBService.deleteTeamRTDB
)(gameId, teamId);

export const updateTeamScore = (gameId: string, teamId: string, score: number) => selectDatabase(
  FirestoreService.updateTeamScore as UpdateTeamScoreFn,
  RTDBService.updateTeamScoreRTDB
)(gameId, teamId, score);

// Player operations
export const addPlayerToGame = (gameId: string, playerData: Omit<Player, 'id' | 'joinedAt'>) => selectDatabase(
  FirestoreService.addPlayerToGame as AddPlayerFn,
  RTDBService.addPlayerToGameRTDB
)(gameId, playerData);

export const updatePlayer = (gameId: string, playerId: string, playerData: Partial<Omit<Player, 'id' | 'joinedAt'>>) => selectDatabase(
  (FirestoreService as any).updatePlayer || 
    ((gameId: string, playerId: string, playerData: Partial<Omit<Player, 'id' | 'joinedAt'>>) => Promise.resolve()) as UpdatePlayerFn,
  RTDBService.updatePlayerRTDB
)(gameId, playerId, playerData);

export const getAllPlayers = (gameId: string) => selectDatabase(
  FirestoreService.getAllPlayers as GetAllPlayersFn,
  RTDBService.getAllPlayersRTDB
)(gameId);

export const getPlayerById = (gameId: string, playerId: string) => selectDatabase(
  (FirestoreService as any).getPlayerById || 
    ((gameId: string, playerId: string) => Promise.resolve(null)) as GetPlayerByIdFn,
  RTDBService.getPlayerByIdRTDB
)(gameId, playerId);

export const getPlayersForTeam = (gameId: string, teamId: string) => selectDatabase(
  FirestoreService.getPlayersForTeam as GetPlayersForTeamFn,
  RTDBService.getPlayersForTeamRTDB
)(gameId, teamId);

export const assignPlayerToTeam = (gameId: string, playerId: string, teamId: string) => selectDatabase(
  (FirestoreService as any).assignPlayerToTeam || 
    ((gameId: string, playerId: string, teamId: string) => Promise.resolve()) as AssignPlayerToTeamFn,
  RTDBService.assignPlayerToTeamRTDB
)(gameId, playerId, teamId);

export const removePlayerFromGame = (gameId: string, playerId: string) => selectDatabase(
  (FirestoreService as any).removePlayerFromGame || 
    ((gameId: string, playerId: string) => Promise.resolve()) as RemovePlayerFn,
  RTDBService.removePlayerFromGameRTDB
)(gameId, playerId);

// Word operations
export const addWordToGame = (gameId: string, playerId: string, text: string) => selectDatabase(
  (FirestoreService as any).addWordToGame || 
    ((gameId: string, playerId: string, text: string) => Promise.resolve("")) as AddWordFn,
  RTDBService.addWordToGameRTDB
)(gameId, playerId, text);

export const getAllWords = (gameId: string) => selectDatabase(
  FirestoreService.getAllWords as GetAllWordsFn,
  RTDBService.getAllWordsRTDB
)(gameId);

export const getPlayerWords = (gameId: string, playerId: string) => selectDatabase(
  FirestoreService.getPlayerWords as GetPlayerWordsFn,
  RTDBService.getPlayerWordsRTDB
)(gameId, playerId);

export const updateWordState = (
  gameId: string,
  wordId: string,
  wordData: Partial<Omit<Word, 'id' | 'text' | 'submittedByPlayerId'>>
) => selectDatabase(
  (FirestoreService as any).updateWordState || 
    ((gameId: string, wordId: string, wordData: Partial<Omit<Word, 'id' | 'text' | 'submittedByPlayerId'>>) => Promise.resolve()) as UpdateWordStateFn,
  RTDBService.updateWordStateRTDB
)(gameId, wordId, wordData);

export const deleteWord = (gameId: string, wordId: string) => selectDatabase(
  (FirestoreService as any).deleteWord || 
    ((gameId: string, wordId: string) => Promise.resolve()) as DeleteWordFn,
  RTDBService.deleteWordRTDB
)(gameId, wordId);

// Game mechanics operations
export const updateGameState = (
  gameId: string,
  gameData: Partial<Omit<Game, 'id' | 'code' | 'createdAt'>>
) => selectDatabase(
  (FirestoreService as any).updateGameState || 
    ((gameId: string, gameData: Partial<Omit<Game, 'id' | 'code' | 'createdAt'>>) => Promise.resolve()) as UpdateGameStateFn,
  RTDBService.updateGameStateRTDB
)(gameId, gameData);

export const startGame = (gameId: string, turnOrder: string[]) => selectDatabase(
  FirestoreService.startGame as StartGameFn,
  RTDBService.startGameRTDB
)(gameId, turnOrder);

export const advanceToNextRound = (gameId: string) => selectDatabase(
  FirestoreService.advanceToNextRound as AdvanceToNextRoundFn,
  RTDBService.advanceToNextRoundRTDB
)(gameId);

export const advanceToNextTurn = (gameId: string) => selectDatabase(
  (FirestoreService as any).advanceToNextTurn || 
    ((gameId: string) => Promise.resolve()) as AdvanceToNextTurnFn,
  RTDBService.advanceToNextTurnRTDB
)(gameId);

export const markWordAsGuessed = (gameId: string, wordId: string) => selectDatabase(
  FirestoreService.markWordAsGuessed as MarkWordAsGuessedFn,
  RTDBService.markWordAsGuessedRTDB
)(gameId, wordId);

export const getWordCountsForRound = (gameId: string, round: number) => selectDatabase(
  FirestoreService.getWordCountsForRound as GetWordCountsFn,
  RTDBService.getWordCountsForRoundRTDB
)(gameId, round);

// Game verification
export const verifyGameCanStart = (gameId: string) => selectDatabase(
  (FirestoreService as any).verifyGameCanStart || 
    ((gameId: string) => Promise.resolve({ valid: false, errors: ['Not implemented in Firestore'] })) as VerifyGameCanStartFn,
  RTDBService.verifyGameCanStartRTDB
)(gameId); 