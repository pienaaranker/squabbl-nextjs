# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build the application
- `npm run lint` - Run ESLint to check for code issues
- `npm run start` - Start the production server
- `npm run export` - Export the application as static files
- `npm run firebase:deploy` - Deploy to Firebase
- `npm run deploy` - Run export and deploy to Firebase

## Code Style Guidelines
- **Imports**: Use absolute imports with the `@/` prefix (e.g., `import { Button } from "@/app/components/ui/Button"`)
- **Formatting**: Use TypeScript with strict mode enabled
- **Components**: Follow React 19 best practices with Next.js 15 patterns
- **CSS**: Use Tailwind CSS with the project's defined color palette
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Implement appropriate error boundaries, especially around Firebase operations
- **File Structure**: Place components in `/app/components`, shared utilities in `/lib/utils`

## Project Context
Always check plan.md and prd.md first when working on new features. Mark completed tasks in plan.md.