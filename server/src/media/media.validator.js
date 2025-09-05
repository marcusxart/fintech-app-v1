const { z } = require("zod");

const uuidField = z.uuid("Invalid UUID format");

const uploadMediaSchema = z.object({
  file: z
    .custom((val) => val && val.filepath, "File is required")
    .refine((file) => file.size > 0, "File cannot be empty")
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype),
      "Unsupported file type"
    ),
});

const getMediaSchema = z.object({
  params: z.object({
    id: uuidField,
  }),
});

const deleteMediaSchema = z.object({
  params: z.object({
    id: uuidField,
  }),
});

module.exports = {
  uploadMediaSchema,
  getMediaSchema,
  deleteMediaSchema,
};
