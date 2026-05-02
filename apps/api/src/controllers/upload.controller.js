import { storeFile } from '../lib/upload.js';
import { badRequest } from '../lib/errors.js';

export async function uploadFile(req, res) {
  if (!req.file) throw badRequest('No file uploaded');
  const url = await storeFile(req.file);
  res.json({ data: { url, name: req.file.originalname, type: req.file.mimetype, size: req.file.size } });
}
