"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import type { Game, Team, Player, Word } from '@/types/firestore';
import {
  getGameState,
  getTeamsForGame,
  getRandomUnguessedWord,
  markWordAsGuessed,
  updateTeamScore,
  advanceToNextTeam,
  areAllWordsGuessedInRound,
  advanceToNextRound,
  getWordCountsForRound,
  endGame
} from '@/lib/firebase/gameService';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Timer from '@/app/components/Timer';
import TeamCard from '@/app/components/TeamCard';
import WordCard from '@/app/components/WordCard';
import CurrentTurnInfo from '@/app/components/CurrentTurnInfo';

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');
  const router = useRouter();

  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriber, setIsDescriber] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per turn
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCorrectGuessProcessing, setIsCorrectGuessProcessing] = useState(false);
  const [isSkipProcessing, setIsSkipProcessing] = useState(false);
  const [wordCounts, setWordCounts] = useState<{ guessed: number; total: number }>({ guessed: 0, total: 0 });
  
  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get round display name
  const getRoundName = (round: number | null) => {
    switch (round) {
      case 1: return "Describe It";
      case 2: return "Act It Out";
      case 3: return "One Word";
      default: return "Unknown Round";
    }
  };
  
  // Get round instructions
  const getRoundInstructions = (round: number | null) => {
    switch (round) {
      case 1: 
        return "Describe the word without saying it, using any words except the word itself or derivatives.";
      case 2: 
        return "Act out the word without making any sounds or pointing at objects.";
      case 3: 
        return "Say only ONE word as a clue (not the word itself).";
      default: 
        return "";
    }
  };
  
  // Get the active team name
  const getActiveTeamName = () => {
    if (!game?.activeTeamId) return "Unknown Team";
    const activeTeam = teams.find(team => team.id === game.activeTeamId);
    return activeTeam?.name || "Unknown Team";
  };
  
  // Get the active player name
  const getActivePlayerName = () => {
    if (!game?.activePlayerId) return "Unknown Player";
    const activePlayer = players.find(player => player.id === game.activePlayerId);
    return activePlayer?.name || "Unknown Player";
  };
  
  // Get the current player info
  const getCurrentPlayer = () => {
    if (!playerId) return null;
    return players.find(p => p.id === playerId) || null;
  };
  
  // Get the player's team
  const getPlayerTeam = () => {
    if (!playerId) return null;
    const player = players.find(p => p.id === playerId);
    if (!player?.teamId) return null;
    return teams.find(team => team.id === player.teamId) || null;
  };

  // Check if player is on the active team
  const isOnActiveTeam = () => {
    if (!playerId || !game?.activeTeamId) return false;
    const player = players.find(p => p.id === playerId);
    return player?.teamId === game.activeTeamId;
  };
  
  // Effect to get game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Set up listeners for game, teams, and players
        const gameRef = doc(db, "games", gameId);
        const unsubGame = onSnapshot(gameRef, async (docSnap) => {
          if (docSnap.exists()) {
            const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
            setGame(gameData);
            
            // Check if this player is the current describer
            setIsDescriber(gameData.activePlayerId === playerId);
            
            // If the game is finished, redirect to the results page (to be implemented)
            if (gameData.state === 'finished') {
              router.push(`/results/${gameId}?playerId=${playerId}`);
            }
            
            // Update word counts when the round changes
            if (gameData.currentRound) {
              try {
                const counts = await getWordCountsForRound(gameId, gameData.currentRound);
                setWordCounts(counts);
              } catch (err) {
                console.error("Error getting word counts:", err);
              }
            }
            
            // If turnStartTime is a Firestore timestamp, convert it
            if (gameData.turnStartTime && typeof gameData.turnStartTime === 'object' && 'toMillis' in gameData.turnStartTime) {
              gameData.turnStartTime = (gameData.turnStartTime as any).toMillis();
            }
            
            setError(null);
          } else {
            setError("Game not found.");
            setGame(null);
          }
          setLoading(false);
        });
        
        // Teams listener
        const teamsQuery = query(collection(db, "games", gameId, "teams"), orderBy("name"));
        const unsubTeams = onSnapshot(teamsQuery, (querySnapshot) => {
          const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
          setTeams(teamsData);
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
          // Clear timer if it's running
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        };
      } catch (error) {
        console.error("Error setting up game listeners:", error);
        setError("Failed to load game data.");
        setLoading(false);
      }
    };
    
    fetchGameData();
  }, [gameId, playerId, router]);
  
  // Effect to sync timer with game state
  useEffect(() => {
    if (!game?.turnStartTime) {
      // If no turnStartTime is available, set a default timer
      setTimeLeft(60);
      setIsTimerRunning(false);
      return;
    }

    // Calculate time left based on turnStartTime
    const calculateTimeLeft = () => {
      const now = Date.now();
      const turnStart = game.turnStartTime || now; // Default to now if turnStartTime is null
      const elapsed = Math.floor((now - turnStart) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      return remaining;
    };

    // Initial calculation
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);
    setIsTimerRunning(initialTimeLeft > 0);

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start new timer if there's time left
    if (initialTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          if (isDescriber) {
            handleTimeUp();
          }
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game?.turnStartTime, isDescriber]);
  
  // Function to start the timer
  const startTimer = async () => {
    // Update turnStartTime in Firebase
    try {
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        turnStartTime: serverTimestamp()
      });
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer");
    }
  };
  
  // Effect to get a new word when the active player changes or when a word is guessed/skipped
  useEffect(() => {
    const getNewWord = async () => {
      // Only get a new word if this player is the describer and we're in an active round
      if (isDescriber && game?.currentRound && !currentWord) {
        try {
          const word = await getRandomUnguessedWord(gameId, game.currentRound);
          setCurrentWord(word);
          
          // Start the timer when a new word is fetched
          await startTimer();
        } catch (error) {
          console.error("Error getting random word:", error);
          toast.error("Failed to get a word");
        }
      }
    };
    
    getNewWord();
  }, [gameId, game?.currentRound, isDescriber, currentWord]);
  
  // Handle time up - advance to next team
  const handleTimeUp = async () => {
    if (isDescriber) {
      try {
        await advanceToNextTeam(gameId);
        setCurrentWord(null);
        setIsTimerRunning(false);
        toast.error("Time's up! Next team's turn.");
      } catch (error) {
        console.error("Error advancing turn:", error);
        toast.error("Failed to advance to next team");
      }
    }
  };
  
  // Handle correct guess
  const handleCorrectGuess = async () => {
    if (!currentWord || !game?.currentRound || !game.activeTeamId) return;
    
    setIsCorrectGuessProcessing(true);
    try {
      // Mark word as guessed
      await markWordAsGuessed(gameId, currentWord.id, game.currentRound);
      
      // Update team score
      await updateTeamScore(gameId, game.activeTeamId, 1);
      
      // Check if all words are guessed
      const allGuessed = await areAllWordsGuessedInRound(gameId, game.currentRound);
      
      if (allGuessed) {
        // If this was the final round, end the game
        if (game.currentRound === 3) {
          await endGame(gameId);
          toast.success("Game completed!");
        } else {
          // Otherwise advance to the next round
          await advanceToNextRound(gameId);
          toast.success(`Round ${game.currentRound} completed! Moving to next round.`);
        }
      } else {
        // Get a new word for the current team's turn
        const word = await getRandomUnguessedWord(gameId, game.currentRound);
        setCurrentWord(word);
        
        // Update word counts
        const counts = await getWordCountsForRound(gameId, game.currentRound);
        setWordCounts(counts);
        
        toast.success("Correct! +1 point");
      }
    } catch (error) {
      console.error("Error handling correct guess:", error);
      toast.error("Failed to process correct guess");
    } finally {
      setIsCorrectGuessProcessing(false);
    }
  };
  
  // Handle skip
  const handleSkip = async () => {
    if (!currentWord || !game?.currentRound) return;
    
    setIsSkipProcessing(true);
    try {
      // Skip the word (it stays in the pot)
      
      // Get a new word for the current team's turn
      const word = await getRandomUnguessedWord(gameId, game.currentRound);
      setCurrentWord(word);
      
      // Apply time penalty (10 seconds)
      setTimeLeft(prev => Math.max(0, prev - 10));
      
      toast.error("Word skipped! -10 seconds");
    } catch (error) {
      console.error("Error handling skip:", error);
      toast.error("Failed to skip word");
    } finally {
      setIsSkipProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-softwhite p-6 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" text="Loading game..." />
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
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Squabbl</h1>
          
          {/* Debug Player ID Badge */}
          <div className="bg-gray-100 border border-gray-300 text-xs p-2 rounded-md">
            <div><strong>Debug Info:</strong></div>
            <div><strong>Player:</strong> {getCurrentPlayer()?.name || 'Unknown'}</div>
            <div><strong>ID:</strong> <span className="font-mono">{playerId?.substring(0, 8) || 'None'}</span></div>
            <div><strong>Host:</strong> {getCurrentPlayer()?.isHost ? 'Yes' : 'No'}</div>
            <div><strong>Team:</strong> {getPlayerTeam()?.name || 'None'}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-xl font-semibold text-slate-800">
            Round {game?.currentRound || '?'}: {getRoundName(game?.currentRound ?? null)}
          </h2>
          <Badge variant="info" size="lg" rounded>
            Words: {wordCounts.guessed}/{wordCounts.total}
          </Badge>
        </div>
        <p className="text-slate-600 mt-1">{getRoundInstructions(game?.currentRound ?? null)}</p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Timer and Word display */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Word Card with unified component */}
          <WordCard 
            isDescriber={isDescriber}
            isOnActiveTeam={isOnActiveTeam()}
            currentWord={currentWord}
            activePlayerName={getActivePlayerName()}
            onCorrectGuess={handleCorrectGuess}
            onSkip={handleSkip}
            isCorrectGuessProcessing={isCorrectGuessProcessing}
            isSkipProcessing={isSkipProcessing}
            seconds={timeLeft}
            totalSeconds={60}
            className="mb-6"
          />
          
          {/* Current Turn Info */}
          <CurrentTurnInfo 
            teamName={getActiveTeamName()}
            playerName={getActivePlayerName()}
            isCurrentPlayer={isDescriber}
            seconds={timeLeft}
            totalSeconds={60}
            className="mb-6"
          />
        </div>
        
        {/* Right column: Teams and Scoreboard */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <Card title="Teams & Scores">
            <div className="space-y-4">
              {teams.map(team => (
                <TeamCard 
                  key={team.id}
                  team={team}
                  players={players}
                  isActive={team.id === game?.activeTeamId}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 