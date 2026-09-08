import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

export default {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "wolf/avatares",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const tiposAceitos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposAceitos.includes(file.mimetype)) {
      return cb(new Error("Envie uma imagem JPG, PNG ou WEBP."));
    }
    cb(null, true);
  },
};