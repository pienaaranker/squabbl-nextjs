"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import { addPlayerToGame } from '@/lib/firebase/gameService';
import type { Game } from '@/types/firestore';

export default function JoinGamePage() {
  const params = useParams<{ gameId: string }>();
  const router = useRouter();
  const gameId = params.gameId;

  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const checkGame = async () => {
      if (!gameId) {
        setError("No game ID provided");
        setLoading(false);
        return;
      }

      try {
        const gameRef = doc(db, "games", gameId);
        const gameSnap = await getDoc(gameRef);
        
        if (gameSnap.exists()) {
          const gameData = { id: gameId, ...gameSnap.data() } as Game;
          if (gameData.state === 'lobby') {
            setGame(gameData);
            setError(null);
          } else {
            setError("This game has already started");
          }
        } else {
          setError("Game not found");
        }
      } catch (err) {
        console.error("Error checking game:", err);
        setError("Failed to verify game");
      } finally {
        setLoading(false);
      }
    };

    checkGame();
  }, [gameId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !gameId) return;

    setJoining(true);
    setError(null);
    try {
      const playerId = await addPlayerToGame(gameId, { name: playerName.trim() });
      router.push(`/lobby/${gameId}?playerId=${playerId}`);
    } catch (err) {
      console.error("Failed to join game:", err);
      setError(err instanceof Error ? err.message : "Failed to join game");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-softwhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-softwhite flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to Join Game</h2>
            <p className="text-slate-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-softwhite flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Join Game</h1>
          {game && (
            <div className="mb-4">
              <p className="text-slate-600 mb-2">Game Code:</p>
              <div className="bg-sky-100 px-4 py-2 rounded-md inline-block">
                <span className="font-mono font-bold text-xl text-sky-800">
                  {game.code}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-slate-600 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300 bg-softwhite placeholder-slate-400"
              disabled={joining}
              required
            />
          </div>

          <button
            type="submit"
            disabled={joining || !playerName.trim()}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-sunny-500 rounded-md hover:bg-sunny-600 focus:outline-none focus:ring-2 focus:ring-sunny-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {joining ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              "Join Game"
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 