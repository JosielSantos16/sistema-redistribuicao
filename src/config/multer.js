import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

export default {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "wolf/comprovantes",
      resource_type: "auto", 
      allowed_formats: ["pdf"],
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Apenas arquivos PDF são permitidos."));
    }
    cb(null, true);
  },
};