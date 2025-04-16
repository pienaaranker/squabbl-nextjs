"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import { addPlayerToGame } from '@/lib/firebase/gameService';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';
// Game type is no longer needed here as we don't access game properties like code
// import type { Game } from '@/types/firestore'; 

export default function JoinGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(true); // Still need loading state for game existence check
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  // const [codeOptions, setCodeOptions] = useState<string[]>([]); // Removed
  // const [correctCode, setCorrectCode] = useState<string>(''); // Removed
  const [gameExists, setGameExists] = useState(false);
  // const [gameName, setGameName] = useState(''); // Removed, not used

  // Removed code generation function: generateCodeOptions

  // Check if game exists
  useEffect(() => {
    const checkGameExists = async () => {
      if (!gameId) {
        setError("No game ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const gameRef = doc(db, "games", gameId);
        const gameSnap = await getDoc(gameRef);
        
        if (gameSnap.exists()) {
          setGameExists(true);
          setError(null);
        } else {
          setError("Game not found");
          setGameExists(false);
        }
      } catch (err) {
        console.error("Error checking game existence:", err);
        setError("Failed to verify game");
      } finally {
        setLoading(false);
      }
    };

    checkGameExists();
  }, [gameId]);

  // Updated handleJoin to remove code verification
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Check if the player name is entered
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    // Removed code check

    setJoining(true);
    setError(null);

    try {
      // Add the player to the game
      const playerId = await addPlayerToGame(gameId, { name: playerName.trim() });
      
      // Redirect to the lobby
      router.push(`/lobby/${gameId}?playerId=${playerId}`);
    } catch (err) {
      console.error("Failed to join game:", err);
      setError(err instanceof Error ? err.message : "Failed to join game");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-softwhite">
        <LoadingSpinner size="lg" text="Loading game details..." />
      </div>
    );
  }

  if (error && !gameExists) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-softwhite">
        <Card className="max-w-md w-full">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/')}
            fullWidth
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-softwhite">
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Join Game</h1>
        
        {/* Form for joining */}
        <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
          {/* Player Name Input */}
          <div className="w-full">
            <label htmlFor="playerName" className="block text-sm font-medium text-slate-800 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral-300 bg-softwhite"
              disabled={joining}
            />
          </div>
          
          {/* Removed Code Selection section */}
          
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={joining || !playerName.trim() || !gameExists}
            isLoading={joining}
            loadingText="Joining..."
            fullWidth
            className="mt-4"
          >
            Join Lobby
          </Button>
          
          {/* Error Message */}
          {error && (
            <p className="w-full mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
        
        {/* Back Button */}
        <Button
          onClick={() => router.push('/')}
          disabled={joining}
          variant="secondary"
          fullWidth
          className="mt-6"
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
} 