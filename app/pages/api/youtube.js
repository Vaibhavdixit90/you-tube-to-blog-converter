export default async function handler(req, res) {
  const { videoId } = req.query; // Extract videoId from query params
  const apiKey = "AIzaSyCzbRLy-KBwHBSGHIV52u8QgqFq5UkmI90";

  if (!videoId) {
    return res.status(400).json({ error: "Video ID is required" });
  }

  try {
    // Fetch data from YouTube API using the videoId
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch video data" });
    }

    const data = await response.json();

    // Check if the data contains valid items
    if (data.items && data.items.length > 0) {
      const videoData = data.items[0].snippet;

      return res.status(200).json({
        title: videoData.title,
        thumbnail: videoData.thumbnails.high.url,
        description: videoData.description,
      });
    } else {
      return res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    console.error("Error fetching YouTube video data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
