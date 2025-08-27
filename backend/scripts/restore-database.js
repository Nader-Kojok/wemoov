import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const listBackups = () => {
  const backupsDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    console.log('❌ No backups directory found. Please create a backup first.');
    return [];
  }
  
  const backupFiles = fs.readdirSync(backupsDir)
    .filter(file => file.startsWith('wemoov-backup-') && file.endsWith('.bak'))
    .sort()
    .reverse();
  
  if (backupFiles.length === 0) {
    console.log('❌ No backup files found. Please create a backup first.');
    return [];
  }
  
  console.log('\n📋 Available backups:');
  backupFiles.forEach((file, index) => {
    const filePath = path.join(backupsDir, file);
    const fileStats = fs.statSync(filePath);
    const size = (fileStats.size / (1024 * 1024)).toFixed(2);
    const created = fileStats.birthtime.toLocaleString();
    console.log(`  ${index + 1}. ${file} (${size} MB) - ${created}`);
  });
  
  return backupFiles;
};

const restoreDatabase = async () => {
  console.log('🔄 Starting database restore process...');
  console.log('⚠️  WARNING: This will REPLACE all data in your database!');
  
  // Get the direct database URL
  const directDbUrl = process.env.DIRECT_DATABASE_URL;
  
  if (!directDbUrl) {
    console.error('❌ DIRECT_DATABASE_URL not found in environment variables');
    console.log('Please make sure DIRECT_DATABASE_URL is set in your .env file');
    process.exit(1);
  }
  
  // List available backups
  const backupFiles = listBackups();
  if (backupFiles.length === 0) {
    process.exit(1);
  }
  
  try {
    // Ask user to select a backup
    const selection = await askQuestion('\nEnter the number of the backup to restore (or "q" to quit): ');
    
    if (selection.toLowerCase() === 'q') {
      console.log('👋 Restore cancelled.');
      rl.close();
      return;
    }
    
    const backupIndex = parseInt(selection) - 1;
    if (isNaN(backupIndex) || backupIndex < 0 || backupIndex >= backupFiles.length) {
      console.log('❌ Invalid selection.');
      rl.close();
      return;
    }
    
    const selectedBackup = backupFiles[backupIndex];
    const backupPath = path.join(__dirname, '..', 'backups', selectedBackup);
    
    // Final confirmation
    const confirm = await askQuestion(`\n⚠️  Are you sure you want to restore from "${selectedBackup}"? This will REPLACE ALL current data! (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('👋 Restore cancelled.');
      rl.close();
      return;
    }
    
    console.log('\n🔄 Restoring database...');
    console.log(`📁 From: ${selectedBackup}`);
    
    // Add PostgreSQL to PATH for this process
    process.env.PATH = `/opt/homebrew/opt/postgresql@17/bin:${process.env.PATH}`;
    
    // First, drop all existing tables (clean restore)
    console.log('🧹 Cleaning existing database...');
    const cleanCommand = `pg_restore --clean --if-exists -v -d "${directDbUrl}" "${backupPath}"`;
    
    execSync(cleanCommand, {
      stdio: 'inherit',
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });
    
    console.log('\n✅ Database restored successfully!');
    console.log(`📁 From: ${backupPath}`);
    console.log(`🕐 Restored: ${new Date().toLocaleString()}`);
    console.log('\n💡 Tip: Run "npm run db:generate" to update your Prisma client if needed.');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL tools are installed: brew install postgresql@17');
    console.log('2. Verify your DIRECT_DATABASE_URL is correct');
    console.log('3. Check your database connection and permissions');
    console.log('4. Ensure the backup file is not corrupted');
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Add command line options
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 WeMoov Database Restore Tool');
  console.log('\nUsage:');
  console.log('  npm run restore       # Restore from a backup');
  console.log('  node scripts/restore-database.js');
  console.log('\nOptions:');
  console.log('  --help, -h           Show this help message');
  console.log('\n⚠️  WARNING: This will replace ALL data in your database!');
  console.log('Make sure to backup your current data before restoring.');
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  listBackups();
  process.exit(0);
}

restoreDatabase();