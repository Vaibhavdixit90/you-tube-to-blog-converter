import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Clipboard, Loader2, Play } from "lucide-react";
import { marked } from "marked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import YouTubeToBlogFlow from "../app/YouTubeBlogFlow/page";

export default function YouTubeToBlogConverter() {
  // State variables
  const [videoUrl, setVideoUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [videoDetailsJson, setVideoDetailsJson] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newVideo, setNewVideo] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState("");
  const [previousRelatedBlogsData, setPreviousRelatedBlogsData] = useState<
    any[]
  >([]);
  const [copy, setCopy] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<any>(null);
  const [existingVideoId, setExistingVideoId] = useState<any>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    Target_audience: "",
    Audience_age_group: "",
    Writing_style: "",
    Additional_instructions: "",
  });
  const [newBlog, setNewBlog] = useState(false);
  const [selectedUniqueBlogId, setSelectedUniqueBlogId] = useState("");
  const [generatedBlogIds, setGeneratedBlogIds] = useState<Set<string>>(
    new Set()
  );
  const [currentTab, setCurrentTab] = useState("analysis");

  // Update form data on change.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create an array from previousRelatedBlogsData (or an empty array if none)
  const extractedBlogs =
    previousRelatedBlogsData?.map(
      ({
        Title,
        Target_audience,
        Audience_age_group,
        Writing_style,
        Additional_instructions,
        Version,
      }: any) => ({
        Title,
        Target_audience,
        Audience_age_group,
        Writing_style,
        Additional_instructions,
        Version,
      })
    ) ?? [];

  // Register a global function to handle blog button clicks.
  if (typeof window !== "undefined") {
    (window as any).handleBlogButtonClick = (uniqueItemId: string) => {
      try {
        const textContainer = document.getElementById(`${uniqueItemId}-text`);
        const blogText = textContainer?.textContent?.trim() || "";

        setSelectedUniqueBlogId(uniqueItemId);
        setBlogContent(blogText);

        const existingBlog = extractedBlogs?.find((blog) => {
          return (
            blog?.Title?.toLowerCase().trim() === blogText.toLowerCase().trim()
          );
        });

        if (existingBlog) {
          setFormData({
            Target_audience: existingBlog.Target_audience || "",
            Audience_age_group: existingBlog.Audience_age_group || "",
            Writing_style: existingBlog.Writing_style || "",
            Additional_instructions: existingBlog.Additional_instructions || "",
          });
        } else {
          // Reset form data if no matching blog is found.
          setFormData({
            Target_audience: "",
            Audience_age_group: "",
            Writing_style: "",
            Additional_instructions: "",
          });
        }

        // Open the dialog for editing.
        setOpenDialog(true);
      } catch (error) {
        console.error("Error in handleBlogButtonClick:", error);
      }
    };
  }

  const handleNewBlogState = () => {
    setNewBlog(true);
    setTimeout(() => setNewBlog(false), 1000); // Reset after 1 second
  };

  useEffect(() => {
    extractBlogTitles();
  }, [analysisData, previousRelatedBlogsData, generatedBlogIds]);

  // Assign unique IDs and buttons to blog items inside the passed HTML string.
  function assignUniqueIdsToBlogItems(htmlString: string): string {
    try {
      const container = document.createElement("div");
      container.innerHTML = htmlString;

      let globalBlogCounter = 0;
      const potentialLabels = container.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, strong, div"
      );

      potentialLabels.forEach((elem) => {
        const text = elem.textContent?.trim().toLowerCase() || "";
        if (text.includes("blogs")) {
          let olElem: Element | null = elem.nextElementSibling;
          if (!olElem || olElem.tagName.toLowerCase() !== "ol") {
            const parent = elem.parentElement;
            if (parent) {
              olElem = parent.querySelector("ol");
            }
          }
          if (olElem && olElem.tagName.toLowerCase() === "ol") {
            const listItems = Array.from(olElem.querySelectorAll("li"));
            listItems.forEach((item) => {
              globalBlogCounter++;
              const uniqueItemId = `blog-item-${globalBlogCounter}`;
              const uniqueButtonId = `blog-button-${globalBlogCounter}`;

              item.setAttribute("id", uniqueItemId);
              item.classList.add(
                "blog-item",
                "flex",
                "justify-between",
                "items-center",
                "max-w-7xl",
                "p-2"
              );

              const originalContent = item.innerHTML;
              item.innerHTML = "";

              // Create a span to hold the blog text.
              const textContainer = document.createElement("span");
              textContainer.innerHTML = originalContent;
              textContainer.setAttribute("id", `${uniqueItemId}-text`);

              // Create a button for generating or regenerating the blog.
              const button = document.createElement("button");
              button.classList.add("blog-button");
              button.setAttribute("id", uniqueButtonId);
              button.innerText = "Generate Blog";
              button.setAttribute(
                "onclick",
                `handleBlogButtonClick('${uniqueItemId}')`
              );

              item.appendChild(textContainer);
              item.appendChild(button);
            });
          } else {
            console.warn("No <ol> found near element:", elem);
          }
        }
      });
      return container.innerHTML;
    } catch (error) {
      console.error("Error in assignUniqueIdsToBlogItems:", error);
      return htmlString;
    }
  }

  // Extract blog titles from the generated HTML so we can update button texts.
  function extractBlogTitles() {
    try {
      const blogTextElements = document.querySelectorAll('[id$="-text"]');

      const blogTitles: { [key: string]: string } = {};
      blogTextElements.forEach((el) => {
        const uniqueBlogId = el.id.replace("-text", "");
        blogTitles[uniqueBlogId] = el.textContent?.trim() || "";
      });

      Object.entries(blogTitles).forEach(([uniqueId, text]) => {
        const exists =
          Array.isArray(extractedBlogs) &&
          extractedBlogs.some(
            (blog) =>
              blog?.Title?.toLowerCase().trim() === text.toLowerCase().trim()
          );

        const buttonId = uniqueId.replace("blog-item", "blog-button");
        const buttonEl = document.getElementById(buttonId);

        if (buttonEl) {
          buttonEl.innerText = exists ? "Regenerate Blog" : "Generate Blog";
        }
      });
    } catch (error) {
      console.error("Error in extractBlogTitles:", error);
    }
  }

  // Update blog buttons based on whether the blog already exists.
  function updateBlogButtons() {
    try {
      const blogTextElements = document.querySelectorAll('[id$="-text"]');
      blogTextElements.forEach((el) => {
        const blogItemId = el.id.replace("-text", "");
        const title = el.textContent?.trim() || "";
        const existsInCMS = extractedBlogs?.some((blog) => {
          return (
            blog?.Title?.toLowerCase().trim() === title.toLowerCase().trim()
          );
        });
        const buttonId = blogItemId.replace("blog-item", "blog-button");
        const buttonEl = document.getElementById(buttonId);

        if (buttonEl) {
          buttonEl.innerText = existsInCMS
            ? "Regenerate Blog"
            : "Generate Blog";
        }
      });
    } catch (error) {
      console.error("Error in updateBlogButtons:", error);
    }
  }

  useEffect(() => {
    updateBlogButtons();
  }, [extractedBlogs]);

  // Convert Markdown to HTML and process it.
  function convertMarkdownToHTML(markdown: string): string {
    try {
      const cleanedMarkdown = markdown.replace(/\\n/g, "\n");
      const rawHtml = marked(cleanedMarkdown);
      const processedHtml = assignUniqueIdsToBlogItems(rawHtml);
      return processedHtml;
    } catch (error) {
      console.error("Error converting Markdown to HTML:", error);
      return markdown;
    }
  }

  // Check if video analysis data exists for the given videoId.
  const handleVideoAnalysisCheck = async (videoId: string) => {
    try {
      const apiUrl = `https://cms.flowautomate.io/api/video-to-blogs?filters[videoId][$eq]=${videoId}&populate=*`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch video analysis data: ${response.statusText}`
        );
      }
      const result = await response.json();
      setVideoData(result);
      const relatedBlogs = result?.data?.[0]?.attributes?.Related_Blogs ?? [];
      setPreviousRelatedBlogsData(relatedBlogs);
      const lastBlogId = relatedBlogs?.[relatedBlogs.length - 1]?.id;
      setSelectedBlogId(lastBlogId);
      return result;
    } catch (error) {
      console.error("Error fetching video analysis data:", error);
      return null;
    }
  };

  // Fetch video details and transcript.
  const handleFetchVideoDetailsAndTranscript = async () => {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0];
    if (!videoId) {
      alert("Invalid YouTube URL.");
      return;
    }
    try {
      setLoading(true);
      const result = await handleVideoAnalysisCheck(videoId);
      if (!result || result?.data?.length === 0) {
        setNewVideo(true);
        const videoDetailsResponse = await fetch(
          `/api/youtube-proxy?videoId=${videoId}`
        );
        const videoDetailsData = await videoDetailsResponse.json();
        let videoDesc = "";
        if (videoDetailsData?.items?.[0]) {
          const videoSnippet = videoDetailsData.items[0].snippet;
          setVideoTitle(videoSnippet?.title || "");
          setVideoThumbnail(videoSnippet?.thumbnails?.high?.url || "");
          videoDesc = videoSnippet?.description || "";
          setVideoDescription(videoDesc);
        }
        const transcriptResponse = await fetch(
          `http://192.168.0.134:5000/transcript?video_id=${videoId}`
        );
        const transcriptJson = await transcriptResponse.json();
        const transcript = transcriptJson?.transcript;
        if (!transcript || transcriptJson?.error) {
          throw new Error("Failed to fetch transcript");
        }
        const videoDetails = {
          searchId: videoId,
          videoId,
          videoUrl,
          videoThumbnailImage:
            videoDetailsData?.items?.[0]?.snippet?.thumbnails?.high?.url || "",
          videoTitle: videoDetailsData?.items?.[0]?.snippet?.title || "",
          videoDescription: videoDesc,
          videoTranscript: transcript,
        };
        setVideoDetailsJson(videoDetails);
        await fetch("https://cms.flowautomate.io/api/video-to-blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: videoDetails }),
        });
      } else {
        const existingData = result?.data?.[0]?.attributes;
        setExistingVideoId(result?.data?.[0]);
        setVideoTitle(existingData?.videoTitle || "");
        setVideoThumbnail(existingData?.videoThumbnailImage || "");
        setVideoDescription(existingData?.videoDescription || "");
        setVideoDetailsJson(existingData);
      }
    } catch (error) {
      console.error("Error fetching video details or transcript:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create video analysis.
  const handleVideoAnalysis = async (videoDetails: any) => {
    if (!videoDetails) {
      console.error("No video details provided.");
      return;
    }
    try {
      setAnalysisLoading(true);
      const videoId = videoDetails?.videoId;
      const existingAnalysis = videoDetails?.analysis;
      if (existingAnalysis) {
        setAnalysisResponse(existingAnalysis);
        const analysisResultHtml = convertMarkdownToHTML(existingAnalysis);
        setAnalysisData(analysisResultHtml);
        return;
      }
      const apiUrl = `https://cms.flowautomate.io/api/video-to-blogs?filters[videoId][$eq]=${videoId}&populate=*`;
      const getResponse = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch data: ${getResponse.statusText}`);
      }
      const apiData = await getResponse.json();
      console.log("GET API Response:", apiData);
      const videoDataFromAPI = apiData?.data?.[0];
      if (!videoDataFromAPI) {
        console.error("No video data found.");
        return;
      }
      const cmsId = videoDataFromAPI?.id;
      const lambdaResponse = await fetch(
        "https://ahqtq5b5ms36lqgvw5kzirxxde0yzjmz.lambda-url.ap-south-1.on.aws",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            prompt: JSON.stringify(videoDetails),
            prompt_type: "analysis",
          }),
        }
      );
      if (!lambdaResponse.ok) {
        throw new Error(
          `Lambda API request failed: ${lambdaResponse.statusText}`
        );
      }
      const lambdaResult = await lambdaResponse.json();
      const updatedVideoDetails = {
        ...videoDetails,
        analysis: lambdaResult,
      };
      const putApiUrl = `https://cms.flowautomate.io/api/video-to-blogs/${cmsId}`;
      const putResponse = await fetch(putApiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updatedVideoDetails }),
      });
      if (!putResponse.ok) {
        throw new Error(`PUT request failed: ${putResponse.statusText}`);
      }
      const putData = await putResponse.json();
      console.log("PUT API Response:", putData);
      setAnalysisResponse(lambdaResult);
      const analysisResultHtml = convertMarkdownToHTML(lambdaResult);
      setAnalysisData(analysisResultHtml);
    } catch (error) {
      console.error("Error in video analysis handling:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Generate a blog post from the analysis.
  const handleBlogGeneration = async (safeContent: string) => {
    try {
      if (analysisResponse) {
        setAnalysisLoading(true);
        // Post to Lambda for blog generation
        const lambdatwoResponse = await fetch(
          "https://ahqtq5b5ms36lqgvw5kzirxxde0yzjmz.lambda-url.ap-south-1.on.aws",
          {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              prompt: JSON.stringify(analysisData),
              prompt_type: "generate-blog",
              topic_name: safeContent,
              Target_audience: formData.Target_audience,
              Audience_age_group: formData.Audience_age_group,
              Writing_style: formData.Writing_style,
              Additional_instructions: formData.Additional_instructions,
            }),
          }
        );
        const lambdatwoData = await lambdatwoResponse.json();
        // Convert the received Markdown to HTML and assign unique IDs.
        const blogHtml = convertMarkdownToHTML(lambdatwoData);
        setBlogContent(blogHtml);

        // Determine version number based on previousRelatedBlogsData
        const matchingBlogs = (previousRelatedBlogsData ?? []).filter(
          (blog) => blog?.Title === safeContent
        );
        let newVersion: string;
        if (matchingBlogs.length > 0) {
          const highestVersion = Math.max(
            ...matchingBlogs.map((blog) => parseFloat(blog?.Version) || 1.0)
          );
          newVersion = (highestVersion + 1.0).toFixed(1);
        } else {
          newVersion = "1.0";
        }

        // Prepare the payload for the CMS API
        const cmsPayload = {
          data: {
            Related_Blogs: [
              ...previousRelatedBlogsData,
              {
                Title: safeContent,
                Content: lambdatwoData,
                Target_audience: formData.Target_audience,
                Audience_age_group: formData.Audience_age_group,
                Writing_style: formData.Writing_style,
                Additional_instructions: formData.Additional_instructions,
                Version: newVersion,
              },
            ],
          },
        };

        // Post the generated blog content to the CMS API
        const cmsResponse = await fetch(
          `https://cms.flowautomate.io/api/video-to-blogs/${videoData?.data?.[0]?.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cmsPayload),
          }
        );
        if (!cmsResponse.ok) {
          console.error("Error posting to CMS API:", cmsResponse.statusText);
        } else {
          // Mark this blog (by its unique ID) as generated.
          setGeneratedBlogIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(selectedUniqueBlogId);
            return newSet;
          });
        }
        // Refresh the blog list and update buttons.
        await handleVideoAnalysisCheck(
          existingVideoId?.attributes?.videoId ?? ""
        );
        updateBlogButtons();
        handleNewBlogState();
      }
    } catch (error) {
      console.error("Error generating or posting the blog:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Copy blog content to the clipboard.
  const handleCopyBlogContent = () => {
    navigator.clipboard
      .writeText(blogContent)
      .then(() => {
        setCopy(true);
        setTimeout(() => setCopy(false), 3000); // Reset after 3 seconds
      })
      .catch(() => alert("Failed to copy content!"));
  };

  // Get the embed URL for the video.
  const getEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : url;
  };

  const handleSubmit = () => {
    handleBlogGeneration(blogContent);
    setOpenDialog(false);
  };

  useEffect(() => {
    if (newBlog && currentTab === "analysis") {
      setCurrentTab("allblogs");
    }
  }, [newBlog, currentTab]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        YouTube Video to Blog Converter
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Enter URL</h2>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
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
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}{" "}
                Check
              </Button>
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Video Analysis</h2>
            <div className="flex flex-col space-y-4">
              {videoThumbnail && (
                <div className="w-full h-80 relative">
                  {isPlaying ? (
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => setIsPlaying(true)}
                    >
                      <img
                        src={videoThumbnail}
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 p-4 rounded-full">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {videoTitle && (
                <h3 className="text-lg font-medium mt-5">
                  <span className="text-xl font-semibold">Title:</span>{" "}
                  {videoTitle}
                </h3>
              )}
              {videoDescription && (
                <>
                  <h3 className="text-sm font-medium mt-5">
                    <span className="text-xl font-semibold">Description:</span>{" "}
                    {videoDescription}
                  </h3>
                </>
              )}
              {videoDescription && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleVideoAnalysis(videoDetailsJson)}
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {analysisLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}{" "}
                    Create Video Analysis
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="w-full lg:w-1/2">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="allblogs">All Blogs</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Analysis</h2>
                  <Button
                    onClick={handleCopyBlogContent}
                    className="text-white bg-black dark:bg-white rounded-full"
                  >
                    <Clipboard className="h-5 w-5" /> {copy ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="prose max-w-none min-h-[200px] p-4 border rounded-md overflow-auto">
                  {analysisLoading ? (
                    <div className="text-center mt-5 text-xl font-semibold">
                      Loading Video Analysis...
                    </div>
                  ) : analysisData ? (
                    <div
                      className="markdown"
                      dangerouslySetInnerHTML={{ __html: analysisData }}
                    />
                  ) : (
                    <div className="text-center mt-5 text-xl">
                      Your generated blog post will appear here...
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="allblogs">
              <Card className="p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  All Blogs
                </h2>
                {previousRelatedBlogsData &&
                previousRelatedBlogsData.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-5 mb-6 max-h-[200px] overflow-y-auto pr-2">
                      {Object.entries(
                        previousRelatedBlogsData.reduce((acc, blog) => {
                          if (blog?.Title) {
                            if (!acc[blog.Title]) {
                              acc[blog.Title] = [];
                            }
                            acc[blog.Title].push(blog);
                          }
                          return acc;
                        }, {} as { [key: string]: any[] })
                      ).map(([title, group]) => {
                        if (group.length === 1) {
                          const blog = group[0];
                          return (
                            <button
                              key={blog?.id}
                              onClick={() => setSelectedBlogId(blog?.id)}
                              className={`w-full text-left px-5 py-3 rounded-lg transition-colors ${
                                selectedBlogId === blog?.id
                                  ? "bg-black text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {blog?.Title}
                            </button>
                          );
                        } else {
                          const sortedGroup = [...group].sort(
                            (a, b) =>
                              (parseFloat(b?.Version) || 1.0) -
                              (parseFloat(a?.Version) || 1.0)
                          );
                          const isSelectedGroup = group.some(
                            (blog) => blog?.id === selectedBlogId
                          );
                          if (isSelectedGroup) {
                            const selectedBlogForGroup =
                              group.find(
                                (blog) => blog?.id === selectedBlogId
                              ) || sortedGroup[0];
                            return (
                              <div
                                key={title}
                                className="flex items-center justify-between w-full p-4 bg-black text-white border rounded-lg shadow-sm"
                              >
                                <span>{title}</span>
                                <select
                                  value={
                                    selectedBlogForGroup?.id ||
                                    sortedGroup[0]?.id
                                  }
                                  onChange={(e) =>
                                    setSelectedBlogId(Number(e.target.value))
                                  }
                                  className="px-4 py-2 border border-gray-300 text-black"
                                >
                                  {sortedGroup.map((blog) => (
                                    <option key={blog?.id} value={blog?.id}>
                                      v{blog?.Version || "1.0"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          } else {
                            const highestVersionBlog = sortedGroup[0];
                            return (
                              <button
                                key={title}
                                onClick={() =>
                                  setSelectedBlogId(highestVersionBlog?.id)
                                }
                                className={`w-full text-left px-5 py-3 rounded-lg transition-colors ${
                                  selectedBlogId === highestVersionBlog?.id
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-800 "
                                }`}
                              >
                                {title} (v
                                {highestVersionBlog?.Version || "1.0"})
                              </button>
                            );
                          }
                        }
                      })}
                    </div>
                    <div className="prose max-w-none min-h-[500px] p-6 border ">
                      {selectedBlogId ? (
                        <>
                          <div className="flex justify-end">
                            <Button
                              onClick={handleCopyBlogContent}
                              className="text-white bg-black dark:bg-white rounded-full flex justify-end"
                            >
                              <Clipboard className="h-5 w-5" />{" "}
                              {copy ? "Copied" : "Copy"}
                            </Button>
                          </div>
                          <div
                            className="markdown"
                            dangerouslySetInnerHTML={{
                              __html: convertMarkdownToHTML(
                                previousRelatedBlogsData.find(
                                  (blog) => blog?.id === selectedBlogId
                                )?.Content || ""
                              ),
                            }}
                          ></div>
                        </>
                      ) : (
                        <p className="text-center text-gray-600">
                          Please select a blog.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="prose max-w-none min-h-[500px] p-6 border">
                    <p className="text-center text-gray-600">
                      No blogs available.
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex items-center justify-center h-screen">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{blogContent}</DialogTitle>
              <DialogDescription>
                Fill in these details for optimizing this blog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Target_audience">Target Audience</Label>
                  <Input
                    id="Target_audience"
                    name="Target_audience"
                    value={formData.Target_audience}
                    onChange={handleChange}
                    placeholder="Enter target audience"
                  />
                </div>
                <div>
                  <Label htmlFor="Audience_age_group">Audience Age Group</Label>
                  <Input
                    id="Audience_age_group"
                    name="Audience_age_group"
                    value={formData.Audience_age_group}
                    onChange={handleChange}
                    placeholder="Enter age group"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="Writing_style">Writing Style</Label>
                <Input
                  id="Writing_style"
                  name="Writing_style"
                  value={formData.Writing_style}
                  onChange={handleChange}
                  placeholder="Enter writing style"
                />
              </div>
              <div>
                <Label htmlFor="Additional_instructions">
                  Additional Instructions
                </Label>
                <Input
                  id="Additional_instructions"
                  name="Additional_instructions"
                  value={formData.Additional_instructions}
                  onChange={handleChange}
                  placeholder="Enter additional instructions"
                />
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} className="w-full md:w-auto">
                  Generate Blog
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
