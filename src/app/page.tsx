"use client"; // Required for useState and useRouter hooks

import { useState } from "react";
import { useRouter } from "next/navigation";
// Removed Image import as it's not used in the new structure yet
// import Image from "next/image";
import { createNewGame, addHostToGame, findGameByCode } from "@/lib/firebase/gameService";
import { isValidGameCode, formatGameCode } from "@/lib/utils/gameCode";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async () => {
    if (!hostName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Create the game
      const { id: gameId } = await createNewGame();
      
      // Add the current user as the host player
      const playerId = await addHostToGame(gameId, { name: hostName.trim() });
      
      // Redirect to the lobby page for the new game, including playerId
      router.push(`/lobby/${gameId}?playerId=${playerId}`);
    } catch (err) {
      console.error("Failed to create game:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = formatGameCode(joinGameCode.trim());
    
    if (!isValidGameCode(code)) {
      setError("Please enter a valid 4-character game code");
      return;
    }

    setIsJoining(true);
    setError(null);
    
    try {
      const game = await findGameByCode(code);
      if (!game) {
        setError("Game not found. Please check the code and try again.");
        setIsJoining(false);
        return;
      }
      
      router.push(`/join/${game.id}`);
    } catch (err) {
      console.error("Failed to join game:", err);
      setError(err instanceof Error ? err.message : "Failed to join game");
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-softwhite">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4 relative inline-block">
            Squabbl
            <span className="absolute -top-4 -right-4 text-xl text-coral-500">✨</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The fun party word game where teams compete to guess words through 
            description, charades, and one-word clues!
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Create Game Card */}
          <div className="flex-1 p-6 bg-white rounded-xl shadow-lg border border-sky-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Create New Game</h2>
            <div className="mb-5">
              <label htmlFor="hostName" className="block text-sm font-medium text-slate-600 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-300 bg-softwhite placeholder-slate-400"
              />
            </div>
            
            <button
              onClick={handleCreateGame}
              disabled={isLoading || !hostName.trim()}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-coral-500 rounded-md hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:translate-y-[-2px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Game...
                </span>
              ) : "Create New Game"}
            </button>
          </div>

          {/* Join Game Card */}
          <div className="flex-1 p-6 bg-white rounded-xl shadow-lg border border-sky-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Join Game</h2>
            <form onSubmit={handleJoinGame} className="mt-5">
              <div className="mb-5">
                <label htmlFor="gameCode" className="block text-sm font-medium text-slate-600 mb-2">
                  Game Code
                </label>
                <input
                  type="text"
                  id="gameCode"
                  value={joinGameCode}
                  onChange={(e) => setJoinGameCode(e.target.value.toUpperCase())}
                  placeholder="Enter 4-character code"
                  maxLength={4}
                  className="w-full p-3 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sunny-300 bg-softwhite placeholder-slate-400 uppercase"
                />
              </div>
              
              <button
                type="submit"
                disabled={isJoining || !joinGameCode.trim()}
                className="w-full px-6 py-3 text-lg font-semibold text-white bg-sunny-500 rounded-md hover:bg-sunny-600 focus:outline-none focus:ring-2 focus:ring-sunny-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:translate-y-[-2px]"
              >
                {isJoining ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Game...
                  </span>
                ) : "Join Game"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* How to Play Section */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-sky-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Play</h2>
          <div className="space-y-4 text-slate-600">
            <p>1. Create a new game or join an existing one with a 4-character code</p>
            <p>2. Form teams of at least 2 players each</p>
            <p>3. Each player contributes words to the game's word pool</p>
            <p>4. Play through three exciting rounds:</p>
            <ul className="list-disc list-inside pl-4 space-y-2">
              <li>Round 1: Describe the word without saying it</li>
              <li>Round 2: Act out the word (no sounds!)</li>
              <li>Round 3: Give only one word as a clue</li>
            </ul>
            <p>5. The team with the most points at the end wins!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
