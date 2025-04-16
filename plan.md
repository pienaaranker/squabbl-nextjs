# Squabbl - Implementation Plan Checklist

This checklist breaks down the development of Squabbl into manageable phases based on the PRD (`prd_squabbl_v1`), using Next.js and Firebase.

## Phase 1: Project Setup & Backend Foundation

* [x] Initialize **Next.js** Project (Ref: NFR2.1) - *Assumed pre-existing*
* [ ] Setup Firebase Project (Enable Firestore, Hosting) (Ref: NFR2.2, NFR2.3) - *User needs to do this in Firebase Console*
* [x] Integrate Firebase SDK into the **Next.js** application (consider client/server components).
* [x] Define Firestore Data Models:
    * [x] `games` collection (documents represent game sessions, storing state like round, activeTeamId, code, etc.) (Ref: FR1.9)
    * [x] `teams` subcollection within each game (documents represent teams, storing name, score) (Ref: FR1.2, FR2.3)
    * [x] `players` subcollection within each game (documents represent players, storing name, teamId, potentially host status) (Ref: FR1.3, FR1.4)
    * [x] `words` subcollection within each game (documents represent words, storing the word text, submittingPlayerId - for removal/privacy) (Ref: FR1.7, FR1.9)
* [x] Implement Initial Firebase Security Rules (Basic read/write access or based on game ID) (Ref: NFR4.1, NFR4.2)

## Phase 2: Game Creation & Lobby

* [x] **Host:** Implement "Create Game" functionality:
    * [x] Generate unique game ID.
    * [x] Create corresponding `games` document in Firestore.
    * [x] Redirect Host to Lobby view (using Next.js routing).
* [x] **Host Lobby UI:**
    * [x] Display shareable link (using game ID).
    * [x] Implement UI for defining/naming teams (min. 2) (Ref: FR1.2).
    * [x] Display list of joined players and their assigned teams (Real-time) (Ref: FR1.4).
    * [x] Display total word count (Real-time) (Ref: FR1.8).
    * [x] Implement "Start Game" button (Ref: FR1.10).
* [x] **Player Join Flow:**
    * [x] Create Join Screen UI (accessible via shareable link/route) (Ref: FR1.3).
    * [x] Implement Name Input field (Ref: FR1.3).
    * [x] On successful join, add player document to `players` subcollection in Firestore.
* [x] **Player Lobby UI:**
    * [x] Display defined teams (Ref: FR1.4).
    * [x] Implement Team Selection UI/Logic (update player document in Firestore) (Ref: FR1.4).
    * [x] Display list of joined players and their assigned teams (Real-time).
    * [x] Implement Word Contribution UI:
        * [x] Manual word input field and "Add" button (Ref: FR1.7.1).
        * [x] "Add AI Words" button (Ref: FR1.7.2).
        * [x] Display list of *own* submitted words with a "Remove" option (Ref: FR1.7.3, FR1.7.4).
    * [x] Display total word count (Real-time) (Ref: FR1.8).
* [x] **Backend Logic:**
    * [x] Implement AI word generation logic (e.g., using a predefined list or potentially an external API/function/Next.js API route) (Ref: FR1.7.2).
    * [x] Implement Firestore listeners for real-time lobby updates (players joining/leaving, team changes, word count) (Ref: NFR3.2).
    * [x] Implement "Start Game" button UI (still need to implement the actual start game functionality) (Ref: FR1.10).
* [x] **Security Rules:** Refine rules for lobby state (e.g., only host can define teams/start game, players can only add/remove their own words). (Ref: NFR4.1, NFR4.2)
* [x] **Host Participation:** Ensure the host is also a player and can join a team. (Ref: FR1.5)

## Phase 3: Core Gameplay Logic & UI

* [x] **Game State Management:**
    * [x] Track current round, active team, active player (describer), scores in Firestore (Ref: FR2.3, FR2.5).
    * [x] Determine initial team turn order (randomly or host choice) (Ref: FR2.2).
    * [x] Implement logic to cycle through players within the active team for turns (Ref: FR3.1).
* [x] **Turn Logic:**
    * [x] Fetch all words for the game from Firestore.
    * [x] Implement logic to randomly select an unguessed word from the pot for the current round (Ref: FR3.2).
    * [x] Implement turn timer (e.g., 60 seconds) (Ref: FR3.3).
    * [x] Implement "Correct Guess" logic: Increment score, mark word as guessed for the round, select next word (if time remains) (Ref: FR3.6).
    * [x] Implement "Skip/Pass" logic: Put word back in pot (unmark as guessed if needed), select next word, apply time penalty (Ref: FR3.6).
    * [x] Implement basic "Foul" indication/consequence (e.g., lose turn) (Ref: FR3.6).
    * [x] Implement turn end logic (timer up or round pot empty) (Ref: FR3.7).
    * [x] Implement logic to pass turn to the next team (Ref: FR3.8).
* [x] **Gameplay UI:**
    * [x] **Describer View:** Display current word, timer, score, remaining words in pot, "Correct", "Skip" buttons (Ref: FR3.2, NFR1.2).
    * [x] **Guesser/Opponent View:** Display timer, score, active team/player, remaining words in pot (hide current word) (Ref: NFR1.2).
    * [x] Ensure UI updates in real-time based on Firestore changes (timer, score, etc.) (Ref: NFR3.2).
* [x] **Security Rules:** Refine rules for gameplay (e.g., only active describer can see current word, only active describer can trigger score/skip, score updates are validated). (Ref: NFR4.2)

## Phase 4: Round Logic

* [x] Implement round progression logic (move to next round when pot is empty) (Ref: FR4.4).
* [x] Implement logic to reset the "guessed" status of all words when starting Rounds 2 and 3 (Ref: FR4.2, FR4.3).
* [x] Update UI to clearly indicate the current round number and its specific rules (Describe It, Act It Out, One Word) (Ref: FR4.1, FR4.2, FR4.3, FR4.5).

## Phase 5: End Game & Replay

* [x] Implement game end condition detection (after Round 3 completion) (Ref: FR5.1).
* [x] Create End Game screen UI displaying final scores and winner (Ref: FR5.2, FR5.3).
* [x] Implement "Play Again" / "End Session" options for the Host (Ref: FR5.4).

## Phase 6: UI/UX Polish & Responsiveness

* [x] Apply the defined Color Palette consistently across the application (Ref: NFR1.4).
* [x] Review and refine UI for cleanliness, intuitiveness, and visual appeal (Ref: NFR1.1).
* [x] Test and ensure responsiveness across different screen sizes (desktop, tablet, mobile) using CSS/Tailwind (Ref: NFR1.3).
* [x] Add appropriate visual feedback for user interactions (loading states, button presses, success/error messages).
* [x] Ensure all critical game elements (timer, score, words, etc.) are clearly visible and understandable (Ref: NFR1.2).

## Phase 7: Deployment & Testing

* [ ] Configure Deployment settings (Firebase Hosting or Vercel) (Ref: NFR2.3).
* [ ] Build the **Next.js** application for production.
* [ ] Implement basic error handling (e.g., display user-friendly messages for Firestore errors, Next.js error boundaries).
* [ ] Conduct thorough testing:
    * [ ] Functional testing (all features work as per PRD).
    * [ ] UI/UX testing (visuals, usability, responsiveness).
    * [ ] Security testing (test Firestore rules, join code bypass attempts).
    * [ ] Multi-player testing (simulate multiple users, test real-time sync).
* [x] Deploy the application to chosen platform (Firebase Hosting / Vercel) (Ref: NFR2.3).
* [ ] Perform final User Acceptance Testing (UAT) with target users if possible.
