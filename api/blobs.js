import { list, del } from "@vercel/blob";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const { blobs } = await list();
      const pdfBlobs = blobs
        .filter((blob) => blob.pathname.endsWith(".pdf"))
        .map((blob) => ({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        }));

      return res.status(200).json(pdfBlobs);
    }

    if (req.method === "DELETE") {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ error: "url is required" });
      }
      await del(url);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Blob API error:", error);
    return res.status(500).json({ error: "Failed to fetch blobs" });
  }
}
