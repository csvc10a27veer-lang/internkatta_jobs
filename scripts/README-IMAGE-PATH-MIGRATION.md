# Image Path Migration: JPEG/PNG to WebP

## Problem

After converting all images to WebP format, the database still contains old `.jpeg` and `.png` paths. This causes the frontend to try loading non-existent files.

## Solution

Two-part solution:

### 1. Frontend Fix (Already Applied)

The `InternshipView` component now uses the `OptimizedImage` component which:
- Automatically tries WebP version first
- Falls back to original format if WebP doesn't exist
- Works seamlessly without breaking existing content

### 2. Database Migration (Run This Script)

The migration script updates all image paths in the database from `.jpeg`/`.png` to `.webp`.

## How to Run Migration

### Prerequisites

1. Ensure you have WebP versions of all images in the filesystem
2. Make sure MongoDB connection is configured in `backend/.env`

### Steps

1. **Navigate to backend directory (where mongoose is installed):**
   ```bash
   cd /var/www/internkatta.com/backend
   ```

2. **Run the migration script from backend:**
   ```bash
   node ../scripts/migrate-image-paths-to-webp.js
   ```
   
   **OR** navigate to project root and run:
   ```bash
   cd /var/www/internkatta.com
   cd backend && node ../scripts/migrate-image-paths-to-webp.js
   ```

3. **The script will:**
   - Connect to MongoDB
   - Find all internships and courses
   - Check each content section image path
   - Convert `.jpeg`/`.jpg`/`.png` to `.webp` if WebP file exists
   - Skip paths where WebP doesn't exist (keeps original)
   - Save updated documents
   - Show summary of changes

### Example Output

```
✅ Connected to MongoDB

📚 Migrating Internship image paths...
Found 15 internships
  ✅ Updated: /assets/Categories/MERN/1.jpeg → /assets/Categories/MERN/1.webp
  ✅ Updated: /assets/Categories/MERN/2.jpeg → /assets/Categories/MERN/2.webp
  ⚠️  Skipped (WebP not found): /assets/old/image.png
✅ Saved internship: MERN Stack Development Internship

📖 Migrating Course image paths...
Found 8 courses
  ✅ Updated: /assets/Categories/React/1.png → /assets/Categories/React/1.webp

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Total paths updated: 127
⚠️  Total paths skipped (WebP not found): 3
❌ Total errors: 0
============================================================

✅ Migration completed successfully!

🔌 Disconnected from MongoDB
```

## What Gets Updated

- **Internships**: All `lecture.contentSections[].image` paths
- **Courses**: All `section.lectures[].contentSections[].image` paths

## Safety Features

1. **Only updates if WebP exists**: Script checks filesystem before updating
2. **Preserves original if WebP missing**: Keeps `.jpeg`/`.png` if WebP doesn't exist
3. **No data loss**: Only updates paths, doesn't delete anything
4. **Dry run possible**: You can modify script to log without saving

## Rollback

If needed, you can manually revert paths in MongoDB or restore from backup.

## Notes

- The frontend `OptimizedImage` component will work even without migration (it tries WebP first, then falls back)
- Migration is recommended for optimal performance (avoids fallback attempts)
- Run migration after converting all images to WebP format

