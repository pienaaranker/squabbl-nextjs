"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import type { Game, Team, Player } from '@/types/firestore';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TeamCard from '@/app/components/TeamCard';
import dynamic from 'next/dynamic';
import { useWindowSize } from '@/lib/hooks/useWindowSize';

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function ResultsPage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');
  const router = useRouter();
  const { width, height } = useWindowSize();

  // State for game data
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winningTeam, setWinningTeam] = useState<Team | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Effect to manage confetti duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 30000); // Show confetti for 30 seconds

    return () => clearTimeout(timer);
  }, []);

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
  }, [gameId, playerId, router]);

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

  // Get player name
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || "Unknown Player";
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6">
      {showConfetti && !loading && !error && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          colors={['#A8DADC', '#B0EACD', '#FFD166', '#EF798A']}
        />
      )}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#A8DADC] mb-2 font-fredoka flex items-center justify-center gap-3">
          <span className="text-4xl md:text-5xl">🎉</span>
          Game Results
        </h1>
        <p className="text-xl text-[#2F4F4F] font-nunito">Congratulations to all players!</p>
      </header>

      <div className="max-w-2xl mx-auto mb-10 p-8 bg-white rounded-2xl shadow-lg border-4 border-[#A8DADC]">
        {winningTeam && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#A8DADC] mb-4 font-fredoka flex items-center justify-center gap-2">
              <span className="text-3xl">🏆</span>
              Winner
            </h2>
            <div className="p-6 bg-[#FFF9E3] rounded-xl border-2 border-[#FFD166] mb-4">
              <p className="text-3xl font-bold text-[#2F4F4F] font-fredoka mb-2">{winningTeam.name}</p>
              <p className="text-xl text-[#2F4F4F] font-nunito">Score: {winningTeam.score}</p>
              <p className="mt-2 text-[#2F4F4F] font-nunito">
                Team Members: {
                  players
                    .filter(p => p.teamId === winningTeam.id)
                    .map(p => p.name)
                    .join(', ')
                }
              </p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-[#B0EACD] mb-6 font-fredoka flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Final Scores
        </h2>
        <div className="space-y-4 mb-10">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className={`rounded-xl border-2 p-4 flex items-center gap-4 ${index === 0 ? 'border-[#FFD166] bg-[#FFF9E3]' : 'border-[#B0EACD] bg-[#E6FAF3]'}`}
            >
              <TeamCard
                team={team}
                players={players.filter(p => p.teamId === team.id)}
                isActive={index === 0}
                className="flex-1"
              />
              <span className={`text-2xl font-bold font-fredoka ${index === 0 ? 'text-[#FFD166]' : 'text-[#2F4F4F]'}`}>{team.score}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handlePlayAgain}
            className="w-full max-w-xs py-4 px-8 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-colors duration-200 shadow-md hover:shadow-lg font-nunito text-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🔄</span>
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
} 