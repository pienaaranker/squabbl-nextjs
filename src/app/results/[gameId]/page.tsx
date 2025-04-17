"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import type { Game, Team, Player } from '@/types/firestore';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TeamCard from '@/app/components/TeamCard';

export default function ResultsPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');
  const router = useRouter();

  // State for game data
  // State for tracking whether data is successfully retrieved
  const setGame = useState<Game | null>(null)[1];
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winningTeam, setWinningTeam] = useState<Team | null>(null);

  // Effect to fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Game document listener
        const gameRef = doc(db, "games", gameId);
        const unsubGame = onSnapshot(gameRef, (docSnap) => {
          if (docSnap.exists()) {
            const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
            setGame(gameData);
            
            // Ensure the game is finished
            if (gameData.state !== 'finished') {
              router.push(`/game/${gameId}?playerId=${playerId}`);
            }
            
            setError(null);
          } else {
            setError("Game not found.");
            setGame(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error getting game:", err);
          setError("Error loading game data.");
          setLoading(false);
        });

        // Teams listener
        const teamsQuery = query(collection(db, "games", gameId, "teams"), orderBy("score", "desc"));
        const unsubTeams = onSnapshot(teamsQuery, (querySnapshot) => {
          const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
          setTeams(teamsData);
          
          // Determine winning team (highest score)
          if (teamsData.length > 0) {
            setWinningTeam(teamsData[0]); // First team is highest score due to desc order
          }
        }, (err) => {
          console.error("Error fetching teams:", err);
          setError("Failed to load team scores.");
        });

        // Players listener
        const playersQuery = query(collection(db, "games", gameId, "players"));
        const unsubPlayers = onSnapshot(playersQuery, (querySnapshot) => {
          const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
          setPlayers(playersData);
        });

        return () => {
          unsubGame();
          unsubTeams();
          unsubPlayers();
        };
      } catch (error) {
        console.error("Error fetching game data:", error);
        setError("Failed to load game results.");
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, playerId, router, setGame]);

  // Function to start a new game
  const handlePlayAgain = () => {
    router.push('/'); // Go back to home page to create a new game
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-softwhite p-6 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Loading results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-softwhite p-6 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/')}
            fullWidth
          >
            Return Home
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-softwhite p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Game Results</h1>
        <p className="text-xl text-slate-600">Congratulations to all players!</p>
      </header>

      <Card className="max-w-2xl mx-auto mb-8">
        {winningTeam && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Winner</h2>
            <Card className="bg-sunny-100 border-2 border-sunny-300">
              <p className="text-3xl font-bold text-slate-800">{winningTeam.name}</p>
              <p className="text-xl text-slate-700">Score: {winningTeam.score}</p>
              <p className="mt-2 text-slate-600">
                Team Members: {
                  players
                    .filter(p => p.teamId === winningTeam.id)
                    .map(p => p.name)
                    .join(', ')
                }
              </p>
            </Card>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-4">Final Scores</h2>
        <div className="space-y-4 mb-8">
          {teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              players={players}
              isActive={index === 0}
              className={index === 0 ? 'bg-sky-100' : ''}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handlePlayAgain}
            variant="primary"
            size="lg"
          >
            Play Again
          </Button>
        </div>
      </Card>
    </div>
  );
} 