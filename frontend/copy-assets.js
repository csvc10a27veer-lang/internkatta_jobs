import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy assets from src/assets to public/assets
const copyAssets = () => {
  const srcAssetsDir = path.join(__dirname, 'src', 'assets');
  const publicAssetsDir = path.join(__dirname, 'public', 'assets');

  // Create public/assets directory if it doesn't exist
  if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
  }

  // Function to copy directory recursively
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${entry.name}`);
      }
    }
  };

  // Copy all assets
  if (fs.existsSync(srcAssetsDir)) {
    copyDir(srcAssetsDir, publicAssetsDir);
    console.log('✅ Assets copied successfully to public/assets/');

    // Copy specific root files if they exist
    const rootFilesToCopy = [
      'Completion Certificate_Internkatta.png'
    ];
    for (const fileName of rootFilesToCopy) {
      const srcFilePath = path.join(__dirname, fileName);
      const destFilePath = path.join(publicAssetsDir, fileName);
      if (fs.existsSync(srcFilePath)) {
        fs.copyFileSync(srcFilePath, destFilePath);
        console.log(`Copied from root: ${fileName}`);
      }
    }
    
    // List all copied files for verification
    const listFiles = (dir, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          listFiles(fullPath, prefix + entry.name + '/');
        } else {
          console.log(`📁 ${prefix}${entry.name}`);
        }
      }
    };
    
    console.log('\n📋 Copied files:');
    listFiles(publicAssetsDir);
  } else {
    console.log('❌ src/assets directory not found');
  }
};

copyAssets();
