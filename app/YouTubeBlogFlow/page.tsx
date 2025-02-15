"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import UserActionNode from "@/components/UserActionNode";
import DisplayNode from "@/components/DisplayNode";
import LogicalBlockNode from "@/components/LogicalBlockNode";
import NodeInfo from "@/components/NodeInfo";

const nodeTypes = {
  userAction: UserActionNode,
  display: DisplayNode,
  logicalBlock: LogicalBlockNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Enter YouTube URL" },
    type: "userAction",
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "Extract Video ID" },
    type: "logicalBlock",
  },
  {
    id: "3",
    position: { x: 0, y: 200 },
    data: { label: "Video in CMS?" },
    type: "logicalBlock",
  },
  {
    id: "4",
    position: { x: -200, y: 300 },
    data: { label: "Load Existing Video Details" },
    type: "logicalBlock",
  },
  {
    id: "5",
    position: { x: 200, y: 300 },
    data: { label: "Fetch Video Details & Transcript" },
    type: "logicalBlock",
  },
  {
    id: "6",
    position: { x: 200, y: 400 },
    data: { label: "Store in CMS" },
    type: "logicalBlock",
  },
  {
    id: "7",
    position: { x: 0, y: 500 },
    data: { label: "Display Video Details" },
    type: "display",
  },
  {
    id: "8",
    position: { x: 0, y: 600 },
    data: { label: "Initiate Analysis" },
    type: "userAction",
  },
  {
    id: "9",
    position: { x: 0, y: 700 },
    data: { label: "Analysis Exists?" },
    type: "logicalBlock",
  },
  {
    id: "10",
    position: { x: -200, y: 800 },
    data: { label: "Convert & Display Analysis" },
    type: "display",
  },
  {
    id: "11",
    position: { x: 200, y: 800 },
    data: { label: "Generate New Analysis" },
    type: "logicalBlock",
  },
  {
    id: "12",
    position: { x: 200, y: 900 },
    data: { label: "Update CMS & Display" },
    type: "display",
  },
  {
    id: "13",
    position: { x: 0, y: 1000 },
    data: { label: "Extract Blog Ideas" },
    type: "logicalBlock",
  },
  {
    id: "14",
    position: { x: 0, y: 1100 },
    data: { label: "Display Blog Generation Options" },
    type: "display",
  },
  {
    id: "15",
    position: { x: 0, y: 1200 },
    data: { label: "Select Blog to Generate" },
    type: "userAction",
  },
  {
    id: "16",
    position: { x: 200, y: 1400 },
    data: { label: "Open Optimization Dialog" },
    type: "logicalBlock",
  },
  {
    id: "17",
    position: { x: 200, y: 1500 },
    data: { label: "Submit Optimization Details" },
    type: "userAction",
  },
  {
    id: "18",
    position: { x: 200, y: 1600 },
    data: { label: "Generate Blog Content" },
    type: "logicalBlock",
  },
  {
    id: "19",
    position: { x: 200, y: 1700 },
    data: { label: "Process & Save Blog" },
    type: "logicalBlock",
  },
  {
    id: "20",
    position: { x: -200, y: 1800 },
    data: { label: "Update UI & CMS" },
    type: "logicalBlock",
  },
  {
    id: "21",
    position: { x: -200, y: 1900 },
    data: { label: 'Display in "All Blogs" Tab' },
    type: "display",
  },
  {
    id: "22",
    position: { x: 0, y: 1300 },
    data: { label: "Check if blog Exists" },
    type: "logicalBlock",
  },
  {
    id: "23",
    position: { x: -300, y: 1400 },
    data: { label: "Wants to create new Blog" },
    type: "logicalBlock",
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4", label: "Yes" },
  { id: "e3-5", source: "3", target: "5", label: "No" },
  { id: "e5-6", source: "5", target: "6" },
  { id: "e4-7", source: "4", target: "7" },
  { id: "e6-7", source: "6", target: "7" },
  { id: "e7-8", source: "7", target: "8" },
  { id: "e8-9", source: "8", target: "9" },
  { id: "e9-10", source: "9", target: "10", label: "Yes" },
  { id: "e9-11", source: "9", target: "11", label: "No" },
  { id: "e11-12", source: "11", target: "12" },
  { id: "e10-13", source: "10", target: "13" },
  { id: "e12-13", source: "12", target: "13" },
  { id: "e13-14", source: "13", target: "14" },
  { id: "e14-15", source: "14", target: "15" },
  { id: "e16-17", source: "16", target: "17" },
  { id: "e17-18", source: "17", target: "18" },
  { id: "e18-19", source: "18", target: "19" },
  { id: "e19-20", source: "19", target: "20" },
  { id: "e20-21", source: "20", target: "21" },
  { id: "e15-22", source: "15", target: "22" },
  { id: "e22-16", source: "22", target: "16", label: "No" },
  { id: "e22-20", source: "22", target: "23", label: "Yes" },
  { id: "e22-23", source: "22", target: "23", label: "Yes" },
  { id: "e23-20", source: "23", target: "20", label: "No" },
  { id: "e23-16", source: "23", target: "16", label: "Yes" },
];

export default function YouTubeToBlogFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currentAction, setCurrentAction] = useState("");
  const [activeNodes, setActiveNodes] = useState<string[]>(["1"]);
  const [currentActiveNode, setCurrentActiveNode] = useState<string>("1");
  const [flowStarted, setFlowStarted] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [flowData, setFlowData] = useState<Record<string, any>>({});
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");
  const [videoDetailsState, setVideoDetailsState] = useState<any>(null);
  const [currentVideoCMSId, setCurrentVideoCMSId] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (action: string, nodeType: string, nodeId: string) => {
      setCurrentAction(action);
      if (nodeType === "display") {
        setCurrentActiveNode(nodeId);
      }
    },
    []
  );
  async function fetchAIForBlog(selectedBlogIdea: string, flowData: any) {
    // Simulate an API delay (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Return a simulated blog object
    return {
      title: selectedBlogIdea,
      author: "Simulated Author",
      date: new Date().toLocaleDateString(),
      excerpt: "This is a simulated blog excerpt generated by AI.",
      Content:
        "# Simulated Blog Content\nThis is the full simulated blog content.",
    };
  }
  async function saveBlogToCMS(generatedBlog: any) {
    // Simulate an API delay for saving (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Simulate a successful CMS update (you could add an id or other details here)
    return {
      ...generatedBlog,
      id: "simulated-cms-id",
    };
  }

  const setNodeError = useCallback(
    (nodeId: string, error: string | null) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  error,
                  isLoading: false,
                  errorDetails: error
                    ? `Error in node ${nodeId}: ${error}`
                    : null,
                },
              }
            : node
        )
      );
      if (error) {
        console.error(`Error in node ${nodeId}:`, error);
      }
    },
    [setNodes]
  );

  const setNodeLoading = useCallback(
    (nodeId: string, isLoading: boolean) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, isLoading } }
            : node
        )
      );
    },
    [setNodes]
  );

  const processLogicalBlock = useCallback(
    async (nodeId: string, passedData?: any) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;

      setNodeError(nodeId, null);
      setNodeLoading(nodeId, true);

      try {
        let result: { nextNodeId: string; data?: any } | null = null;
        switch (node.data.label) {
          case "Extract Video ID": {
            const extractVideoId = (url: string) => {
              const regExp =
                /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
              const match = url.match(regExp);
              return match && match[7].length === 11 ? match[7] : null;
            };
            const videoId = extractVideoId(youtubeUrl);
            if (!videoId) throw new Error("Invalid YouTube URL");

            setFlowData((prev) => ({ ...prev, videoId }));
            result = { nextNodeId: "3", data: { extractedVideoId: videoId } };
            break;
          }

          case "Video in CMS?": {
            // Ensure the video ID is available.
            const prevStepResult =
              nodeId === "3" ? await processLogicalBlock("2") : null;
            const currentVideoId =
              prevStepResult?.data?.extractedVideoId || flowData.videoId;
            if (!currentVideoId) {
              throw new Error(
                "Video ID is undefined. Please check the YouTube URL."
              );
            }

            const apiUrl = `https://cms.flowautomate.io/api/video-to-blogs?filters[videoId][$eq]=${currentVideoId}&populate=*`;

            try {
              const response = await fetch(apiUrl);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const apiResponse = await response.json();

              if (apiResponse.data.length === 0) {
                // Video does not exist in the CMS.
                await new Promise<void>((resolve) => {
                  setFlowData((prev) => ({ ...prev, videoExists: false }));
                  resolve();
                });

                // 1. Fetch video details via the YouTube proxy API.
                const videoDetailsResponse = await fetch(
                  `/api/youtube-proxy?videoId=${currentVideoId}`
                );
                const videoDetailsData = await videoDetailsResponse.json();

                // 2. Extract video description.
                let videoDesc = "";
                if (videoDetailsData?.items?.[0]) {
                  const videoSnippet = videoDetailsData.items[0].snippet;
                  videoDesc = videoSnippet.description || "";
                }

                // 3. Fetch the video transcript.
                const transcriptResponse = await fetch(
                  `http://13.232.223.95:5000/transcript?video_id=${currentVideoId}`
                );
                const transcriptJson = await transcriptResponse.json();
                const transcript = transcriptJson?.transcript;
                if (!transcript || transcriptJson?.error) {
                  throw new Error("Failed to fetch transcript");
                }

                // 4. Construct the videoDetails object.
                const videoDetails = {
                  searchId: currentVideoId,
                  videoId: currentVideoId,
                  videoUrl: youtubeUrl,
                  videoThumbnailImage:
                    videoDetailsData?.items?.[0]?.snippet?.thumbnails?.high
                      ?.url || "",
                  videoTitle:
                    videoDetailsData?.items?.[0]?.snippet?.title || "",
                  videoDescription: videoDesc,
                  videoTranscript: transcript,
                };

                // 5. POST the videoDetails to your CMS.
                const postResponse = await fetch(
                  "https://cms.flowautomate.io/api/video-to-blogs",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: videoDetails }),
                  }
                );
                if (!postResponse.ok) {
                  throw new Error("Failed to store video details in CMS");
                }
                const postData = await postResponse.json();
                // Extract the stored video details from the response.
                const storedVideoDetails = postData.data.attributes;
                setCurrentVideoCMSId(postData.data.id);

                // Update state with the newly stored video details.
                setVideoDetailsState(storedVideoDetails);
                setFlowData((prev) => ({
                  ...prev,
                  videoDetails: storedVideoDetails,
                  currentVideoCMSId: postData.data.id,
                }));

                // Pass the stored details forward.
                result = { nextNodeId: "5", data: storedVideoDetails };
              } else {
                const existingVideoDetails = apiResponse.data[0].attributes;
                const existingBlogs =
                  apiResponse.data[0].attributes.Related_Blogs;
                const existingCMSId = apiResponse.data[0].id;
                await Promise.all([
                  new Promise<void>((resolve) => {
                    setVideoDetailsState(existingVideoDetails);
                    resolve();
                  }),
                  new Promise<void>((resolve) => {
                    setFlowData((prev) => ({
                      ...prev,
                      videoExists: true,
                      videoDetails: existingVideoDetails,
                      existingBlogs,
                      existingCMSId,
                    }));
                    resolve();
                  }),
                ]);
                result = { nextNodeId: "4", data: existingVideoDetails };
              }
            } catch (error) {
              throw new Error("Failed to check if video exists in CMS");
            }
            break;
          }

          case "Load Existing Video Details": {
            // Retrieve video details from passedData, state, or flowData.
            let videoDetails =
              passedData || videoDetailsState || flowData.videoDetails;
            if (!videoDetails || Object.keys(videoDetails).length === 0) {
              throw new Error(
                "Video details not found. Please check the previous step."
              );
            }
            // Modify the video transcript if it's an array.
            if (Array.isArray(videoDetails.videoTranscript)) {
              videoDetails = {
                ...videoDetails,
                videoTranscript: videoDetails.videoTranscript
                  .map((item: any) => item.text)
                  .join(" "),
              };
            }
            await new Promise<void>((resolve) => {
              setFlowData((prev) => {
                const newData = { ...prev, videoDetails };
                resolve();
                return newData;
              });
            });
            result = { nextNodeId: "7", data: videoDetails };
            break;
          }

          case "Fetch Video Details & Transcript": {
            // Use passedData if available (from a successful POST), otherwise fallback to sample details.
            const newVideoDetails = passedData || {
              videoId: flowData.videoId,
              title: "New Video Title",
              description: "This is a new video not previously in the CMS.",
              views: 5000,
              likes: 200,
              dislikes: 10,
              transcript: "This is a sample transcript for the new video...",
            };
            setFlowData((prev) => ({ ...prev, videoDetails: newVideoDetails }));
            result = { nextNodeId: "6", data: newVideoDetails };
            break;
          }

          case "Store in CMS": {
            let videoDetails =
              videoDetailsState || flowData.videoDetails || passedData;
            if (!videoDetails) {
              throw new Error(
                "No video details available after storing in CMS"
              );
            }
            // If videoTranscript is an array, join its text fields.
            if (Array.isArray(videoDetails.videoTranscript)) {
              videoDetails = {
                ...videoDetails,
                videoTranscript: videoDetails.videoTranscript
                  .map((item: any) => item.text)
                  .join(" "),
              };
            }
            result = { nextNodeId: "7", data: videoDetails };
            break;
          }

          case "Analysis Exists?": {
            const videoDetailsWithAnalysis = flowData.videoDetails;
            const analysisExists = !!videoDetailsWithAnalysis?.analysis;
            setFlowData((prev) => ({
              ...prev,
              analysisExists,
              analysis: videoDetailsWithAnalysis?.analysis,
            }));

            toast({
              title: "Analysis Check",
              description: `Existing analysis ${
                analysisExists ? "found" : "not found"
              }.`,
            });
            result = {
              nextNodeId: analysisExists ? "10" : "11",
              data: { analysisExists },
            };
            break;
          }

          case "Convert & Display Analysis": {
            const existingAnalysis = flowData.analysis;
            if (existingAnalysis) {
              result = { nextNodeId: "13", data: existingAnalysis };
            } else {
              const fallbackAnalysis = `
# Video Analysis

## Summary
No existing analysis found.

## Topics
- N/A

## Sentiment
N/A
              `;
              setFlowData((prev) => ({ ...prev, analysis: fallbackAnalysis }));
              result = { nextNodeId: "13", data: fallbackAnalysis };
            }
            break;
          }

          case "Generate New Analysis": {
            // Retrieve the current video details from flowData.
            const videoDetails = flowData.videoDetails;
            if (!videoDetails) {
              throw new Error("Video details are missing.");
            }
            // If analysis already exists, simply proceed.
            if (videoDetails.analysis) {
              result = { nextNodeId: "12", data: videoDetails.analysis };
              break;
            }
            const analysisModel = selectedModel;

            try {
              const lambdaResponse = await fetch(
                "https://ahqtq5b5ms36lqgvw5kzirxxde0yzjmz.lambda-url.ap-south-1.on.aws/",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
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

              // 3. Update the CMS record with the new analysis via a PUT request.
              if (!currentVideoCMSId) {
                throw new Error("CMS ID is missing in video details.");
              }
              const putResponse = await fetch(
                `https://cms.flowautomate.io/api/video-to-blogs/${currentVideoCMSId}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ data: updatedVideoDetails }),
                }
              );
              if (!putResponse.ok) {
                throw new Error(
                  `PUT request failed: ${putResponse.statusText}`
                );
              }
              const putData = await putResponse.json();

              // 4. Update local state with the new analysis.
              setFlowData((prev) => ({
                ...prev,
                analysis: lambdaResult,
                videoDetails: { ...prev.videoDetails, analysis: lambdaResult },
              }));
              result = { nextNodeId: "12", data: lambdaResult };
            } catch (error) {
              console.error("Error generating new analysis:", error);
              throw error;
            }
            break;
          }

          case "Extract Blog Ideas": {
            const blogIdeas =
              flowData.analysis && flowData.analysis.includes("Blogs")
                ? flowData.analysis
                    .split("Blogs")[1]
                    .split("\n")
                    .filter((line) => line.trim().match(/^\d+\./))
                    .map((line) => line.trim().replace(/^\d+\.\s*/, ""))
                    .slice(0, 10)
                : ["No blog ideas found in the analysis."];
            setFlowData((prev) => ({
              ...prev,
              blogIdeas,
              selectedBlogIdea: null,
            }));
            result = { nextNodeId: "14" };
            break;
          }

          case "Select Blog to Generate": {
            const selectedBlogIdea = passedData?.selectedBlogIdea;
            if (!selectedBlogIdea) {
              throw new Error("No blog idea selected");
            }
            // Check if the blog was already generated.
            const existingBlogs = flowData.videoDetails?.Related_Blogs || [];
            if (
              existingBlogs.some((blog: any) => blog.Title === selectedBlogIdea)
            ) {
              throw new Error("This blog topic has already been generated.");
            }
            // Explicitly set the selectedBlogIdea in flowData.
            setFlowData((prev) => ({
              ...prev,
              selectedBlogIdea: selectedBlogIdea,
            }));
            result = { nextNodeId: "16" };
            break;
          }
          case "Check if blog Exists": {
            const selectedBlogIdea = flowData.selectedBlogIdea;
            if (!selectedBlogIdea) {
              throw new Error("No blog idea selected.");
            }
            const existingBlogs = flowData.videoDetails?.Related_Blogs || [];
            const matchingBlogs = existingBlogs.filter(
              (blog: any) => blog.Title === selectedBlogIdea
            );
            if (flowData.userChoseRegenerate) {
              return { nextNodeId: "16" }; // Open Optimization Dialog
            }
            if (matchingBlogs.length > 0) {
              return { nextNodeId: "23" };
            }
            return { nextNodeId: "16" };
          }

          case "Wants to create new Blog": {
            // Compute groupedBlogs if not already available
            let groupedBlogs = flowData.groupedBlogs;
            if (
              !groupedBlogs &&
              flowData.videoDetails?.Related_Blogs &&
              flowData.selectedBlogIdea
            ) {
              const matchingBlogs = flowData.videoDetails.Related_Blogs.filter(
                (blog: any) => blog.Title === flowData.selectedBlogIdea
              );
              groupedBlogs = matchingBlogs.reduce(
                (acc: Record<string, any[]>, blog: any) => {
                  const version = blog.Version || "Unknown";
                  if (!acc[version]) {
                    acc[version] = [];
                  }
                  acc[version].push(blog);
                  return acc;
                },
                {}
              );

              // Store groupedBlogs in state for future use
              setFlowData((prev) => ({ ...prev, groupedBlogs }));
            }

            // If the user already chose to regenerate, show a loading message
            if (flowData.userChoseRegenerate) {
              return (
                <div>
                  <p>Regenerating blog... please wait.</p>
                </div>
              );
            }

            // If there are no previously generated blogs, offer only the regenerate option
            if (!groupedBlogs || Object.keys(groupedBlogs).length === 0) {
              return (
                <div>
                  <p>No previously generated blogs available.</p>
                  <Button
                    onClick={() => {
                      // Mark that the user chose to regenerate
                      setFlowData((prev) => ({
                        ...prev,
                        userChoseRegenerate: true,
                      }));
                      // Immediately proceed to the next action (i.e. open the optimization dialog)
                      onAction();
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
              );
            }

            // If grouped blogs exist, ask the user if they want to view them or regenerate
            if (userChoice === null) {
              return (
                <div>
                  <h3 className="font-bold mb-2">
                    Do you want to view previously generated blogs or
                    regenerate?
                  </h3>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => setUserChoice("view")}
                  >
                    View Previously Generated Blogs
                  </Button>
                  <Button
                    onClick={() => {
                      // Mark that the user chose to regenerate
                      setFlowData((prev) => ({
                        ...prev,
                        userChoseRegenerate: true,
                      }));
                      // Proceed to next action immediately
                      onAction();
                    }}
                  >
                    Regenerate
                  </Button>
                </div>
              );
            }

            // If the user chooses to view existing blogs, render them
            if (userChoice === "view") {
              const versions = Object.keys(groupedBlogs);
              return (
                <div>
                  <h3 className="font-bold mb-2">
                    Previously Generated Blogs for "{flowData.selectedBlogIdea}"
                  </h3>
                  <div className="mb-4">
                    {versions.map((version) => (
                      <Button
                        key={version}
                        variant={
                          activeVersion === version ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveVersion(version)}
                        className="mr-2 mb-2"
                      >
                        v{version}
                      </Button>
                    ))}
                  </div>
                  <div>
                    {activeVersion &&
                    groupedBlogs[activeVersion] &&
                    groupedBlogs[activeVersion].length > 0 ? (
                      groupedBlogs[activeVersion].map((blog: any) => (
                        <Card key={blog.id} className="mb-2 p-2">
                          <CardHeader>
                            <CardTitle className="text-sm">
                              {blog.Title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs">
                              Target Audience: {blog.Target_audience} | Age
                              Group: {blog.Audience_age_group} | Writing Style:{" "}
                              {blog.Writing_style}
                            </p>
                            <MarkdownRenderer content={blog.Content} />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p>No blogs available for version {activeVersion}</p>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          }

          case "Open Optimization Dialog": {
            // Rendered via NodeInfo:
            // - Form fields: targetAudience, audienceAge, writingStyle, additionalInstructions.
            // - The submit button calls onAction.
            // When onAction is triggered, processLogicalBlock validates the inputs:
            if (
              !flowData.targetAudience ||
              !flowData.audienceAge ||
              !flowData.writingStyle ||
              !flowData.additionalInstructions
            ) {
              setNodeError(
                nodeId,
                "Please fill in all optimization details before continuing."
              );
              return null; // Stop flow execution until fields are completed.
            }
            // If all fields are filled, continue to the Submit Optimization Details node.
            return { nextNodeId: "17" };
          }

          case "Submit Optimization Details": {
            // After clicking the submit button in the optimization dialog,
            // the flow proceeds to generate the blog content.
            return { nextNodeId: "18" };
          }

          case "Generate Blog Content": {
            // Construct the payload for the Generate Blog Post API
            const generatePayload = JSON.stringify({
              prompt: JSON.stringify({ analysis: flowData.analysis }), // video analysis as stringified JSON
              prompt_type: "generate-blog",
              topic_name: flowData.selectedBlogIdea, // safeContent (the blog's topic)
              Target_audience: flowData.targetAudience,
              Audience_age_group: flowData.audienceAge,
              Writing_style: flowData.writingStyle,
              Additional_instructions: flowData.additionalInstructions,
            });

            // Call the Generate Blog Post API (Lambda)
            const lambdaResponse = await fetch(
              "https://ahqtq5b5ms36lqgvw5kzirxxde0yzjmz.lambda-url.ap-south-1.on.aws",
              {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: generatePayload,
              }
            );

            if (!lambdaResponse.ok) {
              throw new Error(
                `Lambda API request failed: ${lambdaResponse.statusText}`
              );
            }

            // The Lambda API returns the blog content in Markdown
            const lambdaData = await lambdaResponse.json();

            // Retrieve any existing blogs from the video details
            const previousRelatedBlogs =
              flowData.videoDetails?.Related_Blogs || [];

            // Optionally, calculate the new version. For simplicity, we'll default to "1.0".
            // You can add logic here to compute the next version if needed.
            const newVersion = "1.0";

            // Construct the new blog object
            const newBlogObject = {
              Title: flowData.selectedBlogIdea,
              Content: lambdaData, // generated blog content (Markdown)
              Target_audience: flowData.targetAudience,
              Audience_age_group: flowData.audienceAge,
              Writing_style: flowData.writingStyle,
              Additional_instructions: flowData.additionalInstructions,
              Version: newVersion,
            };

            // Construct the payload for the Update CMS API
            // Merge the new blog with any existing Related_Blogs
            const cmsPayload = JSON.stringify({
              data: {
                Related_Blogs: [...previousRelatedBlogs, newBlogObject],
              },
            });

            // Use the current video CMS record ID from state (currentVideoCMSId)
            const cmsResponse = await fetch(
              `https://cms.flowautomate.io/api/video-to-blogs/${flowData.existingCMSId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: cmsPayload,
              }
            );

            if (!cmsResponse.ok) {
              throw new Error(`CMS update failed: ${cmsResponse.statusText}`);
            }

            const cmsData = await cmsResponse.json();

            // Update local state with the newly generated blog and updated CMS data.
            setFlowData((prev) => ({
              ...prev,
              generatedBlog: newBlogObject,
              videoDetails: {
                ...prev.videoDetails,
                Related_Blogs: cmsData.data.attributes.Related_Blogs || [
                  ...previousRelatedBlogs,
                  newBlogObject,
                ],
              },
            }));

            // Proceed to the next node (e.g., Process & Save Blog)
            return { nextNodeId: "19" };
          }

          case "Process & Save Blog": {
            return { nextNodeId: "20" };
          }

          case "Update UI & CMS": {
            return { nextNodeId: "21" };
          }

          case "Display in 'All Blogs' Tab'": {
            // Blog is fully generated and displayed in the UI
            return { nextNodeId: "20" };
          }
          default:
            throw new Error(`Unhandled node: ${node.data.label}`);
        }

        if (!result || !result.nextNodeId) {
          throw new Error(
            `Failed to determine next step for node: ${node.data.label}`
          );
        }

        return result;
      } catch (error: any) {
        console.error(`Error processing node ${nodeId}:`, error);
        setNodeError(nodeId, error.message || "An unknown error occurred");
        throw error;
      } finally {
        setNodeLoading(nodeId, false);
      }
    },
    [
      nodes,
      youtubeUrl,
      setNodeError,
      setNodeLoading,
      flowData,
      selectedModel,
      videoDetailsState,
      currentVideoCMSId,
    ]
  );

  const continueAutomation = useCallback(
    async (startNodeId: string, initialData?: any) => {
      let currentNodeId = startNodeId;
      let currentData = initialData;

      const processNextNode = async () => {
        if (!currentNodeId) return;

        setActiveNodes((prev) => [...prev, currentNodeId]);
        setCurrentActiveNode(currentNodeId);
        const currentNode = nodes.find((node) => node.id === currentNodeId);

        if (!currentNode) {
          setNodeError(currentNodeId, "Node not found");
          return;
        }

        if (
          currentNode.type === "userAction" ||
          currentNode.type === "display"
        ) {
          setCurrentAction(currentNode.data.label);
          return;
        }

        try {
          const result = await processLogicalBlock(currentNodeId, currentData);
          if (result && result.nextNodeId) {
            currentNodeId = result.nextNodeId;
            currentData = result.data || currentData;
            await new Promise((resolve) => setTimeout(resolve, 500));
            await processNextNode();
          } else {
            throw new Error("Failed to determine next step");
          }
        } catch (error) {
          console.error(`Error processing node ${currentNodeId}:`, error);
          setNodeError(
            currentNodeId,
            (error as Error).message || "An unknown error occurred"
          );
          setCurrentActiveNode(currentNodeId);
        }
      };

      await processNextNode();
    },
    [nodes, processLogicalBlock, setNodeError]
  );

  const triggerAutomation = useCallback(() => {
    if (!youtubeUrl) {
      setNodeError("1", "Please enter a YouTube URL");
      return;
    }
    setFlowStarted(true);
    setActiveNodes(["1"]);
    setCurrentActiveNode("1");
    continueAutomation("2");
  }, [continueAutomation, youtubeUrl, setNodeError]);

  const restartFromNode = useCallback(
    (nodeId: string) => {
      setActiveNodes((prev) => {
        const index = prev.indexOf(nodeId);
        return index !== -1 ? prev.slice(0, index + 1) : [...prev, nodeId];
      });
      setCurrentActiveNode(nodeId);

      const currentNode = nodes.find((node) => node.id === nodeId);
      if (!currentNode) {
        setNodeError(nodeId, "Node not found");
        return;
      }

      if (currentNode.type === "userAction" || currentNode.type === "display") {
        setCurrentAction(currentNode.data.label);
      } else {
        continueAutomation(nodeId);
      }
    },
    [continueAutomation, nodes, setNodeError]
  );

  const handleContinue = useCallback(() => {
    const nextEdge = edges.find((edge) => edge.source === currentActiveNode);
    if (nextEdge) {
      continueAutomation(nextEdge.target);
    } else {
      setNodeError(currentActiveNode, "No next step found");
    }
  }, [continueAutomation, currentActiveNode, edges, setNodeError]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setActiveNodes(["1"]);
    setCurrentActiveNode("1");
    setCurrentAction("");
    setFlowStarted(false);
    setYoutubeUrl("");
    setFlowData({});
    setSelectedModel("gpt-3.5-turbo");
    setVideoDetailsState(null);
  }, [setNodes, setEdges]);

  const handleUserAction = useCallback(
    (nodeId: string) => {
      const currentNode = nodes.find((node) => node.id === nodeId);
      if (currentNode) {
        if (
          currentNode.data.label === "Initiate Analysis" ||
          currentNode.data.label === "Submit Optimization Details"
        ) {
          toast({
            title: "Model Selected",
            description: `Selected model: ${selectedModel}`,
          });
        }
        toast({
          title: "User Action",
          description: `Performed action: ${currentNode.data.label}`,
        });
        handleContinue();
      }
    },
    [nodes, handleContinue, selectedModel]
  );

  const handleViewBlogs = useCallback(() => {
    toast({
      title: "View Blogs",
      description: "Navigating to the Blogs page...",
    });
  }, []);

  const updatedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => handleNodeClick(node.data.label, node.type || "", node.id),
      isActive: activeNodes.includes(node.id),
      isReached: activeNodes.includes(node.id),
      onReset: () => resetFlow(),
    },
    style: {
      ...node.style,
      opacity: activeNodes.includes(node.id) ? 1 : 0.5,
    },
  }));

  useEffect(() => {
    const currentNode = nodes.find((node) => node.id === currentActiveNode);
    if (currentNode) {
      setCurrentAction(currentNode.data.label);
    }
  }, [currentActiveNode, nodes]);

  useEffect(() => {
    const currentNode = nodes.find((node) => node.id === currentActiveNode);
    if (currentNode && currentNode.data.error) {
      toast({
        title: "Error",
        description: currentNode.data.error,
        variant: "destructive",
      });
    }
  }, [currentActiveNode, nodes]);

  const isLastNode = currentActiveNode === nodes[nodes.length - 1].id;
  const showContinueButton = flowStarted && !isLastNode;
  console.log("flowData", flowData);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex">
        <div className="w-1/2 relative">
          <ReactFlow
            nodes={updatedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={16} />
            <Panel position="top-left">
              <Button onClick={resetFlow} variant="outline" className="mr-2">
                Reset Flow
              </Button>
              {!flowStarted && (
                <Button onClick={triggerAutomation}>Start Automation</Button>
              )}
            </Panel>
          </ReactFlow>
        </div>
        <div className="w-1/2 p-4 overflow-y-auto">
          <NodeInfo
            action={currentAction}
            onContinue={handleContinue}
            onAction={() => handleUserAction(currentActiveNode)}
            onViewBlogs={handleViewBlogs}
            isUserAction={
              nodes.find((node) => node.id === currentActiveNode)?.type ===
              "userAction"
            }
            isDisplayNode={
              nodes.find((node) => node.id === currentActiveNode)?.type ===
              "display"
            }
            flowData={flowData}
            setFlowData={setFlowData}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            currentActiveNode={currentActiveNode}
            isReached={activeNodes.includes(currentActiveNode)}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          {showContinueButton && (
            <div className="mt-4">
              <Button onClick={() => restartFromNode(currentActiveNode)}>
                Continue from Current Node
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
