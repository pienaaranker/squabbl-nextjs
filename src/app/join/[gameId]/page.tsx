"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import { addPlayerToGame } from '@/lib/firebase/gameService';
import type { Game } from '@/types/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, springs } from '@/lib/animations';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-lg text-neutral-dark"
          >
            Checking game...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Card className="max-w-md w-full">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold font-poppins text-foreground mt-4 mb-2">
              Unable to Join Game
            </h2>
            <p className="text-neutral-dark mb-6">{error}</p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
              fullWidth
            >
              Return Home
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-[#B0EACD]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#2F4F4F] mb-6 font-fredoka flex items-center justify-center">
              <span className="text-2xl mr-3">🎯</span>
              Join Game
            </h1>
            {game && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.bouncy}
              >
                <p className="text-neutral-dark mb-2 font-nunito">Game Code:</p>
                <div className="bg-[#B0EACD] px-4 py-2 rounded-lg inline-block border-2 border-[#B0EACD]">
                  <span className="font-mono font-bold text-xl text-[#2F4F4F] tracking-wider">
                    {game.code}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-[#2F4F4F] mb-2 font-nunito">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 border-2 border-[#B0EACD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] bg-[#F8F8F8] placeholder-slate-400 font-nunito transition-all duration-200"
                disabled={joining}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={joining || !playerName.trim()}
              isLoading={joining}
              loadingText="Joining..."
              className="w-full py-4 px-6 bg-[#B0EACD] text-[#2F4F4F] font-bold rounded-xl hover:bg-[#9ed9bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-nunito shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <span className="mr-2">🎲</span>
              Join Game
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
} 