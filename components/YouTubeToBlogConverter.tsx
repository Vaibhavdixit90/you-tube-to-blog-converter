import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Youtube, Search, Clipboard } from "lucide-react";
import { YoutubeTranscript } from "youtube-transcript";
import { v4 as uuidv4 } from "uuid";
import MarkdownRenderer from "./MarkdownRenderer";

export default function YouTubeToBlogConverter() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [blogContent, setBlogContent] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");

  const handleFetchVideoDetailsAndTranscript = async () => {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    console.log("Video ID:", videoId);

    if (videoId) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
        );
        const data = await response.json();
        const videoData = data.items[0]?.snippet;
        console.log("Video Data:", videoData);

        if (videoData) {
          setVideoTitle(videoData.title);
          setVideoThumbnail(videoData.thumbnails.high.url);
        }

        const transcriptData = await YoutubeTranscript.fetchTranscript(
          videoUrl
        );
        const uniqueId = uuidv4();

        const videoDetails = {
          uniqueId: uniqueId,
          searchId: videoId,
          videoUrl: videoUrl,
          videoThumbnailImage: videoData?.thumbnails?.high?.url,
          videoTitle: videoData.title,
          videoTranscript: transcriptData,
        };

        console.log(
          "Video Details JSON:",
          JSON.stringify(videoDetails, null, 2)
        );

        await fetch("https://cms.flowautomate.io/api/video-to-blogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: videoDetails }),
        });

        const lambdaResponse = await fetch(
          "https://ahqtq5b5ms36lqgvw5kzirxxde0yzjmz.lambda-url.ap-south-1.on.aws",
          {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
            body: JSON.stringify({
              prompt: JSON.stringify(videoDetails.videoTranscript),
            }),
          }
        );

        const lambdaData = await lambdaResponse.json();
        console.log("Response from Lambda:", lambdaData);

        setBlogContent(lambdaData);
      } catch (error) {
        console.error("Error fetching video details or transcript:", error);
      }
    } else {
      alert("Invalid YouTube URL.");
    }
  };

  const handleCopyBlogContent = () => {
    if (blogContent) {
      navigator.clipboard
        .writeText(blogContent)
        .then(() => {
          alert("Blog content copied to clipboard!");
        })
        .catch(() => {
          alert("Failed to copy content!");
        });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        YouTube Video to Blog Converter
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Youtube className="text-red-600 hidden sm:block" />
              <Input
                type="text"
                placeholder="Enter YouTube URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={handleFetchVideoDetailsAndTranscript}
                className="w-full sm:w-auto"
              >
                <Search className="mr-2 h-4 w-4" /> Generate Blog
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Video Analysis</h2>
            <div className="flex flex-col space-y-4">
              {videoThumbnail && (
                <div className="w-full flex justify-center">
                  <img
                    src={videoThumbnail}
                    alt="Video Thumbnail"
                    className="w-full h-80 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              {videoTitle && (
                <h3 className="text-lg font-medium mt-5">{videoTitle}</h3>
              )}
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-1/2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generated Blog</h2>
              <Button
                onClick={handleCopyBlogContent}
                className="text-white bg-black dark:bg-white rounded-full"
              >
                <Clipboard className="h-5 w-5" /> Copy
              </Button>
            </div>
            <div className="prose max-w-none min-h-[500px] p-4 border rounded-md overflow-auto">
              {blogContent ? (
                <div><MarkdownRenderer markdown={blogContent}/></div>
              ) : (
                <div className="text-center mt-5 text-xl">
                  Your generated blog post will appear here...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
