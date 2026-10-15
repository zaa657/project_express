import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import path from 'node:path';
import fs from 'node:fs';
import { ENV } from '../config/env';

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'local';
  publicId?: string;
}

export class StorageService {
  private static isConfigured = false;

  private static configureCloudinary(): boolean {
    if (this.isConfigured) return true;

    if (
      ENV.CLOUDINARY_CLOUD_NAME &&
      ENV.CLOUDINARY_API_KEY &&
      ENV.CLOUDINARY_API_SECRET
    ) {
      cloudinary.config({
        cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
        api_key: ENV.CLOUDINARY_API_KEY,
        api_secret: ENV.CLOUDINARY_API_SECRET,
        secure: true
      });
      this.isConfigured = true;
      return true;
    }

    return false;
  }

  /**
   * Upload image to Cloudinary or fallback to local storage
   */
  static async uploadImage(
    file: Express.Multer.File,
    folder = 'project_express'
  ): Promise<UploadResult> {
    const isCloudinaryReady = this.configureCloudinary();

    // 1. If Cloudinary credentials are provided in .env, upload to Cloudinary
    if (isCloudinaryReady) {
      try {
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'image'
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Gagal upload ke Cloudinary'));
              }
              resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });

        return {
          url: uploadResult.secure_url,
          provider: 'cloudinary',
          publicId: uploadResult.public_id
        };
      } catch (err: any) {
        console.error('⚠️ Gagal upload ke Cloudinary, beralih ke penyimpanan lokal:', err.message);
      }
    }

    // 2. Fallback to local storage (allows offline testing in Thunder Client)
    if (!fs.existsSync(ENV.UPLOAD_DIR)) {
      fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(ENV.UPLOAD_DIR, uniqueName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${uniqueName}`,
      provider: 'local'
    };
  }

  /**
   * Delete image from Cloudinary or local disk
   */
  static async deleteImage(imageUrl: string | null | undefined): Promise<void> {
    if (!imageUrl) return;

    if (imageUrl.includes('res.cloudinary.com')) {
      // Delete from Cloudinary
      this.configureCloudinary();
      try {
        // Parse public_id from Cloudinary URL (e.g. project_express/img-12345)
        const parts = imageUrl.split('/');
        const filenameWithExt = parts.pop() || '';
        const filename = filenameWithExt.split('.')[0];
        const folder = parts.pop() || '';
        const publicId = `${folder}/${filename}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Gagal menghapus foto dari Cloudinary:', err);
      }
    } else {
      // Delete from local filesystem
      try {
        const filename = path.basename(imageUrl);
        const fullPath = path.join(ENV.UPLOAD_DIR, filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error('Gagal menghapus file foto lokal:', err);
      }
    }
  }
}
