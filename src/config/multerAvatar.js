import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'avatares');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

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
    fileSize: 2 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (!TIPOS_ACEITOS.includes(file.mimetype)) {
      return cb(new Error('Envie uma imagem JPG, PNG ou WEBP.'));
    }
    cb(null, true);
  },
};