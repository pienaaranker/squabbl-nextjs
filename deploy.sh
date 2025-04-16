#!/bin/bash

# Colors for prettier output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting Squabbl deployment process...${NC}"

# Run ESLint to check for code issues
echo -e "\n${YELLOW}🔍 Running ESLint to check for issues...${NC}"
npm run lint || { echo -e "${YELLOW}⚠️  ESLint found issues. Please fix them before deploying.${NC}"; exit 1; }

# Build the Next.js application
echo -e "\n${YELLOW}🔨 Building the Next.js application...${NC}"
npm run build || { echo -e "${YELLOW}❌ Build failed. Please fix the issues and try again.${NC}"; exit 1; }

# Deploy to Firebase
echo -e "\n${YELLOW}🚀 Deploying to Firebase...${NC}"
firebase deploy || { echo -e "${YELLOW}❌ Firebase deployment failed.${NC}"; exit 1; }

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎮 Your Squabbl game is now live!${NC}" 