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
      
      try {
        const canStartGame = await GameVerificationService.canStartGame(teams, players, gameId, isHost);
        setCanStart(canStartGame);
        
        const errors = await GameVerificationService.getGameStartErrors(teams, players, gameId, isHost);
        setStartGameErrors(errors);
      } catch (err) {
        console.error("Error checking game start conditions:", err);
      }
    };
    
    checkGameStartConditions();
  }, [gameId, teams, players, isHost, playerId, allWordsCount]);

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
      await addWord(gameId, playerId, newWord.trim());
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
      // Pass the current input text as the description
      await addAIWords(gameId, playerId, newWord.trim());
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
        isHost
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
              icon={<span>⚠️</span>}
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
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-[#F8F8F8] p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-fredoka text-[#2F4F4F] flex items-center justify-center">
            <motion.span 
              className="mr-3"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🎲
            </motion.span>
            Game Lobby
            <motion.span 
              className="ml-3"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🎮
            </motion.span>
          </h1>
          {game && (
            <motion.p 
              className="text-xl text-[#2F4F4F] font-nunito"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Game Code: <span className="font-bold bg-[#FFD166] px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">{game.code}</span>
            </motion.p>
          )}
        </motion.div>

        <div className="space-y-8">
          {/* Share Link Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#A8DADC] hover:border-[#B0EACD] transition-all duration-200"
          >
            <h2 className="text-2xl font-bold mb-4 font-fredoka text-[#2F4F4F] flex items-center">
              <motion.span 
                className="mr-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🔗
              </motion.span>
              Share Game
            </h2>
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                readOnly
                value={shareableLink}
                className="flex-1 p-3 bg-[#F8F8F8] border-2 border-[#A8DADC] rounded-xl font-nunito text-[#2F4F4F] focus:border-[#EF798A] focus:ring-2 focus:ring-[#EF798A] transition-all duration-200"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  toast.success('Link copied to clipboard!');
                }}
                className="bg-[#EF798A] text-white px-6 py-3 rounded-xl font-nunito hover:bg-[#e86476] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
              >
                Copy Link
              </Button>
            </div>
          </motion.div>

          {/* Teams Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#B0EACD] hover:shadow-xl transition-all duration-200"
          >
            <h2 className="text-2xl font-bold mb-6 font-fredoka text-[#2F4F4F] flex items-center">
              <motion.span 
                className="mr-2"
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                👥
              </motion.span>
              Teams
            </h2>
            
            {/* Add Team Form */}
            {isHost && (
              <form onSubmit={handleAddTeam} className="mb-6">
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="flex-1 p-3 border-2 border-[#B0EACD] rounded-xl font-nunito focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:border-[#FFD166] bg-[#F8F8F8] transition-all duration-200"
                  />
                  <Button
                    type="submit"
                    disabled={!newTeamName.trim()}
                    className="bg-[#B0EACD] text-[#2F4F4F] px-6 py-3 rounded-xl font-nunito hover:bg-[#9ed9bc] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                  >
                    Add Team
                  </Button>
                </div>
                {addTeamError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-600 font-nunito"
                  >
                    {addTeamError}
                  </motion.p>
                )}
              </form>
            )}

            {/* Teams Grid */}
            <Grid columns={2} className="gap-4">
              <AnimatePresence>
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TeamCard
                      key={team.id}
                      team={team}
                      players={players.filter(p => p.teamId === team.id)}
                      onPlayerJoin={(teamId) => handleTeamSelect(selectedPlayerId!, teamId)}
                      className="border-2 border-[#A8DADC] hover:border-[#B0EACD] transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Grid>
          </motion.div>

          {/* Words Section */}
          <motion.div
            variants={cardVariants}
            className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#FFD166] hover:shadow-xl transition-all duration-200"
          >
            <h2 className="text-2xl font-bold mb-6 font-fredoka text-[#2F4F4F] flex items-center">
              <motion.span 
                className="mr-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                📝
              </motion.span>
              Words
              <Badge className="ml-3 bg-[#FFD166] text-[#2F4F4F] transform hover:scale-105 transition-transform duration-200">
                {allWordsCount} total
              </Badge>
            </h2>

            {/* Word Input Instructions */}
            <div className="mb-6 p-4 bg-[#F8F8F8] rounded-xl border-2 border-[#A8DADC]">
              <p className="text-[#2F4F4F] font-nunito">
                <span className="font-semibold">Add words in two ways:</span>
              </p>
              <ul className="mt-2 space-y-1 text-[#2F4F4F] font-nunito">
                <li className="flex items-center">
                  <span className="mr-2">✏️</span>
                   Individually add words or
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🤖</span>
                  Enter a description and let AI generate words for you
                </li>
              </ul>
            </div>

            {/* Word Input Form */}
            <form onSubmit={handleAddWord} className="mb-6">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Add a word or description"
                  className="flex-1 p-3 border-2 border-[#FFD166] rounded-xl font-nunito focus:outline-none focus:ring-2 focus:ring-[#EF798A] focus:border-[#EF798A] bg-[#F8F8F8] transition-all duration-200"
                />
                <Button
                  type="submit"
                  disabled={!newWord.trim()}
                  className="bg-[#FFD166] text-[#2F4F4F] px-6 py-3 rounded-xl font-nunito hover:bg-[#e5bc5c] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  Add Word ✏️
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAIWords}
                  disabled={isAddingAIWords}
                  className="bg-[#A8DADC] text-[#2F4F4F] px-6 py-3 rounded-xl font-nunito hover:bg-[#97c3c5] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {isAddingAIWords ? (
                    <span className="flex items-center">
                      <LoadingSpinner 
                        size="sm" 
                        color="coral"
                      />
                      <span className="ml-2">Generating Words...</span>
                    </span>
                  ) : (
                    <>
                      Generate Words 🤖
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Words List */}
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {words.map((word) => (
                  <motion.div
                    key={word.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="bg-[#F8F8F8] p-3 rounded-xl border-2 border-[#A8DADC] hover:border-[#EF798A] group transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-nunito text-[#2F4F4F] group-hover:text-[#EF798A] transition-colors duration-200">{word.text}</span>
                      <Button
                        onClick={() => handleRemoveWord(word.id)}
                        disabled={isRemovingWord === word.id}
                        className="p-2 rounded-full text-[#A8DADC] hover:text-[#2F4F4F] hover:bg-[#A8DADC] transition-all duration-200"
                      >
                        {isRemovingWord === word.id ? (
                          <LoadingSpinner 
                            size="sm" 
                            color="coral"
                          />
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2}
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M6 18L18 6M6 6l12 12" 
                            />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Start Game Section */}
          {isHost && (
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#EF798A] text-center hover:shadow-xl transition-all duration-200"
            >
              <Button
                onClick={handleStartGame}
                disabled={!canStart || isStartingGame}
                className="w-full max-w-md bg-[#EF798A] text-white px-8 py-4 rounded-xl font-nunito text-xl hover:bg-[#e86476] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isStartingGame ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner 
                      size="sm" 
                      color="coral"
                    />
                    <span className="ml-2">Starting Game...</span>
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🎮</span>
                    Start Game
                  </>
                )}
              </Button>
              {startGameErrors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <ul className="text-red-700 font-nunito space-y-2">
                    {startGameErrors.map((error, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="mr-2">⚠️</span>
                        {error}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
