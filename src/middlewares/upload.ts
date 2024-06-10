import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';
import path from 'path';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

//Create a folder if not exist
const uploadFolder = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadFolder, { recursive: true });

export const fileStorage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): void => {
    callback(null, uploadFolder);
  },
  //	Каталог, где будет сохранен файл

  filename: (req: Request, file: Express.Multer.File, callback: FileNameCallback): void => {
    let filePath = '';
    const id = req.params.eventId || req.params.userId;
    if (req.params.eventId) {
      filePath = path.join(req.params.eventId, file.originalname);
    } else if (req.params.userId) {
      filePath = path.join(req.params.userId, 'avatar.png');
    }

    const folderPath = path.join(uploadFolder, id);
    fs.mkdirSync(folderPath, { recursive: true });
    callback(null, filePath);
  },
  // Имя файла без destination
});

export const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

export const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
