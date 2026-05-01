import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const useCloudinary = Boolean(
  env.CLOUDINARY.cloud_name && env.CLOUDINARY.api_key && env.CLOUDINARY.api_secret,
);

if (useCloudinary) {
  cloudinary.config(env.CLOUDINARY);
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

export async function storeAvatar(file, userId) {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'team-hub/avatars', public_id: userId, overwrite: true },
        (err, result) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }

  const ext = (file.mimetype.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  const hash = crypto.randomBytes(6).toString('hex');
  const filename = `${userId}-${hash}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.promises.writeFile(fullPath, file.buffer);
  const base = `http://localhost:${env.PORT}`;
  return `${base}/uploads/${filename}`;
}
