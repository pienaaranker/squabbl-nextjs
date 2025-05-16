import type { Metadata } from 'next';
import Link from "next/link";

// Added page-specific metadata
export const metadata: Metadata = {
  title: 'How to Play Squabbl - Game Rules & Instructions',
  description: 'Learn the rules of Squabbl! Detailed instructions on how to set up your game, play through the three exciting rounds (describe, act, one-word), and tips for a fantastic game night.',
  alternates: {
    canonical: 'https://www.squabbl.co.za/how-to-play', // Updated domain
  },
  openGraph: { 
    title: 'Squabbl Game Instructions - Master the Rules!',
    description: 'Your complete guide to playing Squabbl. Understand the setup, rounds, and tips to make your game night a blast.',
    // images: [ // Optionally add a specific image for this page
    //   {
    //     url: 'https://www.squabbl.co.za/images/how-to-play-squabbl.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Illustration of Squabbl game rounds',
    //   },
    // ],
  },
};

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 border-2 border-[#EF4444]">
        <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-[#2F4F4F] mb-6 text-center">How to Play Squabbl</h1>
        <ol className="list-decimal pl-6 space-y-6 text-[#2F4F4F] font-nunito text-lg mb-8">
          <li>
            <span className="font-bold">Create or Join a Game:</span> <br />
            One player creates a game and shares the link or 4-letter code. Others join using the code or link.
          </li>
          <li>
            <span className="font-bold">Form Teams:</span> <br />
            Players split into at least two teams. Each team should have at least two players for the best experience.
          </li>
          <li>
            <span className="font-bold">Add Words to the Pot:</span> <br />
            Every player secretly adds words to the shared pot. You can type your own or let Squabbl suggest some. Only you can see your submissions until the game starts.
          </li>
          <li>
            <span className="font-bold">Start the Game:</span> <br />
            When everyone is ready, the host starts the game. The word pot is locked, and the first round begins!
          </li>
        </ol>
        <h2 className="text-2xl font-bold text-[#2F4F4F] mb-4 font-fredoka">Game Rounds</h2>
        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-[#A8DADC] mb-2 font-fredoka">Round 1: Describe It</h3>
            <p>
              The active player gives verbal clues to help their team guess the word—<span className="font-semibold">but you can't say the word itself, spell it, or use rhymes!</span> Keep describing until your team guesses correctly or time runs out. Skip if you're stuck (with a time penalty).
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#B0EACD] mb-2 font-fredoka">Round 2: Act It Out</h3>
            <p>
              All words go back in the pot. This time, you can only use gestures and actions—<span className="font-semibold">no words, no sounds, no pointing at objects in the room!</span> Your team guesses as many as they can before time's up.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#FFD166] mb-2 font-fredoka">Round 3: One Word</h3>
            <p>
              All words return to the pot again. Now, you can give <span className="font-semibold">only one word</span> as a clue for each word. Choose wisely! No gestures, no extra hints.
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#2F4F4F] mb-4 font-fredoka">Tips for a Great Game Night</h2>
        <ul className="list-disc pl-6 space-y-3 text-[#2F4F4F] font-nunito text-lg mb-8">
          <li>Mix up your word submissions—inside jokes, pop culture, and family-friendly words keep things lively.</li>
          <li>Balance teams for the most fun. Try to have at least two players per team.</li>
          <li>Use a timer (built-in) to keep rounds exciting and fair.</li>
          <li>Encourage creativity and laughter—Squabbl is about having fun together!</li>
        </ul>
        <div className="flex flex-col items-center mt-6">
          <Link href="/" className="inline-flex items-center px-8 py-4 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-all duration-200 shadow-md hover:shadow-lg text-xl font-nunito mb-2">
            Back to Home
          </Link>
          <Link href="/about" className="text-[#2F4F4F] underline font-nunito text-md hover:text-[#A8DADC] transition-colors duration-200">
            About Squabbl
          </Link>
        </div>
      </div>
    </div>
  );
} 