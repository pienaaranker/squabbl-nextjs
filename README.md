# Squabbl

Squabbl is a digital adaptation of a popular party word-guessing game for families and groups of friends. Players divide into teams and try to guess words drawn from a shared "pot" over three distinct rounds: verbal description, charades, and one-word clues.

## Features

- Create and join game sessions via a shareable link
- Form teams and contribute words to a shared "pot"
- Three gameplay rounds with different rules
- Real-time score tracking and game state updates
- Responsive design for all devices

## Technologies

- **Frontend**: Next.js 15 with React 19
- **Backend**: Firebase (Firestore, Hosting)
- **Styling**: Tailwind CSS 

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project (with Firestore enabled)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd squabbl
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a `.env.local` file in the root directory based on the `.env.example` template
   - Add your Firebase configuration values

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Deployment

### Firebase Hosting

1. Build the application for production:
   ```bash
   npm run build
   ```

2. Log in to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project (if not already done):
   ```bash
   firebase init
   ```
   - Select Hosting and Firestore features
   - Select your Firebase project
   - Set public directory to `out`
   - Configure as a single-page app: Yes
   - Set up GitHub Actions deployment: Optional

4. Deploy to Firebase:
   ```bash
   npm run deploy
   ```
   
   Or use the provided deployment script:
   ```bash
   ./deploy.sh
   ```

## Testing

A comprehensive testing plan is available in `testing-plan.md`. To ensure the application works correctly:

1. Run through all test scenarios in the testing plan
2. Test multi-player functionality using different devices/browsers
3. Verify all requirements specified in `prd.md` are implemented correctly

## License

[MIT](LICENSE)
