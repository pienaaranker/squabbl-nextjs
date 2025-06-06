"use client"; // Needed for accessing params and potentially hooks later

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect
import { doc, onSnapshot, collection, query, orderBy, getDocs, where, getDoc } from "firebase/firestore"; // Updated Firestore functions
import { db } from '@/lib/firebase/config'; // Import db instance
import type { Game, Team, Player, Word } from '@/types/firestore'; // Import Game, Team, and Player types
import { addTeamToGame, updatePlayerTeam, addWord, removeWord, addAIWords, getPlayerWords, startGame, addPlayerToGame } from '@/lib/firebase/gameService'; // Import functions
import { GameVerificationService } from '@/lib/firebase/gameVerificationService'; // Import verification service
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, cardVariants, listItemVariants, springs } from '@/lib/animations';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TeamCard from '@/app/components/TeamCard';
import { Grid } from '@/app/components/layouts/Grid';
import { AnimatedIcon } from '@/app/components/ui';
import LobbySettings from './LobbySettings';

export default function LobbyPage() {
  const params = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const gameId = params.gameId;
  const playerId = searchParams.get('playerId');
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true); // Combined loading state for initial game fetch
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState('');
  const [teams, setTeams] = useState<Team[]>([]); // State for teams
  const [players, setPlayers] = useState<Player[]>([]); // Add state for players
  const [words, setWords] = useState<Word[]>([]); // Player's words
  const [allWordsCount, setAllWordsCount] = useState(0); // Total word count
  const [newTeamName, setNewTeamName] = useState('');
  const [newWord, setNewWord] = useState('');
  const [isAddingAIWords, setIsAddingAIWords] = useState(false);
  const [isRemovingWord, setIsRemovingWord] = useState<string | null>(null);
  const [addTeamError, setAddTeamError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(playerId);
  const [changingTeam, setChangingTeam] = useState(false);
  const [teamChangeError, setTeamChangeError] = useState<string | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [startGameErrors, setStartGameErrors] = useState<string[]>([]);
  const [canStart, setCanStart] = useState<boolean>(false);

  // Helper to get the current word limit from settings (default 5)
  const wordLimit = game?.settings?.wordCountPerPerson ?? 5;
  const playerOverLimit = words.length > wordLimit;

  // Effect for setting shareable link
  useEffect(() => {
    if (gameId) {
      const fetchGame = async () => {
        try {
          const gameDoc = await getDoc(doc(db, "games", gameId));
          if (gameDoc.exists()) {
            const gameData = { id: gameDoc.id, ...gameDoc.data() } as Game;
            setGame(gameData);
            
            // Set shareable info with game code
            const origin = window.location.origin;
            setShareableLink(`${origin}/join/${gameId}`);
          } else {
            setError("Game not found");
          }
        } catch (err) {
          console.error("Error fetching game:", err);
          setError("Failed to load game");
        } finally {
          setLoading(false);
        }
      };

      fetchGame();
    }
  }, [gameId]);

  // Effect for subscribing to game, players, teams data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Reference to the game document
        const gameRef = doc(db, "games", gameId);
        // Set up a real-time listener for the game
        const unsubGameSnap = onSnapshot(gameRef, async (docSnap) => {
          if (docSnap.exists()) {
            // Get the game data
            const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
            
            // Check if game state changed from lobby to a round state
            const previousGameState = game?.state;
            
            // Update the game state in component
            setGame(gameData);
            setError(null);
            
            // Auto-redirect when game starts (state changes from 'lobby' to 'round1')
            if (previousGameState === 'lobby' && gameData.state === 'round1') {
              console.log("🎮 Game started! Redirecting to game screen...");
              toast.success("Game started! Redirecting to game screen...");
              router.push(`/game/${gameId}?playerId=${playerId}`);
              return; // Exit early as we're navigating away
            }
            
            // For host status check, we need to check the player document
            if (playerId) {
              console.log("🔍 Checking host status for playerId:", playerId);
              const playerRef = doc(db, "games", gameId, "players", playerId);
              const playerDoc = await getDoc(playerRef);
              
              if (playerDoc.exists()) {
                const playerData = { id: playerDoc.id, ...playerDoc.data() } as Player;
                console.log("📋 Player data:", playerData);
                setIsHost(playerData.isHost || false);
                console.log("👑 Is Host set to:", playerData.isHost || false);
              } else {
                console.log("❌ Player document with ID not found, falling back to query");
                // This is a fallback but should be unnecessary if the document exists at the correct path
                const playersQuery = query(collection(db, "games", gameId, "players"));
                const playersSnapshot = await getDocs(playersQuery);
                console.log("📋 All players:", playersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                
                const matchingPlayers = playersSnapshot.docs
                  .map(doc => ({ id: doc.id, ...doc.data() } as Player))
                  .filter(p => p.id === playerId);
                
                console.log("🔍 Matching players by ID:", matchingPlayers);
                
                if (matchingPlayers.length > 0) {
                  setIsHost(matchingPlayers[0].isHost || false);
                  console.log("👑 Is Host set to:", matchingPlayers[0].isHost || false);
                } else {
                  console.log("⚠️ No player found with ID:", playerId);
                  setIsHost(false);
                }
              }
            } else {
              console.log("❓ No playerId available for host check");
              setIsHost(false);
            }
          } else {
            setError("Game not found.");
            setGame(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error getting game:", err);
          setError("Error loading game.");
          setLoading(false);
        });

        // Fetch teams
        const teamsQuery = query(collection(db, "games", gameId, "teams"), orderBy("name"));
        const unsubscribeTeams = onSnapshot(teamsQuery, (querySnapshot) => {
          const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
          setTeams(teamsData);
        }, (err) => {
          console.error("Error fetching teams:", err);
          setError("Failed to load team list.");
        });

        // Fetch players
        const playersQuery = query(collection(db, "games", gameId, "players"), orderBy("joinedAt"));
        const unsubscribePlayers = onSnapshot(playersQuery, (querySnapshot) => {
          const playersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
          setPlayers(playersData);
        }, (err) => {
          console.error("Error fetching players:", err);
          // Optionally set a specific error state for players
          setError("Failed to load player list.");
        });

        // Fetch total word count
        const wordsCollectionRef = collection(db, "games", gameId, "words");
        const unsubscribeWords = onSnapshot(wordsCollectionRef, (snapshot) => {
          setAllWordsCount(snapshot.size);
        }, (err) => {
          console.error("Error getting word count:", err);
        });

        return () => {
          unsubGameSnap();
          unsubscribeTeams();
          unsubscribePlayers();
          unsubscribeWords();
        };
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to load game data.");
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, playerId]);

  // Effect to check if the game can be started
  useEffect(() => {
    const checkGameStartConditions = async () => {
      if (!gameId || !playerId) return;
      let errors: string[] = [];
      // Check if any player exceeds the word limit
      players.forEach((player) => {
        const playerWords = words;
        if (player.id === playerId && playerWords.length > wordLimit) {
          errors.push('You have more words than the current limit. Please remove words to match the new limit.');
        }
      });
      try {
        const canStartGame = await GameVerificationService.canStartGame(teams, players, gameId, isHost, wordLimit);
        setCanStart(canStartGame && errors.length === 0);
        const backendErrors = await GameVerificationService.getGameStartErrors(teams, players, gameId, isHost, wordLimit);
        setStartGameErrors([...errors, ...backendErrors]);
      } catch (err) {
        console.error("Error checking game start conditions:", err);
      }
    };
    checkGameStartConditions();
  }, [gameId, teams, players, isHost, playerId, allWordsCount, words.length, wordLimit]);

  // Effect for checking if the game has started and handling reconnection vs. new joins
  useEffect(() => {
    if (game && game.state !== 'lobby') {
      console.log("🎮 Game already in progress");
      
      // If this is a player who already joined (has playerId), redirect them to the game
      if (playerId) {
        console.log("🔄 Existing player reconnecting, redirecting to game screen...");
        toast.success("Reconnecting to game in progress...");
        router.push(`/game/${gameId}?playerId=${playerId}`);
      }
      // If this is a new player trying to join (no playerId), show game in progress message
      // The UI will handle showing the appropriate message based on game state
    }
  }, [game, gameId, router, playerId]);

  // Handler for adding a new team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !gameId) return;

    try {
      await addTeamToGame(gameId, { name: newTeamName.trim() });
      setNewTeamName(''); // Clear input field on success
    } catch (err) {
      console.error("Failed to add team:", err);
      setAddTeamError(err instanceof Error ? err.message : "Could not add team.");
    }
  };

  // Handle team selection for a player
  const handleTeamSelect = async (playerId: string, teamId: string | null) => {
    if (!gameId) return;

    setChangingTeam(true);
    setTeamChangeError(null);
    try {
      await updatePlayerTeam(gameId, playerId, teamId);
    } catch (err) {
      console.error("Failed to update player team:", err);
      setTeamChangeError(err instanceof Error ? err.message : "Could not update team.");
    } finally {
      setChangingTeam(false);
    }
  };

  // Effect for fetching player's words
  useEffect(() => {
    if (!gameId || !playerId) return;

    const fetchPlayerWords = async () => {
      try {
        const playerWords = await getPlayerWords(gameId, playerId);
        setWords(playerWords);
      } catch (err) {
        console.error("Error fetching player words:", err);
        setWordError("Failed to load your words.");
      }
    };

    fetchPlayerWords();
  }, [gameId, playerId]);

  // Handle adding a new word
  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !gameId || !playerId) return;
    setWordError(null);
    try {
      await addWord(gameId, playerId, newWord.trim(), wordLimit);
      setNewWord(''); // Clear input field
      // Refresh player words
      const playerWords = await getPlayerWords(gameId, playerId);
      setWords(playerWords);
    } catch (err) {
      console.error("Failed to add word:", err);
      setWordError(err instanceof Error ? err.message : "Failed to add word.");
    }
  };

  // Handle adding AI-generated words
  const handleAddAIWords = async () => {
    if (!gameId || !playerId) return;
    setIsAddingAIWords(true);
    setWordError(null);
    try {
      // Only generate up to the remaining allowed words
      const remaining = wordLimit - words.length;
      if (remaining <= 0) {
        setWordError(`You have reached the word limit (${wordLimit}). Remove words to add more.`);
        setIsAddingAIWords(false);
        return;
      }
      // Pass the current input text as the description
      await addAIWords(gameId, playerId, newWord.trim(), remaining, wordLimit);
      // Clear input field after successful generation
      setNewWord('');
      // Refresh player words
      const playerWords = await getPlayerWords(gameId, playerId);
      setWords(playerWords);
      toast.success('AI generated words added successfully!');
    } catch (err) {
      console.error("Failed to add AI words:", err);
      setWordError(err instanceof Error ? err.message : "Failed to add AI words.");
      toast.error('Failed to generate words. Please try again.');
    } finally {
      setIsAddingAIWords(false);
    }
  };

  // Handle removing a word
  const handleRemoveWord = async (wordId: string) => {
    if (!gameId || !playerId) return;

    setIsRemovingWord(wordId);
    setWordError(null);
    try {
      await removeWord(gameId, wordId, playerId);
      // Refresh player words
      const playerWords = await getPlayerWords(gameId, playerId);
      setWords(playerWords);
    } catch (err) {
      console.error("Failed to remove word:", err);
      setWordError(err instanceof Error ? err.message : "Failed to remove word.");
    } finally {
      setIsRemovingWord(null);
    }
  };

  // Add startGame function
  const handleStartGame = async () => {
    console.log("🎮 Attempting to start game");
    console.log("Is Host:", isHost);
    console.log("Teams:", teams);
    console.log("Players:", players);
    console.log("Words:", words);
    setIsStartingGame(true);
    try {
      // Use the verification service
      console.log("🔍 Running validation checks");
      const verificationResult = await GameVerificationService.verifyGameCanStart(
        gameId,
        teams,
        players,
        isHost,
        wordLimit
      );
      if (!verificationResult.valid) {
        // Show the first error to the user
        console.error("❌ Validation failed:", verificationResult.errors);
        toast.error(verificationResult.errors[0]);
        setIsStartingGame(false);
        return;
      }
      console.log("✅ Validation passed, starting game");
      await startGame(gameId);
      console.log("🚀 Game started successfully!");
      // Redirect to the game page with playerId
      router.push(`/game/${gameId}?playerId=${playerId}`);
    } catch (error) {
      console.error("❌ Error starting game:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start game");
      setIsStartingGame(false);
    }
  };

  // Handler for joining the game from the lobby
  const handleDirectJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !gameId) return;

    setJoining(true);
    setJoinError(null);
    try {
      // Add the player to the game
      const playerId = await addPlayerToGame(gameId, { name: newPlayerName.trim() });
      
      // Navigate to the same page but with playerId as a query parameter
      router.push(`/lobby/${gameId}?playerId=${playerId}`);
    } catch (err) {
      console.error("Failed to join game:", err);
      setJoinError(err instanceof Error ? err.message : "Failed to join game");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-lg text-neutral-dark"
            >
              Loading game...
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AnimatedIcon
              icon="⚠️"
              color="coral"
              size="xl"
              animation="wiggle"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-lg text-red-500"
            >
              {error}
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-softwhite">
        <Card className="max-w-md w-full">
          <p className="text-xl text-red-600 mb-4">Game not found</p>
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
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-4 w-full">
          {/* Game Info Section */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-[#A8DADC] mb-4">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-[#2F4F4F] mb-2 font-fredoka flex items-center">
                  <span className="text-2xl mr-3">🎲</span>
                  Game Lobby
                </h2>
                <p className="text-base font-medium text-primary font-nunito">Share code: <span className="font-bold">{game?.code}</span></p>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* Show Copy button if native share is NOT available */}
                {!navigator.share && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(shareableLink);
                      toast.success('Link copied to clipboard!');
                    }}
                    leftIcon={<span>📋</span>}
                    className="w-full md:w-auto"
                  >
                    Copy Invite Link
                  </Button>
                )}
                {/* Show Share button if native share IS available */}
                {navigator.share && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      try {
                        navigator.share({
                          title: game?.code ? `Join Squabbl Game ${game.code}` : 'Join Squabbl Game',
                          text: 'Come join my Squabbl game!',
                          url: shareableLink,
                        });
                      } catch (error) {
                        console.error('Error sharing:', error);
                        toast.error('Could not share link.');
                      }
                    }}
                    leftIcon={<img src="/share.png" alt="Share" className="w-5 h-5" />}
                    className="w-full md:w-auto"
                  >
                    Share Invite Link
                  </Button>
                )}
                {isHost && (
                  <Button
                    variant="primary"
                    onClick={handleStartGame}
                    isLoading={isStartingGame}
                    disabled={!canStart || isStartingGame}
                    leftIcon={<span>🎮</span>}
                    className="w-full md:w-auto"
                  >
                    Start Game
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Teams Management Card */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-[#B0EACD] mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <h2 className="text-2xl font-bold text-[#2F4F4F] mb-2 font-fredoka flex items-center">
                <span className="text-2xl mr-3">👥</span>
                Teams
              </h2>
              {isHost && (
                <form onSubmit={handleAddTeam} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full p-4 border-2 border-[#A8DADC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8DADC] bg-[#F8F8F8] placeholder-slate-400 font-nunito transition-all duration-200"
                    placeholder="Team name"
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isAddingAIWords}
                    className="w-full md:w-auto"
                  >
                    Add Team
                  </Button>
                </form>
              )}
            </div>
            <AnimatePresence>
              {teams.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center"
                >
                  <p className="text-neutral-600 mb-2">No teams have been created yet.</p>
                  {isHost ? (
                    <p className="text-sm text-neutral-500">Start by creating at least two teams above!</p>
                  ) : (
                    <p className="text-sm text-neutral-500">Wait for the host to create teams, then you can join one.</p>
                  )}
                </motion.div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      variants={listItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <TeamCard
                        team={team}
                        players={players.filter(p => p.teamId === team.id)}
                        onPlayerJoin={(teamId: string) => handleTeamSelect(selectedPlayerId!, teamId)}
                        isLoading={changingTeam && selectedPlayerId === playerId}
                        isActive={players.find(p => p.id === selectedPlayerId)?.teamId === team.id}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Player Word Management Card */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border-2 border-[#FFD166] mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#2F4F4F] font-fredoka flex items-center">
                <span className="text-2xl mr-3">📝</span>
                Add Words
              </h2>
              <span className="text-xl font-bold text-neutral-dark font-nunito">({words.length}/{wordLimit})</span>
            </div>
            <form onSubmit={handleAddWord} className="mb-2">
              <p className="text-sm text-neutral-dark mb-2 font-nunito">
                Enter a word to add manually, or describe words you'd like AI to generate (max {wordLimit} words per player)
              </p>
              <div className="flex flex-col md:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full p-4 border-2 border-[#B0EACD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] bg-[#F8F8F8] placeholder-slate-400 font-nunito transition-all duration-200"
                  placeholder="e.g., 'beach' or 'summer vacation words'"
                  disabled={words.length >= wordLimit || playerOverLimit}
                />
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isAddingAIWords}
                    className="w-full md:w-auto"
                    rightIcon={<span>✏️</span>}
                    disabled={!newWord.trim() || words.length >= wordLimit || isAddingAIWords || playerOverLimit}
                  >
                    Add Word
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleAddAIWords}
                    disabled={isAddingAIWords || !playerId || game?.state !== 'lobby' || words.length >= wordLimit || playerOverLimit}
                    className="w-full md:w-auto"
                    rightIcon={<AnimatedIcon icon="🤖" />}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </form>
            {/* Warning if player is over the limit */}
            {playerOverLimit && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 mb-2 text-yellow-800 font-nunito">
                You have more words than the current limit ({wordLimit}). Please remove words to match the new limit.
              </div>
            )}
            {/* Display Existing Player Words */}
            <AnimatePresence>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                {words.map((word, index) => (
                  <motion.div
                    key={word.id}
                    variants={listItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative group bg-white rounded-lg border-2 border-neutral-light hover:border-primary transition-colors p-2 flex justify-between items-center"
                  >
                    <p className="font-medium text-sm break-all pr-2 font-nunito">{word.text}</p>
                    <motion.button
                      className="p-1.5 rounded-full text-neutral hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => handleRemoveWord(word.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Remove word ${word.text}`}
                      disabled={isRemovingWord === word.id}
                    >
                      { isRemovingWord === word.id ? <LoadingSpinner size="sm" /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            {wordError && <p className="text-red-500 text-sm mt-2 font-nunito">{wordError}</p>}
          </div>
          {/* Lobby Settings Card (host only, below Add Words) */}
          <LobbySettings
            gameId={gameId}
            initialSettings={game?.settings}
            isHost={isHost}
          />
          {/* Game Start Requirements */}
          {startGameErrors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 font-nunito animate-shake">
              <h3 className="text-sm font-semibold text-red-700 mb-2">
                Before starting the game:
              </h3>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                {startGameErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
