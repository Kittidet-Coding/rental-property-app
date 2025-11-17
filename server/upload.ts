import { Express, Request, Response } from "express";
import { storagePut } from "./storage";

export function registerUploadRoute(app: Express) {
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // Handle multipart form data
      const body = req.body as any;

      if (!body || !body.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const fileData = body.file;
      const mimeType = body.mimeType || "image/jpeg";
      const fileName = body.fileName || "image.jpg";

      // Validate file type
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimes.includes(mimeType)) {
        return res
          .status(400)
          .json({ error: "Invalid file type. Only images are allowed." });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const extension = fileName.split(".").pop() || "jpg";
      const filename = `${timestamp}-${random}.${extension}`;

      // Upload to S3
      const { url } = await storagePut(
        `properties/${filename}`,
        fileData,
        mimeType
      );

      res.json({ url, key: `properties/${filename}` });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });
}
