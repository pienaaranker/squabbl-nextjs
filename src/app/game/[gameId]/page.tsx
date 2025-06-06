"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, orderBy, where, updateDoc, serverTimestamp, increment } from "firebase/firestore";
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
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';
import { Grid } from '@/app/components/layouts/Grid';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import Timer from '@/app/components/Timer';
import TeamCard from '@/app/components/TeamCard';
import WordCard from '@/app/components/WordCard';
import PauseScreen from '@/app/components/PauseScreen';

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
  
  // Helper to get the current round length from settings (default 60)
  const roundLength = game?.settings?.roundLengthSeconds ?? 60;
  
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
    if (!game?.turnStartTime || game?.turnState === 'paused') {
      // If no turnStartTime is available or game is paused, set a default timer
      setTimeLeft(roundLength);
      setIsTimerRunning(false);
      return;
    }

    // Calculate time left based on turnStartTime
    const calculateTimeLeft = () => {
      const now = Date.now();
      const turnStart = game.turnStartTime || now; // Default to now if turnStartTime is null
      const elapsed = Math.floor((now - turnStart) / 1000);
      const remaining = Math.max(0, roundLength - elapsed);
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
  }, [game?.turnStartTime, isDescriber, roundLength]);
  
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
          
          // Only start the timer if we're not in an active turn
          // This prevents timer reset on refresh
          if (game.turnState !== 'active' || !game.turnStartTime) {
            await startTimer();
          }
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
        
        // Update game state to paused
        const gameRef = doc(db, "games", gameId);
        await updateDoc(gameRef, {
          turnState: 'paused'
        });
        
        toast.error("Time's up! Next team's turn.");
      } catch (error) {
        console.error("Error advancing turn:", error);
        toast.error("Failed to advance to next team");
      }
    }
  };
  
  // Handle starting a new turn from the pause screen
  const handleStartTurn = async () => {
    if (!isDescriber) return;
    
    try {
      // Update game state to active and start the timer
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        turnState: 'active',
        turnStartTime: serverTimestamp()
      });
      
      // Get a new word
      const word = await getRandomUnguessedWord(gameId, game!.currentRound!);
      setCurrentWord(word);
    } catch (error) {
      console.error("Error starting turn:", error);
      toast.error("Failed to start turn");
    }
  };
  
  // Handle correct guess
  const handleCorrectGuess = async () => {
    if (!currentWord || !game?.currentRound || !game.activeTeamId) return;
    
    setIsCorrectGuessProcessing(true);
    try {
      // Mark word as guessed
      await markWordAsGuessed(gameId, currentWord.id, game.currentRound);
      
      // Update team score in the teams subcollection
      const teamRef = doc(db, "games", gameId, "teams", game.activeTeamId);
      await updateDoc(teamRef, {
        score: increment(1)
      });

      // Update last guessed word in the game document
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        lastGuessedWord: {
          text: currentWord.text,
          teamId: game.activeTeamId,
          timestamp: Date.now()
        }
      });
      
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
      }
    } catch (error) {
      console.error("Error handling correct guess:", error);
      toast.error("Failed to process correct guess");
    } finally {
      setIsCorrectGuessProcessing(false);
    }
  };
  
  // Effect to show toast when a word is guessed correctly
  useEffect(() => {
    const lastGuessed = game?.lastGuessedWord;
    if (lastGuessed?.text && lastGuessed.teamId) {
      const activeTeam = teams.find(team => team.id === lastGuessed.teamId);
      toast.success(`${activeTeam?.name} guessed "${lastGuessed.text}" correctly!`);
    }
  }, [game?.lastGuessedWord?.timestamp]);
  
  // Handle skip
  const handleSkip = async () => {
    if (!currentWord || !game?.currentRound) return;
    setIsSkipProcessing(true);
    try {
      // Calculate the new remaining time after penalty
      const now = Date.now();
      const currentTurnStart = game.turnStartTime || now;
      const currentTimeLeft = Math.max(0, roundLength - Math.floor((now - currentTurnStart) / 1000));
      // Use skip penalty from settings (default 10)
      const skipPenalty = game?.settings?.skipPenaltySeconds ?? 10;
      // If penalty would reduce time below 0, end the turn
      if (currentTimeLeft <= skipPenalty) {
        await advanceToNextTeam(gameId);
        setCurrentWord(null);
        toast.error("Time's up! Next team's turn.");
        return;
      }
      // Get a new word for the current team's turn
      const word = await getRandomUnguessedWord(gameId, game.currentRound);
      setCurrentWord(word);
      // Update turnStartTime to apply the skip penalty
      const gameRef = doc(db, "games", gameId);
      const newTurnStart = currentTurnStart - (skipPenalty * 1000); // Subtract skipPenalty seconds
      await updateDoc(gameRef, {
        turnStartTime: newTurnStart
      });
      toast.error(`Word skipped! -${skipPenalty} seconds`);
    } catch (error) {
      console.error("Error handling skip:", error);
      toast.error("Failed to skip word");
    } finally {
      setIsSkipProcessing(false);
    }
  };
  
  // Determine round accent color and icon
  let roundAccent = '#A8DADC'; // Blue for Describe It
  let roundIcon = '🗣️';
  if (game?.currentRound === 2) { roundAccent = '#B0EACD'; roundIcon = '🎭'; }
  if (game?.currentRound === 3) { roundAccent = '#FFD166'; roundIcon = '💭'; }
  
  if (game?.state === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <LoadingSpinner size="lg" text="Redirecting to results..." />
      </div>
    );
  }
  
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
    <motion.div
      className="min-h-screen bg-[#F8F8F8]"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {/* Show pause screen when game is in paused state */}
      {game?.turnState === 'paused' && (
        <PauseScreen
          teamName={getActiveTeamName()}
          playerName={getActivePlayerName()}
          isDescriber={isDescriber}
          onStartTurn={handleStartTurn}
          roundName={getRoundName(game.currentRound)}
          roundInstructions={getRoundInstructions(game.currentRound)}
        />
      )}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-8 w-full">
          {/* Game Info Section */}
          <div className={`p-8 bg-white rounded-2xl shadow-lg border-4`} style={{ borderColor: roundAccent }}>
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className={`text-2xl font-bold mb-2 font-fredoka flex items-center gap-2`} style={{ color: roundAccent }}>
                  <span className="text-2xl">{roundIcon}</span>
                  Round {game?.currentRound || '?'}: {getRoundName(game?.currentRound ?? null)}
                </h2>
                <p className="text-base font-nunito text-[#2F4F4F]">
                  {getRoundInstructions(game?.currentRound ?? null)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="lg" rounded>
                  Words: {wordCounts.guessed}/{wordCounts.total}
                </Badge>
              </div>
            </div>
          </div>
          {/* Main Game Area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Word display */}
            <div className="w-full lg:w-2/3">
              <div className={`p-8 bg-white rounded-2xl shadow-lg border-4`} style={{ borderColor: roundAccent }}>
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
                  totalSeconds={roundLength}
                  skipPenaltySeconds={game?.settings?.skipPenaltySeconds ?? 10}
                />
              </div>
            </div>
            {/* Right Column: Teams and Scoreboard */}
            <div className="w-full lg:w-1/3">
              <div className="p-8 bg-white rounded-2xl shadow-lg border-4 border-[#B0EACD] sticky top-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#B0EACD] font-fredoka flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Teams & Scores
                  </h2>
                </div>
                <div className="space-y-4 max-h-[40vh] lg:max-h-[60vh] overflow-y-auto">
                  {teams.map((team, idx) => {
                    // Filter players for this team
                    const teamPlayers = players.filter(player => player.teamId === team.id);
                    // Find active speaker if they belong to this team
                    const activeSpeakerPlayer = game?.activePlayerId ? 
                      players.find(p => p.id === game.activePlayerId && p.teamId === team.id) : 
                      null;
                    return (
                      <div
                        key={team.id}
                        className={`rounded-xl border-2 p-4 flex items-center gap-4 ${team.id === game?.activeTeamId ? 'border-[#FFD166] bg-[#FFF9E3]' : 'border-[#B0EACD] bg-[#E6FAF3]'}`}
                      >
                        <TeamCard 
                          team={team}
                          players={teamPlayers}
                          isActive={team.id === game?.activeTeamId}
                          activeSpeaker={activeSpeakerPlayer}
                          showScore={false}
                          className="flex-1"
                        />
                        <span className={`text-2xl font-bold font-fredoka ${team.id === game?.activeTeamId ? 'text-[#FFD166]' : 'text-[#2F4F4F]'}`}>{team.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 