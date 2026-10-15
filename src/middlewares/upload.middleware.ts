import multer from 'multer';

// Use memoryStorage so the file buffer can be uploaded directly to ImageKit or local storage
const storage = multer.memoryStorage();

// File filter: accept images only
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya gambar (JPG, JPEG, PNG, WEBP, GIF) yang diperbolehkan.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});
