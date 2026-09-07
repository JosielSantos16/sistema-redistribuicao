import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'comprovantes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default {
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) return cb(err);
        const filename = `${hash.toString('hex')}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
      });
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Apenas arquivos PDF são permitidos.'));
    }
    cb(null, true);
  },
};