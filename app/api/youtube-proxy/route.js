export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: "Missing videoId parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch video data from YouTube API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY; // Store this securely
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch YouTube data");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all domains to access this endpoint
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all domains to access this endpoint
      },
    });
  }
}
