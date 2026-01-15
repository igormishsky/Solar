import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { isValidFileType, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../lib/s3';
import { AppError } from './errorHandler';

// Configure multer for memory storage (we'll upload to S3)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (isValidFileType(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        `Invalid file type: ${file.mimetype}. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
        400
      )
    );
  }
};

// Create multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files per request
  },
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', 10);

// Mixed fields upload middleware (for forms with text and files)
export const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 10 },
  { name: 'document', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
]);

// Error handling middleware for multer errors
export function handleMulterError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files per request';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected field: ${err.field}`;
        break;
      default:
        message = err.message;
    }

    return res.status(statusCode).json({ error: message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  next(err);
}

// Middleware to check if a file was uploaded
export function requireFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  next();
}

// Helper to get uploaded files from request (handles both single and multiple)
export function getUploadedFiles(req: Request): Express.Multer.File[] {
  if (req.file) {
    return [req.file];
  }
  if (Array.isArray(req.files)) {
    return req.files;
  }
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }
  return [];
}
