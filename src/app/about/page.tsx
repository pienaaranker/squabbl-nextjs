import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-start py-8 px-4">
      {/* Hero Section with Video */}
      <div className="w-full max-w-3xl flex flex-col items-center mb-10">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border-4 border-[#A8DADC]">
          <video
            src="/intro_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover rounded-3xl"
            poster="/images/confetti-pattern.svg"
            aria-label="Squabbl game night video preview"
          />
          {/* Overlay headline and subheadline on the video, no background */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-white drop-shadow-lg mb-2 text-center">
                Welcome to Squabbl!
              </h1>
              <p className="text-xl md:text-2xl font-nunito text-[#FFD166] font-semibold drop-shadow text-center">
                The Ultimate Party Word Game
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Squabbl Special? */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 mb-10 border-2 border-[#B0EACD] flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#2F4F4F] mb-2 font-fredoka">What Makes Squabbl Special?</h2>
        <ul className="list-disc pl-6 space-y-3 text-[#2F4F4F] font-nunito text-lg">
          <li><span className="font-semibold">Fun for Everyone:</span> Designed for families and friends of all ages—no experience required.</li>
          <li><span className="font-semibold">Three Unique Rounds:</span> Describe, act, and give one-word clues. Each round brings a new challenge and new laughs.</li>
          <li><span className="font-semibold">Easy to Start:</span> Create or join a game with a single link. No downloads, no hassle.</li>
          <li><span className="font-semibold">Play Anywhere:</span> Gather in the living room or connect from afar—Squabbl works on any device.</li>
          <li><span className="font-semibold">Always Fresh:</span> Add your own words or let the game suggest new ones. Every session is unique.</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col items-center mt-4">
        <Link href="/" className="inline-flex items-center px-8 py-4 bg-[#EF798A] text-white font-bold rounded-xl hover:bg-[#e86476] transition-all duration-200 shadow-md hover:shadow-lg text-xl font-nunito">
          <span className="mr-2">🚀</span> Get Started
        </Link>
        <Link href="/" className="mt-3 text-[#2F4F4F] underline font-nunito text-md hover:text-[#A8DADC] transition-colors duration-200">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 