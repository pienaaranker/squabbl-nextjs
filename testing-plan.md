# Squabbl Testing Plan

This document outlines the testing approach for the Squabbl application to ensure all functional and non-functional requirements are met.

## 1. Functional Testing

### Game Setup & Lobby
- [ ] Host can create a new game and a unique link is generated
- [ ] Host can define teams (2+) and name them
- [ ] Players can join via the link and enter a display name
- [ ] Players can select a team
- [ ] Host can join a team as a player
- [ ] Players can contribute words manually
- [ ] Players can add AI-generated words
- [ ] Players can only see their own contributed words
- [ ] Players can remove words they added (before game starts)
- [ ] Total word count is visible to all players
- [ ] Host can start the game once satisfied with team setup

### Gameplay - General
- [ ] Game correctly tracks current round, active team, active player, and score
- [ ] Team order determination works correctly
- [ ] Word pot visualization shows correct count
- [ ] Game state persists and updates in real-time for all players

### Gameplay - Turns
- [ ] System correctly designates the next player as describer
- [ ] Word is randomly selected and only visible to active describer
- [ ] Timer works correctly for each turn
- [ ] "Correct Guess" functionality works (score increment, word removal)
- [ ] "Skip/Pass" functionality works (word returns to pot, time penalty)
- [ ] Turn ends correctly (timer out or pot empty)
- [ ] Play correctly passes to next team

### Gameplay - Rounds
- [ ] Round progression works correctly (moves to next round when pot is empty)
- [ ] Words reset correctly for Rounds 2 and 3
- [ ] UI clearly indicates current round and its rules

### End Game
- [ ] Game ends correctly after Round 3
- [ ] Final scores and winner displayed correctly
- [ ] "Play Again" and "End Session" options work for Host

## 2. UI/UX Testing

- [ ] Interface is clean, intuitive, and visually appealing
- [ ] Gameplay elements are clearly visible and update dynamically
- [ ] Application is responsive on desktop, tablet, and mobile devices
- [ ] Color palette is implemented correctly and consistently
- [ ] Visual feedback for user interactions works correctly

## 3. Security Testing

- [ ] Game instances are properly isolated
- [ ] Word visibility is correctly restricted to the active describer only
- [ ] Players can only see their own word submissions pre-game
- [ ] Basic abuse prevention works (join attempts, word adding)

## 4. Multi-player Testing

- [ ] Real-time synchronization works correctly for all players
- [ ] Game state updates appear near real-time for all connected players
- [ ] Player joining/leaving is handled gracefully
- [ ] Edge cases (player disconnects during turn, etc.) are handled properly

## 5. Performance Testing

- [ ] UI interactions are smooth and responsive
- [ ] Game state updates feel near real-time

## Test Environments
- Desktop browsers: Chrome, Firefox, Safari, Edge
- Mobile browsers: Chrome (Android), Safari (iOS)
- Various screen sizes (desktop, tablet, phone)

## Test Data
- Various team configurations (2 teams, 3+ teams)
- Different player counts per team
- Various word counts
- Edge cases (very long words, special characters, etc.)

## Issues Tracking
Document issues found during testing with:
- Description
- Steps to reproduce
- Expected vs. actual behavior
- Environment details
- Priority/severity 