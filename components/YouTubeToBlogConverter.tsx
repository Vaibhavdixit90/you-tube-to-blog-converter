import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Youtube, Search, Clipboard } from "lucide-react"; // Import Clipboard icon
import { YoutubeTranscript } from "youtube-transcript"; // Correct import
import { v4 as uuidv4 } from "uuid";

type TranscriptLine = {
  offset: number;
  duration: number;
  text: string;
};

export default function YouTubeToBlogConverter() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [blogContent, setBlogContent] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const handleFetchVideoDetailsAndTranscript = async () => {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    console.log("Video ID:", videoId);

    if (videoId) {
      try {
        // Fetch video details from YouTube API
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyCzbRLy-KBwHBSGHIV52u8QgqFq5UkmI90`
        );
        const data = await response.json();
        const videoData = data.items[0]?.snippet;
        console.log("Video Data:", videoData);

        if (videoData) {
          setVideoTitle(videoData.title);
          setVideoThumbnail(videoData.thumbnails.high.url); // Ensure thumbnail exists
        }

        // Fetch transcript using youtube-transcript
        const transcriptData = await YoutubeTranscript.fetchTranscript(
          videoUrl
        );

        // Format timestamp in minutes:seconds format
        const formatTimestamp = (seconds: number): string => {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = Math.round(seconds % 60);
          return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
          }${remainingSeconds}`;
        };

        // Generate blog content with timestamps and durations
        const generatedBlog = `
          <p>
            ${transcriptData
              .map((line: TranscriptLine, index: number) => {
                const startTime = formatTimestamp(line.offset);
                const endTime = formatTimestamp(line.offset + line.duration); // Calculate end time based on offset + duration
                return `<strong>[${startTime} - ${endTime}]</strong> ${line.text}`;
              })
              .join(" ")}
          </p>
        `;

        // Generate a unique ID for the video
        const uniqueId = uuidv4();

        // Prepare the JSON object to log
        const videoDetails = {
          uniqueId: uniqueId, // Unique ID added
          searchId: videoId,
          videoUrl: videoUrl,
          videoThumbnailImage: videoData?.thumbnails?.high?.url,
          videoTitle: videoData.title,
          videoTranscript: transcriptData,
        };

        // Log the JSON object to console
        console.log(
          "Video Details JSON:",
          JSON.stringify(videoDetails, null, 2)
        );

        // POST request to Strapi API with "data" payload
        const strapiResponse = await fetch(
          "https://cms.flowautomate.io/api/video-to-blogs",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: videoDetails, // Wrap videoDetails in a "data" object
            }),
          }
        );

        const strapiData = await strapiResponse.json();
        console.log("Response from Strapi:", strapiData);

        // Update state with the data
        setTranscript(transcriptData);
        setBlogContent(generatedBlog);
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
        .catch((error) => {
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
        {/* Left Column */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Input Section */}
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

          {/* Video Analysis Section */}
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

        {/* Right Column */}
        <div className="w-full lg:w-1/2">
          {/* Preview Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              {/* Title Section */}
              <h2 className="text-xl font-semibold">Generated Blog</h2>
              <Button
                onClick={handleCopyBlogContent}
                className="text-white bg-black dark:bg-white rounded-full"
              >
                <Clipboard className="h-5 w-5" />
                Copy
              </Button>
            </div>

            {/* Blog Content */}
            <div className="prose max-w-none min-h-[500px] p-4 border rounded-md overflow-auto">
              {blogContent ? (
                <div dangerouslySetInnerHTML={{ __html: blogContent }} />
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
