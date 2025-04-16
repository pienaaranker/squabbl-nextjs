"use client"; // Required for useState and useRouter hooks

import { useState } from "react";
import { useRouter } from "next/navigation";
// Removed Image import as it's not used in the new structure yet
// import Image from "next/image";
import { createNewGame, addHostToGame } from "@/lib/firebase/gameService"; // Add import for addHostToGame

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinGameId, setJoinGameId] = useState('');
  const [hostName, setHostName] = useState(''); // Add state for host name

  const handleCreateGame = async () => {
    // Validate host name is not empty
    if (!hostName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Create the game
      const gameId = await createNewGame();
      
      // Add the current user as the host player
      const playerId = await addHostToGame(gameId, { name: hostName.trim() });
      
      // Redirect to the lobby page for the new game, including playerId
      router.push(`/lobby/${gameId}?playerId=${playerId}`);
    } catch (err) {
      console.error("Failed to create game:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
    // No need to set isLoading to false on success, as we are navigating away
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameId.trim()) {
      router.push(`/join/${joinGameId.trim()}`);
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
          <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-md border border-sky-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mint-700">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Create a New Game</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              Start a new game as the host. You'll get a link to share with friends!
            </p>
            
            {/* Host Name Input */}
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
                disabled={isLoading}
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
          </div>

          {/* Join Game Card */}
          <div className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-md border border-sky-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-sunny-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sunny-700">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Join a Game</h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              Got an invite? Enter the game ID to join an existing game.
            </p>
            
            <form onSubmit={handleJoinGame} className="mt-5">
              <div className="mb-5">
                <label htmlFor="gameId" className="block text-sm font-medium text-slate-600 mb-2">
                  Game ID
                </label>
                <input
                  type="text"
                  id="gameId"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value)}
                  placeholder="Enter game ID"
                  className="w-full p-3 border border-sky-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sunny-300 bg-softwhite placeholder-slate-400"
                />
              </div>
              
              <button
                type="submit"
                disabled={!joinGameId.trim()}
                className="w-full px-6 py-3 text-lg font-semibold text-white bg-sunny-500 rounded-md hover:bg-sunny-600 focus:outline-none focus:ring-2 focus:ring-sunny-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:translate-y-[-2px]"
              >
                Join Game
              </button>
            </form>
          </div>
        </div>
        
        {/* How to Play Section */}
        <div className="mt-12 p-6 bg-sky-50 rounded-lg border border-sky-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-md shadow-sm">
              <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center mb-3">
                <span className="text-coral-700 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Create or Join</h3>
              <p className="text-sm text-slate-600">Create a new game as host or join an existing one with a game ID. Contribute words to the pot!</p>
            </div>
            <div className="p-4 bg-white rounded-md shadow-sm">
              <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center mb-3">
                <span className="text-coral-700 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Form Teams</h3>
              <p className="text-sm text-slate-600">Divide into teams of at least two players each. The host can start the game when ready.</p>
            </div>
            <div className="p-4 bg-white rounded-md shadow-sm">
              <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center mb-3">
                <span className="text-coral-700 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Play 3 Rounds</h3>
              <p className="text-sm text-slate-600">Describe words (Round 1), act them out (Round 2), or give one-word clues (Round 3). Score points for each correct guess!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
