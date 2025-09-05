const formidable = require("formidable");
const crypto = require("crypto");
const MediaService = require("../services/media.service");
const asyncHandler = require("../utils/asyncHandler");

class MediaController {
  /**
   * Upload media
   */
  static upload = asyncHandler(async (req, res, next) => {
    const form = formidable({ multiples: false });

    form.parse(async (err, fields, files) => {
      if (err) return next(err);

      const file = files.upload;
      const userId = req.user.id;

      // Generate random filename (no metadata)
      const randomName = crypto.randomUUID();
      const key = `uploads/${randomName}`;

      const media = await MediaService.uploadFile(file.filepath, key, {
        userId,
        mimeType: file.mimetype,
        originalName: file.originalFilename,
      });

      res.status(201).json({
        success: true,
        media,
      });
    });
  });

  /**
   * Get file metadata
   */
  static getFile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const media = await MediaService.getFile(id);

    res.status(200).json({
      success: true,
      media,
    });
  });

  /**
   * Delete file
   */
  static deleteFile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await MediaService.deleteFile(id);

    res.status(200).json({
      success: true,
      ...result,
    });
  });
}

module.exports = MediaController;
