"use client"; // Needed for accessing params and potentially hooks later

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'; // Import React, useState, useEffect
import { doc, onSnapshot, collection, query, orderBy, getDocs, where, getDoc } from "firebase/firestore"; // Updated Firestore functions
import { db } from '@/lib/firebase/config'; // Import db instance
import type { Game, Team, Player, Word } from '@/types/firestore'; // Import Game, Team, and Player types
import { addTeamToGame, updatePlayerTeam, addWord, removeWord, addAIWords, getPlayerWords, startGame, addPlayerToGame } from '@/lib/firebase/gameService'; // Import functions
import { GameVerificationService } from '@/lib/firebase/gameVerificationService'; // Import verification service
import toast from 'react-hot-toast';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import Badge from '@/app/components/Badge';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TeamCard from '@/app/components/TeamCard';

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
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
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

    setIsAddingTeam(true);
    setAddTeamError(null);
    try {
      await addTeamToGame(gameId, { name: newTeamName.trim() });
      setNewTeamName(''); // Clear input field on success
    } catch (err) {
      console.error("Failed to add team:", err);
      setAddTeamError(err instanceof Error ? err.message : "Could not add team.");
    } finally {
      setIsAddingTeam(false);
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

    setIsAddingWord(true);
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
    } finally {
      setIsAddingWord(false);
    }
  };

  // Handle adding AI-generated words
  const handleAddAIWords = async () => {
    if (!gameId || !playerId) return;

    setIsAddingAIWords(true);
    setWordError(null);
    try {
      await addAIWords(gameId, playerId);
      // Refresh player words
      const playerWords = await getPlayerWords(gameId, playerId);
      setWords(playerWords);
    } catch (err) {
      console.error("Failed to add AI words:", err);
      setWordError(err instanceof Error ? err.message : "Failed to add AI words.");
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
      <div className="flex justify-center items-center min-h-screen bg-softwhite">
        <LoadingSpinner size="lg" text="Loading game details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-softwhite">
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-softwhite bg-[url('/images/confetti-pattern.svg')] bg-opacity-50">
      <main className="flex flex-col items-center gap-6 p-6 md:p-8 bg-white shadow-2xl rounded-lg w-full max-w-3xl border-t-4 border-coral-500 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-coral-500 text-white py-2 px-6 rounded-t-xl shadow-md text-xl font-bold">
          SQUABBL
        </div>
        
        <div className="w-full flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 mt-2 flex items-center">
            <span className="mr-2">Game Lobby</span>
            <span className="animate-pulse text-sunny-500">🎮</span>
          </h1>
          
          {/* Debug Player ID Badge - Only shown if player has joined */}
          {playerId && (
            <div className="bg-gray-100 border border-gray-300 text-xs p-2 rounded-md">
              <div><strong>Debug Info:</strong></div>
              <div><strong>Player:</strong> {players.find(p => p.id === playerId)?.name || 'Unknown'}</div>
              <div><strong>ID:</strong> <span className="font-mono">{playerId.substring(0, 8) || 'None'}</span></div>
              <div><strong>Host:</strong> {isHost ? 'Yes' : 'No'}</div>
              <div><strong>Team:</strong> {teams.find(t => t.id === players.find(p => p.id === playerId)?.teamId)?.name || 'None'}</div>
            </div>
          )}
        </div>
        
        <p className="text-lg text-slate-800 bg-sky-100 py-1 px-3 rounded-md">Game ID: <code className="font-mono bg-white px-2 py-1 rounded">{gameId}</code></p>

        {/* SCENARIO 1: Game in progress, no player ID (new player) - Show "can't join" message */}
        {!playerId && game && game.state !== 'lobby' && (
          <Card className="w-full bg-gradient-to-r from-red-100 to-white border-l-4 border-red-500 mb-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-6xl">🚫</div>
              <h2 className="text-2xl font-bold text-slate-800">Game Already in Progress</h2>
              <p className="text-slate-800">Sorry, this game has already started and is not accepting new players.</p>
              <Button 
                onClick={() => router.push('/')}
                variant="primary"
                className="mt-4"
                leftIcon={<span>🏠</span>}
              >
                Return to Home Page
              </Button>
            </div>
          </Card>
        )}

        {/* SCENARIO 2: Game in lobby, no player ID (new player) - Show join form and game overview */}
        {!playerId && game && game.state === 'lobby' && (
          <>
            {/* Join Form */}
            <Card title="Join This Game" className="w-full bg-gradient-to-r from-coral-100 to-white border-l-4 border-coral-500 mb-4" icon={<span className="text-xl">🎯</span>}>
              <form onSubmit={handleDirectJoin} className="w-full">
                <div className="flex flex-col space-y-4">
                  <p className="text-slate-800">Enter your name to join this game!</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-300 bg-softwhite"
                      disabled={joining}
                    />
                    <Button
                      type="submit"
                      disabled={joining || !newPlayerName.trim()}
                      isLoading={joining}
                      loadingText="Joining..."
                      leftIcon={<span>👋</span>}
                    >
                      Join Game
                    </Button>
                  </div>
                  
                  {joinError && (
                    <p className="text-red-600 text-sm">{joinError}</p>
                  )}
                </div>
              </form>
            </Card>

            {/* Game Overview */}
            <Card title="Game Overview" className="w-full bg-gradient-to-r from-sky-100 to-white border-l-4 border-sky-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-mint-100 p-4 rounded-lg text-center flex flex-col items-center">
                  <span className="text-2xl mb-2">🏆</span>
                  <span className="text-xl font-bold text-slate-800">{teams.length}</span>
                  <span className="text-sm text-slate-800">Teams</span>
                </div>
                
                <div className="bg-coral-100 p-4 rounded-lg text-center flex flex-col items-center">
                  <span className="text-2xl mb-2">👥</span>
                  <span className="text-xl font-bold text-slate-800">{players.length}</span>
                  <span className="text-sm text-slate-800">Players</span>
                </div>
                
                <div className="bg-sunny-100 p-4 rounded-lg text-center flex flex-col items-center">
                  <span className="text-2xl mb-2">🎲</span>
                  <span className="text-xl font-bold text-slate-800">{allWordsCount}</span>
                  <span className="text-sm text-slate-800">Words</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-slate-800 mb-4">Join this game to participate, add words, and be part of a team!</p>
                <div className="flex justify-center">
                  <div className="bg-softwhite p-3 rounded-md border border-sky-100 inline-block">
                    <p className="text-sm text-slate-800">Share this link with friends:</p>
                    <code className="font-mono text-xs bg-white px-2 py-1 rounded block mt-1">{shareableLink}</code>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Waiting for game to start message */}
            <div className="w-full mt-6 text-center">
              <div className="bg-sky-100 p-4 rounded-lg inline-flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-slate-800">Waiting for the host to start the game...</span>
              </div>
            </div>
          </>
        )}

        {/* SCENARIO 3: Player has joined (has playerID) - Show full lobby UI */}
        {playerId && (
          <>
            {/* Game Details Section */}
            <Card title="Game Details" className="w-full bg-gradient-to-r from-sky-100 to-white border-l-4 border-sky-500">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-slate-800">Share Link:</span>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      readOnly
                      value={shareableLink}
                      className="flex-1 p-2 border-2 border-r-0 rounded-l-md text-sm bg-softwhite focus:outline-none focus:ring-2 focus:ring-coral-300"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button 
                      className="bg-coral-500 text-white px-3 rounded-r-md hover:bg-coral-600 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(shareableLink);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Teams Section */}
            <Card title={`Teams (${teams.length})`} className="w-full bg-gradient-to-r from-mint-100 to-white border-l-4 border-mint-500" icon={<span className="text-xl">🏆</span>}>
              {/* Add Team Form */}
              <form onSubmit={handleAddTeam} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="flex-1 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-300 bg-softwhite"
                    disabled={isAddingTeam}
                  />
                  <Button
                    type="submit"
                    disabled={isAddingTeam || !newTeamName.trim()}
                    isLoading={isAddingTeam}
                    loadingText="Adding..."
                    leftIcon={<span>➕</span>}
                  >
                    Add Team
                  </Button>
                </div>
                {addTeamError && (
                  <p className="mt-2 text-sm text-red-600">{addTeamError}</p>
                )}
              </form>

              {/* Teams List */}
              {teams.length === 0 ? (
                <p className="text-slate-500 italic">No teams created yet. Add at least two teams to start the game.</p>
              ) : (
                <ul className="space-y-3">
                  {teams.map((team, index) => (
                    <li
                      key={team.id}
                      className={`flex justify-between items-center p-3 rounded-md shadow-sm transition-all transform hover:scale-[1.01] hover:shadow-md ${
                        index % 3 === 0 ? 'bg-coral-100' : index % 3 === 1 ? 'bg-sky-100' : 'bg-mint-100'
                      }`}
                    >
                      <span className="font-medium text-slate-800 flex items-center">
                        <span className="text-lg mr-2">{index % 3 === 0 ? '🔴' : index % 3 === 1 ? '🔵' : '🟢'}</span>
                        {team.name}
                      </span>
                      <Badge variant="info" size="sm">
                        {players.filter(p => p.teamId === team.id).length} players
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Players Section */}
            <Card title={`Players (${players.length})`} className="w-full bg-gradient-to-r from-sunny-100 to-white border-l-4 border-sunny-500" icon={<span className="text-xl">👥</span>}>
              {teamChangeError && (
                <p className="text-red-600 text-sm mb-3">{teamChangeError}</p>
              )}
              
              {players.length === 0 && !loading && <p className="text-slate-500 italic">No players have joined yet.</p>}
              {players.length > 0 && (
                <ul className="space-y-3 list-none">
                  {players.map((player) => {
                    // Find the team name based on player.teamId
                    const teamName = teams.find(t => t.id === player.teamId)?.name;
                    const isCurrentPlayer = player.id === selectedPlayerId;
                    const teamColor = teams.findIndex(t => t.id === player.teamId) % 3;
                    const bgColor = teamColor === 0 ? 'bg-coral-100' : teamColor === 1 ? 'bg-sky-100' : 'bg-mint-100';
                    
                    return (
                      <li key={player.id} className={`text-slate-800 ${bgColor} p-3 rounded-md shadow-sm transition-all ${isCurrentPlayer ? 'border-2 border-coral-500' : ''}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium flex items-center">
                            <span className="text-lg mr-2">👤</span>
                            {player.name} 
                            {player.isHost && <Badge variant="warning" size="sm" className="ml-1">Host</Badge>} 
                            {isCurrentPlayer && <Badge variant="primary" size="sm" className="ml-1">You</Badge>}
                          </span>
                          <span className="text-sm text-slate-800 font-medium px-2 py-1 bg-white rounded-full">
                            {teamName ? `${teamName}` : '(No team)'}
                          </span>
                        </div>
                        
                        {/* Team Selection UI - only shown for the current player or for testing */}
                        {isCurrentPlayer && (
                          <div className="mt-2 p-2 bg-white rounded-md shadow-inner">
                            <div className="text-sm text-slate-800 mb-1 font-medium">Select Team:</div>
                            <div className="flex flex-wrap gap-2">
                              {teams.map((team, index) => (
                                <Button
                                  key={team.id}
                                  onClick={() => handleTeamSelect(player.id, team.id)}
                                  disabled={changingTeam || player.teamId === team.id}
                                  variant={player.teamId === team.id ? 'primary' : 'secondary'}
                                  size="sm"
                                  className={player.teamId === team.id ? 'animate-pulse' : ''}
                                >
                                  {team.name}
                                </Button>
                              ))}
                              {player.teamId && (
                                <Button
                                  onClick={() => handleTeamSelect(player.id, null)}
                                  disabled={changingTeam}
                                  variant="danger"
                                  size="sm"
                                >
                                  Leave Team
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Add Words Section */}
            <Card title="Add Words" className="w-full bg-gradient-to-r from-coral-100 to-white border-l-4 border-coral-500" icon={<span className="text-xl">📝</span>}>
              {wordError && (
                <p className="mb-3 text-sm text-red-600">{wordError}</p>
              )}

              {playerId ? (
                <>
                  {/* Word Input Form */}
                  <form onSubmit={handleAddWord} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Enter a word or phrase"
                        className="flex-1 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-300 bg-softwhite"
                        disabled={isAddingWord}
                      />
                      <Button
                        type="submit"
                        disabled={isAddingWord || !newWord.trim()}
                        isLoading={isAddingWord}
                        loadingText="Adding..."
                        leftIcon={<span>✏️</span>}
                      >
                        Add Word
                      </Button>
                    </div>
                  </form>

                  {/* AI Words Button */}
                  <Button
                    onClick={handleAddAIWords}
                    disabled={isAddingAIWords}
                    isLoading={isAddingAIWords}
                    loadingText="Adding AI Words..."
                    variant="success"
                    fullWidth
                    className="mb-4"
                    leftIcon={<span>🤖</span>}
                  >
                    Add 5 Random Words
                  </Button>

                  {/* Player's Words List */}
                  <div className="mt-4 p-3 bg-white rounded-md shadow-inner border border-sky-100">
                    <h3 className="text-md font-medium text-slate-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">🔤</span>
                      Your Words ({words.length})
                    </h3>
                    {words.length === 0 ? (
                      <p className="text-slate-500 italic">You haven't added any words yet.</p>
                    ) : (
                      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {words.map((word, index) => (
                          <li 
                            key={word.id} 
                            className={`flex justify-between items-center p-2 rounded-md shadow-sm transition-all hover:shadow-md ${
                              index % 3 === 0 ? 'bg-coral-100' : index % 3 === 1 ? 'bg-sky-100' : 'bg-mint-100'
                            }`}
                          >
                            <span className="text-slate-800 font-medium">{word.text}</span>
                            <Button
                              onClick={() => handleRemoveWord(word.id)}
                              disabled={isRemovingWord === word.id}
                              isLoading={isRemovingWord === word.id}
                              loadingText="Removing..."
                              variant="danger"
                              size="sm"
                              leftIcon={<span>🗑️</span>}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">Join the game to add words.</p>
              )}
              
              <div className="flex items-center justify-center mt-4 p-2 bg-sky-100 rounded-full">
                <p className="text-sm text-slate-800 font-medium flex items-center">
                  <span className="text-lg mr-2">🎲</span>
                  Total words in pot: 
                  <Badge variant="info" size="md" className="ml-2 text-lg">
                    {allWordsCount}
                  </Badge>
                </p>
              </div>
            </Card>

            {/* Start Game Button - Only shown if in lobby state */}
            {game && game.state === 'lobby' && (
              <div className="w-full mt-6">
                <Button 
                  fullWidth
                  size="lg"
                  disabled={!canStart || isStartingGame}
                  isLoading={isStartingGame}
                  loadingText="Starting Game..."
                  onClick={handleStartGame}
                  className="py-4 text-xl shadow-lg transform transition-transform active:scale-95 border-b-4 border-coral-700"
                  leftIcon={<span className="text-xl">🎮</span>}
                >
                  START GAME
                </Button>
                
                {/* Show error messages from verification service */}
                {startGameErrors.map((error, index) => (
                  <p key={index} className="mt-2 text-sm text-sunny-700 font-medium flex items-center justify-center">
                    <span className="mr-1">⚠️</span> {error}
                  </p>
                ))}
                
                {/* Debug information - remove in production */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Host: {isHost ? 'Yes' : 'No'}</p>
                  <p>Teams: {teams.length}</p>
                  <p>Can Start: {canStart ? 'Yes' : 'No'}</p>
                  <p>Player ID: {playerId}</p>
                </div>
              </div>
            )}
            
            {/* Game Already Started Message - Only shown for joined players if game is not in lobby */}
            {game && game.state !== 'lobby' && (
              <div className="w-full mt-6">
                <Card className="w-full bg-gradient-to-r from-sunny-100 to-white border-l-4 border-sunny-500">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl">🎮</div>
                    <h2 className="text-2xl font-bold text-slate-800">Game Has Started!</h2>
                    <p className="text-slate-800">This game is currently in progress.</p>
                    <Button 
                      onClick={() => router.push(`/game/${gameId}?playerId=${playerId}`)}
                      variant="primary"
                      className="mt-4"
                      leftIcon={<span>▶️</span>}
                    >
                      Go to Game
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
      
      <div className="mt-4 text-center text-slate-800 text-xs">
        <p>Squabbl - The ultimate word guessing party game!</p>
      </div>
    </div>
  );
}
