const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const { BadRequestError, NotFoundError } = require("../utils/appError");
const { Media } = require("../models");

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;

class MediaService {
  /**
   * Upload a file to R2 and save Media record
   */
  static async uploadFile(filePath, key, { userId, mimeType, originalName }) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: mimeType || "application/octet-stream",
      });

      await r2.send(command);

      // Save Media record
      const media = await Media.create({
        userId,
        key,
        url: `${process.env.CDN_BASE_URL}/${key}`, // You can adjust depending on your setup
        size: stats.size,
        mimeType,
        originalName,
      });

      return media;
    } catch (error) {
      throw new BadRequestError(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata from Media table
   */
  static async getFile(id) {
    try {
      const media = await Media.findByPk(id);
      if (!media) throw new NotFoundError("File not found");
      return media;
    } catch (error) {
      throw new BadRequestError(`Could not retrieve file: ${error.message}`);
    }
  }

  /**
   * Delete a file from R2 and remove Media record
   */
  static async deleteFile(id) {
    try {
      const media = await Media.findByPk(id);
      if (!media) throw new NotFoundError("File not found");

      // Delete from R2
      const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: media.key,
      });
      await r2.send(command);

      // Delete DB record
      await media.destroy();

      return { id, message: "File deleted successfully" };
    } catch (error) {
      throw new BadRequestError(`Delete failed: ${error.message}`);
    }
  }
}

module.exports = MediaService;
