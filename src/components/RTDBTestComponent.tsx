import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { onGameChange } from '@/lib/firebase/rtdbGameService';
import type { Game } from '@/types/firestore';

interface RTDBTestComponentProps {
  gameId: string;
}

export default function RTDBTestComponent({ gameId }: RTDBTestComponentProps) {
  const [firestoreGame, setFirestoreGame] = useState<Game | null>(null);
  const [rtdbGame, setRtdbGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Set up Firestore listener
      const gameRef = doc(db, "games", gameId);
      const unsubFirestore = onSnapshot(gameRef, (docSnap) => {
        if (docSnap.exists()) {
          const gameData = { id: docSnap.id, ...docSnap.data() } as Game;
          setFirestoreGame(gameData);
        } else {
          setFirestoreGame(null);
        }
      }, (err) => {
        console.error("Firestore error:", err);
        setError("Error loading Firestore data");
      });
      
      // Set up RTDB listener
      const unsubRTDB = onGameChange(gameId, (gameData) => {
        setRtdbGame(gameData);
        setLoading(false);
      });
      
      return () => {
        unsubFirestore();
        unsubRTDB();
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setError("Failed to set up data listeners");
      setLoading(false);
    }
  }, [gameId]);

  if (loading) {
    return <div className="p-4">Loading game data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-4xl mx-auto my-4">
      <h2 className="text-xl font-bold mb-4">Database Comparison</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Firestore Data */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Firestore Data</h3>
          {firestoreGame ? (
            <div>
              <div className="mb-2">
                <span className="font-medium">Game Code:</span> {firestoreGame.code}
              </div>
              <div className="mb-2">
                <span className="font-medium">State:</span> {firestoreGame.state}
              </div>
              <div className="mb-2">
                <span className="font-medium">Current Round:</span> {firestoreGame.currentRound || 'Not started'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Active Team:</span> {firestoreGame.activeTeamId || 'None'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Active Player:</span> {firestoreGame.activePlayerId || 'None'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Created At:</span> {firestoreGame.createdAt?.toString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No Firestore data available</div>
          )}
        </div>
        
        {/* RTDB Data */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">RTDB Data</h3>
          {rtdbGame ? (
            <div>
              <div className="mb-2">
                <span className="font-medium">Game Code:</span> {rtdbGame.code}
              </div>
              <div className="mb-2">
                <span className="font-medium">State:</span> {rtdbGame.state}
              </div>
              <div className="mb-2">
                <span className="font-medium">Current Round:</span> {rtdbGame.currentRound || 'Not started'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Active Team:</span> {rtdbGame.activeTeamId || 'None'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Active Player:</span> {rtdbGame.activePlayerId || 'None'}
              </div>
              <div className="mb-2">
                <span className="font-medium">Created At:</span> {rtdbGame.createdAt?.toString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No RTDB data available</div>
          )}
        </div>
      </div>
    </div>
  );
} 