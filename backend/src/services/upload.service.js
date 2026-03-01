// src/services/upload.service.js
const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getS3Client } = require("../config/s3");
const { HttpError } = require("../utils/httpError");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);
const MAX_MB = 6;

async function presignRewardImageUpload({
  businessId,
  rewardId,
  mimeType,
  fileSize,
}) {
  if (!businessId || !rewardId) {
    throw new HttpError(
      400,
      "Invalid businessId or rewardId.",
      "INVALID_PARAMS",
    );
  }

  if (!mimeType || !ALLOWED_MIME.has(mimeType)) {
    throw new HttpError(400, "Only JPG/PNG allowed.", "INVALID_MIMETYPE");
  }

  if (typeof fileSize === "number" && fileSize > MAX_MB * 1024 * 1024) {
    throw new HttpError(
      400,
      `File too large. Max ${MAX_MB}MB.`,
      "FILE_TOO_LARGE",
    );
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

  if (!bucket) throw new Error("Missing AWS_S3_BUCKET env var.");
  if (!publicBaseUrl)
    throw new Error("Missing AWS_S3_PUBLIC_BASE_URL env var.");

  const s3 = getS3Client();

  const ext = mimeType === "image/png" ? "png" : "jpg";
  const rand = crypto.randomBytes(12).toString("hex");

  // “carpetas” por prefijo (bucket único por ambiente)
  const key = `public/business/${businessId}/rewards/${rewardId}/${Date.now()}_${rand}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

  return { uploadUrl, publicUrl, key };
}

module.exports = { presignRewardImageUpload };
