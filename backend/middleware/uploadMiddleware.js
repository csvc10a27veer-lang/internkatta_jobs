const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directories exist
fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'thumbnails'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'submissions'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'profiles'), { recursive: true });

// --- Storage configuration for THUMBNAILS (Images Only) ---
const thumbnailStorage = multer.memoryStorage(); // Store in memory for sharp processing

// --- Storage configuration for SUBMITTED TASK FILES (Any File Type) ---
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We will save submissions in a new, separate folder
        cb(null, 'uploads/submissions'); 
    },
    filename: (req, file, cb) => {
        try {
            const { internshipId, lectureId } = req.body || {};
            const safeInternshipId = (internshipId && internshipId !== 'undefined') ? internshipId : 'unknown';
            const safeLectureId = (lectureId && lectureId !== 'undefined') ? lectureId : 'unknown';
            const userId = req.user?._id?.toString() || 'unknown';
            const uniqueSuffix = `${userId}-${safeInternshipId}-${safeLectureId}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = path.extname(file.originalname) || '';
            cb(null, uniqueSuffix + extension);
        } catch (error) {
            console.error('Error generating filename:', error);
            const fallbackName = `submission-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname) || ''}`;
            cb(null, fallbackName);
        }
    }
});


// --- File Filters ---
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for thumbnails.'), false);
    }
};

const safeFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'text/plain',
        'text/csv'
    ];
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.msi', '.ps1', '.vbs', '.js', '.php', '.py'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (dangerousExtensions.includes(ext)) {
        return cb(new Error('Dangerous file type not allowed.'), false);
    }

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types are PDF, ZIP, DOC, DOCX, TXT, CSV, JPG, PNG.`), false);
    }
};


// --- Create and Export Multer Instances ---
const uploadThumbnail = multer({ 
    storage: thumbnailStorage, 
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for thumbnails
    }
});

// --- Middleware to process thumbnail with sharp ---
const sharp = require('sharp');
const processThumbnail = async (req, res, next) => {
    if (!req.file && (!req.files || Object.keys(req.files).length === 0)) return next();

    const processSingleImage = async (file, prefix) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // Pass through SVG directly without sharp conversion
        if (file.mimetype === 'image/svg+xml') {
            const filename = `${prefix}-${uniqueSuffix}.svg`;
            const filepath = path.join(__dirname, '..', 'uploads', 'thumbnails', filename);
            fs.writeFileSync(filepath, file.buffer);
            return { filename, filepath, mimetype: 'image/svg+xml' };
        }

        // Convert other images to WebP
        const filename = `${prefix}-${uniqueSuffix}.webp`;
        const filepath = path.join(__dirname, '..', 'uploads', 'thumbnails', filename);
        await sharp(file.buffer).webp({ quality: 80 }).toFile(filepath);
        return { filename, filepath, mimetype: 'image/webp' };
    };

    try {
        if (req.file) {
            const result = await processSingleImage(req.file, 'internship');
            req.file.filename = result.filename;
            req.file.path = result.filepath;
            req.file.mimetype = result.mimetype;
        }

        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                const result = await processSingleImage(req.files.thumbnail[0], 'internship-thumb');
                req.files.thumbnail[0].filename = result.filename;
                req.files.thumbnail[0].path = result.filepath;
                req.files.thumbnail[0].mimetype = result.mimetype;
            }
            if (req.files.bannerImage && req.files.bannerImage[0]) {
                const result = await processSingleImage(req.files.bannerImage[0], 'internship-banner');
                req.files.bannerImage[0].filename = result.filename;
                req.files.bannerImage[0].path = result.filepath;
                req.files.bannerImage[0].mimetype = result.mimetype;
            }
        }
        
        next();
    } catch (error) {
        console.error('Error processing thumbnail image:', error);
        return res.status(500).json({ message: 'Error processing image format' });
    }
};

// --- Middleware to process profile picture with sharp ---
const processProfilePicture = async (req, res, next) => {
    if (!req.file) return next();

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `profile-${uniqueSuffix}.webp`;
    const filepath = path.join(__dirname, '..', 'uploads', 'profiles', filename);

    try {
        await sharp(req.file.buffer)
            .resize(400, 400, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(filepath);
        
        // Update req.file so downstream controllers use the new path and filename
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.mimetype = 'image/webp';
        
        next();
    } catch (error) {
        console.error('Error processing profile image:', error);
        return res.status(500).json({ message: 'Error processing image format' });
    }
};

const uploadSubmission = multer({ 
    storage: submissionStorage, 
    fileFilter: safeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit per task submission file
    }
});

module.exports = { 
    uploadThumbnail,
    processThumbnail,
    uploadSubmission,
    processProfilePicture
};