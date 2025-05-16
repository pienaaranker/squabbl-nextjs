"use client"; // Required for useState and useRouter hooks

// import type { Metadata } from 'next'; // Removed import for Metadata
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Removed Image import as it's not used in the new structure yet
// import Image from "next/image";
import { createNewGame, addHostToGame, findGameByCode } from "@/lib/firebase/gameService";
import { isValidGameCode, formatGameCode } from "@/lib/utils/gameCode";
import { getFeatureFlag } from "@/lib/firebase/featureService";

// Removed page-specific metadata export as this is a Client Component
// export const metadata: Metadata = {
//   title: 'Squabbl - Play The Ultimate Party Word Game Online',
//   description: 'Create or join Squabbl games online! Describe, act out, and guess words in three exciting rounds. Fun for teams and parties.',
//   alternates: {
//     canonical: 'https://www.yourdomain.com', // Replace with your actual domain
//   },
// };

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showDonationButton, setShowDonationButton] = useState(false);

  useEffect(() => {
    // Check if donations feature is enabled
    const checkDonationsFeature = async () => {
      console.log("Checking donations feature flag...");
      const isEnabled = await getFeatureFlag('donations.active');
      console.log("Donations feature flag value:", isEnabled);
      setShowDonationButton(isEnabled);
    };

    checkDonationsFeature();
  }, []);

  const handleCreateGame = async () => {
    if (!hostName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Create the game with auto-generated code
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-[#F8F8F8]">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section with enhanced styling */}
        <div className="text-center mb-12 relative">
          <img
            src="/squabbl_logo.png"
            alt="Squabbl - The Ultimate Party Word Game Logo"
            className="mx-auto mb-4 max-w-full h-auto w-40 sm:w-60 md:w-80 lg:w-[500px]"
          />
          <p className="text-xl text-[#2F4F4F] max-w-2xl mx-auto font-nunito leading-relaxed">
            The ultimate party word game where teams compete through
            <span className="text-[#A8DADC] font-semibold"> description</span>,
            <span className="text-[#B0EACD] font-semibold"> charades</span>, and
            <span className="text-[#FFD166] font-semibold"> one-word clues</span>!
          </p>
          <div className="mt-4">
            <a
              href="/about"
              className="text-[#2F4F4F] underline font-nunito text-md hover:text-[#A8DADC] transition-colors duration-200"
            >
              What is Squabbl?
            </a>
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href="/how-to-play"
              className="inline-flex items-center px-8 py-4 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-all duration-200 shadow-md hover:shadow-lg text-lg font-nunito"
            >
              How to Play
            </a>
          </div>
        </div>

        {/* Main Content with enhanced card styling */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Create Game Card */}
          <div className="flex-1 p-8 bg-white rounded-2xl shadow-lg border-2 border-[#A8DADC] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h2 className="text-2xl font-bold text-[#2F4F4F] mb-6 font-fredoka flex items-center">
              <span className="text-2xl mr-3">🎲</span>
              Create New Game
            </h2>
            <div className="mb-6">
              <label htmlFor="hostName" className="block text-sm font-medium text-[#2F4F4F] mb-2 font-nunito">
                Your Name
              </label>
              <input
                type="text"
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-4 border-2 border-[#A8DADC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF798A] bg-[#F8F8F8] placeholder-slate-400 font-nunito transition-all duration-200"
              />
            </div>
            
            <button
              onClick={handleCreateGame}
              disabled={isLoading || !hostName.trim()}
              className="w-full py-4 px-6 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-nunito shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Game...
                </span>
              ) : (
                <>
                  <span className="mr-2">🎮</span>
                  Create New Game
                </>
              )}
            </button>
            <p className="mt-3 text-sm text-slate-500 text-center font-nunito">A unique game code will be generated automatically</p>
          </div>

          {/* Join Game Card */}
          <div className="flex-1 p-8 bg-white rounded-2xl shadow-lg border-2 border-[#B0EACD] transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <h2 className="text-2xl font-bold text-[#2F4F4F] mb-6 font-fredoka flex items-center">
              <span className="text-2xl mr-3">🎯</span>
              Join Game
            </h2>
            <form onSubmit={handleJoinGame} className="mt-5">
              <div className="mb-6">
                <label htmlFor="gameCode" className="block text-sm font-medium text-[#2F4F4F] mb-2 font-nunito">
                  Game Code
                </label>
                <input
                  type="text"
                  id="gameCode"
                  value={joinGameCode}
                  onChange={(e) => setJoinGameCode(e.target.value.toUpperCase())}
                  placeholder="Enter 4-character code"
                  maxLength={4}
                  className="w-full p-4 border-2 border-[#B0EACD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] bg-[#F8F8F8] placeholder-slate-400 font-nunito transition-all duration-200"
                />
              </div>
              
              <button
                type="submit"
                disabled={isJoining || !joinGameCode.trim()}
                className="w-full py-4 px-6 bg-[#B0EACD] text-[#2F4F4F] font-bold rounded-xl hover:bg-[#9ed9bc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-nunito shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isJoining ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#2F4F4F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Game...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🎲</span>
                    Join Game
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-nunito animate-shake">
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

        {/* How to Play Section with enhanced styling */}
        <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg border-2 border-[#FFD166]">
          <h2 className="text-2xl font-bold text-[#2F4F4F] mb-6 font-fredoka flex items-center">
            <span className="text-2xl mr-3">📖</span>
            How to Play
          </h2>
          <div className="space-y-5 text-[#2F4F4F] font-nunito">
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-[#EF798A] text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
              <p>Create a new game or join an existing one with a 4-character code</p>
            </div>
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-[#B0EACD] text-[#2F4F4F] flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
              <p>Form teams of at least 2 players each</p>
            </div>
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-[#FFD166] text-[#2F4F4F] flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
              <p>Each player contributes words to the game's word pool</p>
            </div>
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-[#A8DADC] text-[#2F4F4F] flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
              <div>
                <p className="mb-3">Play through three exciting rounds:</p>
                <ul className="space-y-3 pl-4">
                  <li className="flex items-center">
                    <span className="text-[#EF798A] mr-2">🗣️</span>
                    Round 1: Describe the word without saying it
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#B0EACD] mr-2">🎭</span>
                    Round 2: Act out the word (no sounds!)
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#FFD166] mr-2">💭</span>
                    Round 3: Give only one word as a clue
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-[#EF798A] text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">5</span>
              <p>The team with the most points at the end wins! 🏆</p>
            </div>
          </div>
        </div>

        {/* Buy Me a Coffee Section with enhanced styling */}
        {showDonationButton && (
          <div className="mt-12 flex flex-col items-center text-center">
            <p className="text-[#2F4F4F] mb-4 font-nunito italic">
              If you like Squabbl, please consider buying me a coffee!
            </p>
            <a
              href="https://buymeacoffee.com/pienaaranker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#26b0a1] text-white font-semibold rounded-xl hover:bg-[#229e91] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
            >
              <span className="mr-2 text-xl">☕</span>
              Buy Me a Coffee
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
