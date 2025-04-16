'use client';

import { useState } from 'react';
import { createNewGameRTDB, findGameByCodeRTDB } from '@/lib/firebase/rtdbGameService';
import { createNewGame, findGameByCode } from '@/lib/firebase/gameService';
import RTDBTestComponent from '@/components/RTDBTestComponent';

export default function RTDBTestPage() {
  const [gameId, setGameId] = useState<string>('');
  const [gameCode, setGameCode] = useState<string>('');
  const [searchCode, setSearchCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async (useRTDB: boolean) => {
    try {
      setStatus('Creating game...');
      setError(null);
      
      let result;
      if (useRTDB) {
        result = await createNewGameRTDB();
        setStatus(`Created RTDB game with ID: ${result.id} and code: ${result.code}`);
      } else {
        result = await createNewGame();
        setStatus(`Created Firestore game with ID: ${result.id} and code: ${result.code}`);
      }
      
      setGameId(result.id);
      setGameCode(result.code);
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'Failed to create game');
      setStatus('');
    }
  };

  const handleFindGame = async (useRTDB: boolean) => {
    if (!searchCode) {
      setError('Please enter a game code');
      return;
    }
    
    try {
      setStatus('Searching for game...');
      setError(null);
      
      let game;
      if (useRTDB) {
        game = await findGameByCodeRTDB(searchCode);
      } else {
        game = await findGameByCode(searchCode);
      }
      
      if (game) {
        setGameId(game.id);
        setGameCode(game.code);
        setStatus(`Found game with ID: ${game.id}`);
      } else {
        setError(`No game found with code: ${searchCode}`);
        setStatus('');
      }
    } catch (err: any) {
      console.error('Error finding game:', err);
      setError(err.message || 'Failed to find game');
      setStatus('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">RTDB Migration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create Game Section */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create Game</h2>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleCreateGame(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            >
              Create Firestore Game
            </button>
            <button 
              onClick={() => handleCreateGame(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            >
              Create RTDB Game
            </button>
          </div>
        </div>
        
        {/* Find Game Section */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Find Game</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="Enter game code"
              className="border p-2 rounded"
              maxLength={4}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => handleFindGame(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex-1"
              >
                Find in Firestore
              </button>
              <button 
                onClick={() => handleFindGame(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded flex-1"
              >
                Find in RTDB
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status and Error Display */}
      {status && (
        <div className="bg-blue-100 border-blue-400 text-blue-700 p-4 rounded mb-4">
          {status}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-red-400 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Game Display */}
      {gameId && (
        <div className="mb-4">
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Active Game</h2>
            <p><strong>Game ID:</strong> {gameId}</p>
            <p><strong>Game Code:</strong> {gameCode}</p>
          </div>
          
          <RTDBTestComponent gameId={gameId} />
        </div>
      )}
    </div>
  );
} 