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
import { AnimatedIcon } from '@/app/components/ui';

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
            <AnimatedIcon
              icon="⚠️"
              color="coral"
              size="xl"
              animation="wiggle"
            />
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
      className="min-h-screen bg-background flex items-center justify-center p-4"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Card className="max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <AnimatedIcon
              icon="🎮"
              color="sky"
              size="lg"
              animation="bounce"
            />
            <h1 className="text-2xl font-bold font-poppins text-foreground mt-4 mb-2">
              Join Game
            </h1>
            {game && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.bouncy}
              >
                <p className="text-neutral-dark mb-2">Game Code:</p>
                <div className="bg-sky-100 px-4 py-2 rounded-lg inline-block border-2 border-sky-200">
                  <span className="font-mono font-bold text-xl text-sky-800">
                    {game.code}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-neutral-dark mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border-2 border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white placeholder-neutral-dark"
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
              fullWidth
              size="lg"
            >
              Join Game
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
} 