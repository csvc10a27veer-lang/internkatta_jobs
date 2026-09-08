# Recovering Deleted Items

## Situation
If an item (course or internship) was deleted **before** the recycle bin feature was implemented, it was permanently removed from the database (hard delete). These items won't appear in the recycle bin.

## Recovery Options

### Option 1: MongoDB Atlas Backups (Recommended)
If you're using MongoDB Atlas, they provide automatic backups:

1. **Log into MongoDB Atlas**: https://cloud.mongodb.com
2. **Navigate to your cluster** → **Backups** tab
3. **Find a backup from before the deletion**
4. **Restore the backup** to a temporary cluster or collection
5. **Export the specific internship** from the backup
6. **Import it back** into your current database

### Option 2: Manual Database Backup
If you have a manual database backup:

```bash
# Restore from backup (example)
mongorestore --uri="your_mongodb_uri" --db=InternKatta backup_folder/
```

### Option 3: Check MongoDB Oplog (If Replication Enabled)
If you have MongoDB replication enabled, you might be able to recover from oplog:

```bash
# Connect to MongoDB
mongosh "your_mongodb_uri"

# Check oplog (if available)
use local
db.oplog.rs.find({ns: "InternKatta.internships"}).sort({ts: -1}).limit(10)
```

### Option 4: Recreate the Item
If recovery is not possible, you'll need to recreate the internship manually through the admin panel.

## Check Current Deleted Items

Run this script to see what's currently in the recycle bin:

```bash
cd /var/www/internkatta.com/backend
node check_deleted_items.js
```

## Prevention
Going forward, all deletions will use soft delete and items will be moved to the recycle bin, so you can always restore them.



