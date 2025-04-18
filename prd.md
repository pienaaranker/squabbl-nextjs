# Product Requirements Document: Squabbl

## 1. Introduction

Squabbl is a digital adaptation of a popular party game designed for families and groups of friends. Players divide into teams and try to guess words drawn from a shared "pot" over three distinct rounds: verbal description, charades, and one-word clues. The goal is to create a fun, engaging, and easy-to-play digital experience accessible via a web browser, allowing players to join a shared game session using a link, and collaboratively build the word list while keeping individual contributions secret until played.

## 2. Goals

* **Primary Goal:** Deliver a fun, interactive, and replayable word-guessing game for multiple players/teams joining a shared session.
* **Ease of Use:** Ensure the game setup (by a host) and joining/gameplay (by players) are intuitive and require minimal instruction, including a simple joining process with link.
* **Flexibility:** Allow all players to contribute to the game's word pot, either manually or through AI generation, keeping contributions private.
* **Accessibility:** Build as a web application deployable via Firebase Hosting for broad access via a shareable link.
* **Fairness:** Ensure no player (including the Host) has an advantage by seeing all submitted words before gameplay begins.
* **Engagement:** Keep players engaged through timed turns, score tracking, team dynamics, collaborative word input, and varied gameplay across rounds.

## 3. User Personas

* **The Family:** Looking for a fun activity to play together during game nights or gatherings, potentially joining from different devices within the same location or remotely. Values ease of setup and rules suitable for various ages. Enjoys contributing silly or meaningful words privately.
* **The Friend Group:** Wants a lively party game for social events. Appreciates customization (adding inside jokes as words privately), competitive elements (scoring), and the ability to easily join a shared game and add words without revealing them.
* **The Game Host:** Needs a simple way to create, configure (teams), and start the game session, sharing a link for others to join. Manages the game flow but does not have special access to view all submitted words.
* **The Player:** Wants to easily join a game using a link, enter their name, select a team, contribute words to the pot (manually or via AI) knowing only they can see their own submissions pre-game, and participate in the guessing and clue-giving.

## 4. Functional Requirements

**FR1: Game Setup & Lobby**

* FR1.1: **Host Creates Game:** A user (acting as Host) must be able to create a new game session. Upon creation, the system must generate:
    * A unique, shareable link for this session.
* FR1.2: **Host Defines Teams:** The Host must be able to define at least two teams and name each team within the game session settings while in the lobby.
* FR1.3: **Player Joins Lobby:** Users accessing the shareable link must be presented with a join screen. To enter the lobby, they must:
    * Enter a display name.
    * Click a "Join" or similar button.
* FR1.4: **Player Selects Team:** Once in the lobby, players must be able to see the teams created by the Host and select which team they want to join. The lobby UI should show which players are on which team.
* FR1.5: **Host Participation:** The Host must also be able to join one of the teams as a player.
* FR1.6: **Minimum Players:** The game requires at least two teams, and each team ideally needs at least two players for the dynamics to work (one clue-giver, one guesser). The system should indicate if teams are unbalanced but might not strictly enforce a minimum *before* starting (Host decision).
* FR1.7: **Player Word Contribution & Visibility:** While in the lobby, all joined players (including the Host) must be able to contribute words to the shared game "pot".
    * FR1.7.1: **Manual Input:** Players can type in words individually.
    * FR1.7.2: **AI Generation:** Players can request the system to add a batch of AI-generated words (e.g., 5 or 10 at a time). The system should generate generally known, describable nouns, verbs, or proper nouns suitable for a family audience.
    * FR1.7.3: **Private View:** Each player must only be able to view the list of words *they personally* have added to the pot during this phase. They cannot see words added by other players.
    * FR1.7.4: **Removal:** Players should be able to remove words they personally added *before* the game starts.
* FR1.8: **Word Pot Feedback:** The lobby interface must clearly display the current *total number* of words added to the pot by all players combined. It must *not* display the words themselves.
* FR1.9: **Data Storage:** The system must store the list of all contributed words, team definitions, player assignments, and game state associated with the specific game session (e.g., in Firestore), ensuring individual words are not exposed to all players before being drawn in-game.
* FR1.10: **Host Starts Game:** The Host must have the control to start the game once they are satisfied with the team setup and the total word count. This action locks the word pot (preventing further additions/removals) and transitions all players from the lobby to the main game interface. *(Note: There is no central pre-game word moderation step)*

**FR2: Gameplay - General**

* FR2.1: The game proceeds in three distinct rounds.
* FR2.2: The order of teams taking turns should be determined randomly or allow Host selection at the start.
* FR2.3: The system must track the current round, the active team, the active player (describer), and the score for each team. This information should be visible to all players.
* FR2.4: A visual representation of the "pot" (e.g., a count of remaining words for the current round) should be displayed.
* FR2.5: The game state (current round, scores, remaining words in the pot for the current round, active team/player) must persist (e.g., in Firestore) and update in near real-time for all connected players.

**FR3: Gameplay - Turns**

* FR3.1: When it's a team's turn, the system designates the next player *from that team* in sequence as the "describer" (or "actor" / "one-word clue giver").
* FR3.2: The system must randomly select a word from the current pot, visible *only* to the active describer. Other players should see a placeholder or indication that the describer has the word.
* FR3.3: A timer (e.g., 60 seconds) must be implemented for each team's turn, visible to all players.
* FR3.4: During a turn, the describer attempts to get their *teammates* to guess the word according to the current round's rules.
* FR3.5: Teammates guess the word verbally. The system doesn't process guesses directly.
* FR3.6: Controls must be available *primarily for the active describer*:
    * Correct Guess: Award a point to the guessing team, remove the word from the current round's pot, and present the next word to the describer (if time remains).
    * Skip/Pass: Put the current word back into the pot (to be drawn again later in the round) and present the next word. (time penalty of 10s).
    * (Optional) Foul: Indicate if the describer broke the round's rules. (Needs defined consequence - lose turn). This might require an opposing team member or Host to trigger.
* FR3.7: A turn ends when the timer runs out or the pot for the round is empty.
* FR3.8: After a turn, play passes to the next team in sequence.

**FR4: Gameplay - Rounds**

* FR4.1: Round 1 - Describe It: Describers use verbal clues (without saying the word itself, rhymes, or spelling).
* FR4.2: Round 2 - Act It Out: All words from the original list are added back to the pot. Describers must use only actions (no sounds, no pointing at objects in the room).
* FR4.3: Round 3 - One Word: All words are added back to the pot again. Describers can say only one single word as a clue (not the target word).
* FR4.4: A round ends when all words in the pot have been successfully guessed within that round.
* FR4.5: The system must clearly indicate the start and end of each round and transition smoothly between them, resetting the pot as required.

**FR5: End Game**

* FR5.1: The game ends after the completion of Round 3.
* FR5.2: The final scores for all teams must be displayed to all players.
* FR5.3: The team with the highest score is declared the winner.
* FR5.4: The Host should have an option to start a new game (potentially keeping the same players/teams but requiring new words) or end the session.

## 5. Non-Functional Requirements

**NFR1: User Interface & Experience (UI/UX)**

* NFR1.1: The interface should be clean, intuitive, and visually appealing for both Host and Player views, including the lobby, join screen (name input), and private word input/view elements.
* NFR1.2: Gameplay elements (timer, score, current word for describer, remaining words, active team/player, team lists, total word count) must be clearly visible and update dynamically.
* NFR1.3: The application must be responsive and usable on various screen sizes (desktop, tablet, mobile).
* NFR1.4: Color Palette: The color scheme should evoke "family fun":
    * Main Background: Soft White / Off-White (#F8F8F8)
    * Secondary Backgrounds/Containers: Sky Blue (#A8DADC)
    * Primary Buttons/Highlights: Playful Coral (#EF798A)
    * Secondary Accents: Mint Green (#B0EACD)
    * Optional Accent/Feedback: Sunny Yellow (#FFD166)
    * Text: Dark Slate Gray (#2F4F4F)

**NFR2: Technology Stack**

* NFR2.1: Frontend/UI must be built using **Next.js (React framework)**.
* NFR2.2: Backend data persistence and real-time synchronization (game state, word lists with appropriate privacy controls, scores, player presence, team assignments, session codes) must use Firebase Firestore and potentially Firebase Realtime Database for low-latency updates if needed.
* NFR2.3: The application must be deployable using Firebase Hosting.

**NFR2.4: File Structure**

```
squabbl/
├── app/                        # Next.js app directory
│   ├── layout.tsx             # Root layout component with providers
│   ├── page.tsx               # Landing page with game creation
│   ├── game/                  # Game-related routes
│   │   ├── [id]/             # Dynamic game session route
│   │   │   ├── page.tsx      # Main game interface
│   │   │   └── layout.tsx    # Game session layout
│   │   └── new/              # New game creation route
│   │       └── page.tsx      # Game creation form
│   └── join/                  # Join game route
│       └── [code]/           # Dynamic join code route
│           └── page.tsx      # Join game interface
├── components/                # Reusable React components
│   ├── ui/                   # Basic UI components
│   │   ├── Button.tsx       # Custom button component
│   │   ├── Input.tsx        # Custom input component
│   │   └── Modal.tsx        # Modal dialog component
│   ├── game/                 # Game-specific components
│   │   ├── Lobby.tsx        # Game lobby interface
│   │   ├── GameBoard.tsx    # Main game board
│   │   ├── Timer.tsx        # Game timer component
│   │   ├── TeamList.tsx     # Team management component
│   │   └── WordPot.tsx      # Word pot visualization
│   └── forms/                # Form-related components
│       ├── CreateGame.tsx    # Game creation form
│       └── JoinGame.tsx      # Game joining form
├── lib/                      # Utility functions and hooks
│   ├── firebase/            # Firebase configuration
│   │   ├── config.ts        # Firebase app config
│   │   ├── auth.ts          # Authentication utilities
│   │   └── db.ts            # Database utilities
│   ├── hooks/               # Custom React hooks
│   │   ├── useGame.ts       # Game state management
│   │   ├── useTeams.ts      # Team management
│   │   └── useWords.ts      # Word pot management
│   └── utils/               # Helper functions
│       ├── gameLogic.ts     # Game rules and logic
│       └── wordGen.ts       # AI word generation
├── types/                    # TypeScript type definitions
│   ├── game.ts              # Game-related types
│   ├── team.ts              # Team-related types
│   └── user.ts              # User-related types
├── styles/                   # Global styles
│   └── globals.css          # Global CSS
├── public/                   # Static assets
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── package.json             # Project dependencies
```

**NFR3: Performance**

* NFR3.1: UI interactions should be smooth and responsive.
* NFR3.2: Game state updates (scores, timer, word visibility, player lists, word count) should feel near real-time for all connected players. Firestore/RTDB real-time capabilities are crucial.

**NFR4: Security**

* NFR4.1: Game instances must be isolated. Access requires the unique game session link. The correct code is visible to the Host.
* NFR4.2: Ensure the word is only revealed to the designated active describer during their turn via Firestore security rules or backend logic. Pre-game word lists must enforce privacy such that players can only see their own submissions.
* NFR4.3: Consider rate limiting or basic abuse prevention for joining attempts, game creation, and adding words.

## 6. Future Considerations (Optional / V2)

* Player Accounts: Allow users to create accounts to track stats over time.
* More Robust Lobby Management: Kicking players, Host transfer, private sessions, limits on word contributions per player.
* Word List Categories: Allow AI generation based on categories (e.g., Movies, History, Science) or difficulty levels, potentially selectable by players during contribution.
* Customizable Rules: Allow hosts to adjust turn timers, number of rounds, skip penalties, or specific round rules.
* Sound Effects: Add simple sounds for timer ticks, correct answers, round transitions, player joining, word added.
* Improved Foul System: More robust handling and verification of rule breaks.
* Spectator Mode: Allow users to join via link just to watch (potentially bypassing or having a different code mechanism).
* Optional Host Moderation: Allow the Host to optionally enable a mode where they *can* see and moderate all words, accepting the fairness trade-off.
* Duplicate Handling: Implement logic to handle duplicate word submissions (e.g., allow them, discard them silently, or notify players).
* Alternative Join Mechanisms: Explore options like QR codes displayed by the host.
