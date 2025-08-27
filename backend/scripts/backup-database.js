import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const createBackup = () => {
  console.log('🔄 Starting database backup process...');
  
  // Get the direct database URL
  const directDbUrl = process.env.DIRECT_DATABASE_URL;
  
  if (!directDbUrl) {
    console.error('❌ DIRECT_DATABASE_URL not found in environment variables');
    console.log('Please make sure DIRECT_DATABASE_URL is set in your .env file');
    process.exit(1);
  }
  
  // Create backups directory if it doesn't exist
  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
    console.log('📁 Created backups directory');
  }
  
  // Generate timestamp for backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
  const backupFile = `wemoov-backup-${timestamp}.bak`;
  const backupPath = path.join(backupsDir, backupFile);
  
  try {
    console.log('📊 Creating database backup...');
    console.log(`📝 Backup file: ${backupFile}`);
    
    // Add PostgreSQL to PATH for this process
    process.env.PATH = `/opt/homebrew/opt/postgresql@17/bin:${process.env.PATH}`;
    
    // Use pg_dump with custom format for better compression and restore options
    const command = `pg_dump -Fc -v -d "${directDbUrl}" -f "${backupPath}"`;
    
    execSync(command, {
      stdio: 'inherit',
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer for large databases
    });
    
    // Check if backup file was created and get its size
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log('\n✅ Backup completed successfully!');
      console.log(`📁 File: ${backupPath}`);
      console.log(`📏 Size: ${fileSizeInMB} MB`);
      console.log(`🕐 Created: ${new Date().toLocaleString()}`);
      
      // List all backups in the directory
      const backupFiles = fs.readdirSync(backupsDir)
        .filter(file => file.startsWith('wemoov-backup-') && file.endsWith('.bak'))
        .sort()
        .reverse();
      
      console.log('\n📋 Available backups:');
      backupFiles.slice(0, 5).forEach((file, index) => {
        const filePath = path.join(backupsDir, file);
        const fileStats = fs.statSync(filePath);
        const size = (fileStats.size / (1024 * 1024)).toFixed(2);
        const created = fileStats.birthtime.toLocaleString();
        console.log(`  ${index + 1}. ${file} (${size} MB) - ${created}`);
      });
      
      if (backupFiles.length > 5) {
        console.log(`  ... and ${backupFiles.length - 5} more`);
      }
      
    } else {
      console.error('❌ Backup file was not created');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL tools are installed: brew install postgresql@17');
    console.log('2. Verify your DIRECT_DATABASE_URL is correct');
    console.log('3. Check your database connection and permissions');
    console.log('4. Ensure you have write permissions in the backups directory');
    process.exit(1);
  }
};

// Add command line options
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 WeMoov Database Backup Tool');
  console.log('\nUsage:');
  console.log('  npm run backup        # Create a new backup');
  console.log('  node scripts/backup-database.js');
  console.log('\nOptions:');
  console.log('  --help, -h           Show this help message');
  console.log('\nBackup files are stored in: backend/backups/');
  console.log('Format: wemoov-backup-YYYY-MM-DD_HH-MM-SS.bak');
  process.exit(0);
}

createBackup();