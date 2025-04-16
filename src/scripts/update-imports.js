// Script to update imports from gameService.ts to unifiedGameService.ts
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directories to exclude from search
const excludeDirs = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'src/lib/firebase/rtdbGameService.ts',
  'src/lib/firebase/unifiedGameService.ts',
  'src/scripts'
];

/**
 * Recursively search through directory for files that import from gameService
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Array to store found files
 * @returns {string[]} - Array of files with gameService imports
 */
function findFilesWithGameServiceImports(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(file) || excludeDirs.includes(filePath)) {
        continue;
      }
      findFilesWithGameServiceImports(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))
    ) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Check for imports from gameService
      if (content.includes("from './gameService'") || 
          content.includes("from './firebase/gameService'") || 
          content.includes("from '@/lib/firebase/gameService'")) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

/**
 * Update imports in a file
 * @param {string} filePath - Path to the file to update
 */
function updateFile(filePath) {
  console.log(`Updating file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import statements
  content = content.replace(/from ['"](.*)gameService['"]/g, 'from \'$1unifiedGameService\'');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

/**
 * Main function to run the script
 */
function main() {
  try {
    const rootDir = path.resolve(__dirname, '../..');
    console.log(`Searching for files with gameService imports in: ${rootDir}`);
    
    const filesToUpdate = findFilesWithGameServiceImports(rootDir);
    
    console.log(`Found ${filesToUpdate.length} files to update:`);
    for (const file of filesToUpdate) {
      console.log(`- ${file}`);
    }
    
    if (filesToUpdate.length > 0) {
      const shouldProceed = process.argv.includes('--apply');
      
      if (shouldProceed) {
        console.log('Updating imports...');
        for (const file of filesToUpdate) {
          updateFile(file);
        }
        console.log(`Successfully updated ${filesToUpdate.length} files.`);
      } else {
        console.log('Run with --apply flag to update these files.');
      }
    } else {
      console.log('No files found that need updates.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 