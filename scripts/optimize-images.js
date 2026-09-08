/**
 * Image Optimization Script
 * 
 * This script will:
 * 1. Compress all JPEG/PNG images in Categories folder
 * 2. Convert them to WebP format (keeping originals as backup)
 * 3. Reduce file sizes by 60-80%
 * 
 * Usage: 
 *   From backend directory: node ../scripts/optimize-images.js
 *   OR from project root: cd backend && node ../scripts/optimize-images.js
 * 
 * Prerequisites:
 *   npm install sharp (in backend directory)
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');

// Get paths
const scriptDir = __dirname;
const projectRoot = path.join(scriptDir, '..');
const backendPath = path.join(projectRoot, 'backend');
const backendNodeModules = path.join(backendPath, 'node_modules');

// Add backend node_modules to module search path
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain) {
    // Try backend node_modules first for non-relative paths
    if (!request.startsWith('.') && !path.isAbsolute(request)) {
        const backendModulePath = path.join(backendNodeModules, request);
        try {
            return originalResolveFilename(backendModulePath, parent, isMain);
        } catch (e) {
            // Fall through to normal resolution
        }
    }
    return originalResolveFilename(request, parent, isMain);
};

// Now we can require sharp (it will be found in backend/node_modules)
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('❌ Error: sharp module not found!');
    console.error('   Please install it: cd backend && npm install sharp');
    console.error('   Error details:', error.message);
    process.exit(1);
}

const CATEGORIES_PATH = path.join(__dirname, '../frontend/public/assets/Categories');
const BACKUP_PATH = path.join(__dirname, '../frontend/public/assets/Categories_backup');

// Create backup directory
if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
}

async function optimizeImage(inputPath, outputPath, backupPath) {
    try {
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size;
        
        // Create backup
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.copyFileSync(inputPath, backupPath);
        
        // Convert to WebP with compression
        await sharp(inputPath)
            .webp({ 
                quality: 85, // High quality but smaller size
                effort: 6    // Higher effort = better compression
            })
            .toFile(outputPath);
        
        const newStats = fs.statSync(outputPath);
        const newSize = newStats.size;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
        
        return {
            success: true,
            originalSize,
            newSize,
            reduction: `${reduction}%`
        };
    } catch (error) {
        console.error(`Error optimizing ${inputPath}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function processCategory(categoryPath, categoryName) {
    const files = fs.readdirSync(categoryPath);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
    
    console.log(`\n📁 Processing category: ${categoryName} (${imageFiles.length} images)`);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let successCount = 0;
    
    for (const file of imageFiles) {
        const inputPath = path.join(categoryPath, file);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const webpPath = path.join(categoryPath, `${baseName}.webp`);
        const backupPath = path.join(BACKUP_PATH, categoryName, file);
        
        // Skip if WebP already exists
        if (fs.existsSync(webpPath)) {
            console.log(`  ⏭️  Skipping ${file} (WebP already exists)`);
            continue;
        }
        
        const result = await optimizeImage(inputPath, webpPath, backupPath);
        
        if (result.success) {
            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
            successCount++;
            console.log(`  ✅ ${file} → ${baseName}.webp (${result.reduction} reduction)`);
        } else {
            console.log(`  ❌ ${file}: ${result.error}`);
        }
    }
    
    if (successCount > 0) {
        const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
        console.log(`  📊 Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB → ${(totalNewSize / 1024 / 1024).toFixed(2)} MB (${totalReduction}% reduction)`);
    }
    
    return { successCount, totalOriginalSize, totalNewSize };
}

async function main() {
    console.log('🚀 Starting image optimization...\n');
    console.log(`📂 Source: ${CATEGORIES_PATH}`);
    console.log(`💾 Backup: ${BACKUP_PATH}\n`);
    
    if (!fs.existsSync(CATEGORIES_PATH)) {
        console.error('❌ Categories folder not found!');
        process.exit(1);
    }
    
    const categories = fs.readdirSync(CATEGORIES_PATH, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    console.log(`Found ${categories.length} categories\n`);
    
    let grandTotalOriginal = 0;
    let grandTotalNew = 0;
    let grandSuccessCount = 0;
    
    for (const category of categories) {
        const categoryPath = path.join(CATEGORIES_PATH, category);
        const result = await processCategory(categoryPath, category);
        
        grandTotalOriginal += result.totalOriginalSize;
        grandTotalNew += result.totalNewSize;
        grandSuccessCount += result.successCount;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total images processed: ${grandSuccessCount}`);
    console.log(`Original size: ${(grandTotalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New size (WebP): ${(grandTotalNew / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total reduction: ${((grandTotalOriginal - grandTotalNew) / grandTotalOriginal * 100).toFixed(2)}%`);
    console.log(`Space saved: ${((grandTotalOriginal - grandTotalNew) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n💾 Originals backed up to: ${BACKUP_PATH}`);
    console.log('\n✅ Optimization complete!');
}

main().catch(console.error);

