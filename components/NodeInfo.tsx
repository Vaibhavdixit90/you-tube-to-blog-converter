import type React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, ThumbsUp, Calendar, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import MarkdownRenderer from "./MarkdownRenderer";
import { Textarea } from "@/components/ui/textarea";
import DisplayAllBlogs from "./DisplayAllBlogs";

interface NodeInfoProps {
  action: string;
  onContinue: () => void;
  onAction: () => void;
  onViewBlogs: () => void;
  isUserAction: boolean;
  isDisplayNode: boolean;
  flowData: Record<string, any>;
  setFlowData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  currentActiveNode: string;
  isReached: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const NodeInfo: React.FC<NodeInfoProps> = ({
  action,
  onContinue,
  onAction,
  onViewBlogs,
  isUserAction,
  isDisplayNode,
  flowData,
  setFlowData,
  youtubeUrl,
  setYoutubeUrl,
  currentActiveNode,
  isReached,
  selectedModel,
  setSelectedModel,
}) => {
  // State for active tab (version) for the "Wants to create new Blog" step.
  const [activeVersion, setActiveVersion] = useState<string>("");
  const [userChoice, setUserChoice] = useState<string | null>(null);

  // Update the active version when groupedBlogs changes.
  useEffect(() => {
    if (flowData.groupedBlogs) {
      const versions = Object.keys(flowData.groupedBlogs);
      if (versions.length > 0 && !activeVersion) {
        setActiveVersion(versions[0]); // ✅ Ensuring state is set safely
      }
    }
  }, [flowData.groupedBlogs, activeVersion]);

  const renderModelSelection = () => {
    return (
      <div className="mt-4">
        <Label htmlFor="model-select">Select LLM Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger id="model-select">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-v1">Claude v1</SelectItem>
            <SelectItem value="claude-v2">Claude v2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderContent = () => {
    switch (action) {
      case "Enter YouTube URL":
        return (
          <div>
            <p>Enter a valid YouTube URL to begin the conversion process.</p>
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="mt-2"
            />
          </div>
        );
      case "Display Video Details":
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-2">Video Details:</h3>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              {flowData.videoDetails && (
                <>
                  <div className="aspect-video w-full">
                    <img
                      src={
                        flowData.videoDetails.videoThumbnailImage ||
                        "/placeholder.svg?height=720&width=1280"
                      }
                      alt={flowData.videoDetails.videoTitle}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-xl">
                        {flowData.videoDetails.videoTitle}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Video ID: {flowData.videoDetails.searchId}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Published on :{" "}
                        {new Date(
                          flowData.videoDetails.createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-1">Description:</h5>
                      <p className="text-sm whitespace-pre-wrap">
                        {flowData.videoDetails.videoDescription}
                      </p>
                    </div>
                    {flowData.videoDetails.Related_Blogs && (
                      <div>
                        <h5 className="font-semibold mb-1">Related Blogs:</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {flowData.videoDetails.Related_Blogs.length} blog
                          posts already generated.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <a
                        href={flowData.videoDetails.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View on YouTube
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            flowData.videoDetails.videoUrl
                          );
                          toast({
                            title: "URL Copied",
                            description:
                              "Video URL has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case "Convert & Display Analysis":
        return (
          <div className="space-y-4">
            <h3 className="font-bold mb-2">Video Analysis:</h3>
            {flowData.analysis ? (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                <MarkdownRenderer content={flowData.analysis} />
              </div>
            ) : (
              <div
                className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
                role="alert"
              >
                <p className="font-bold">Analysis Pending</p>
                <p>
                  The analysis data is currently being processed. Please wait.
                </p>
              </div>
            )}
          </div>
        );
      case "Update CMS & Display":
        return (
          <div className="space-y-4">
            <h3 className="font-bold mb-2">Updated Video Analysis:</h3>
            {flowData.analysis ? (
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                <MarkdownRenderer content={flowData.analysis} />
              </div>
            ) : (
              <p>Updated analysis data is not available.</p>
            )}
          </div>
        );
      case "Display Blog Generation Options":
        return (
          <div>
            <h3 className="font-bold mb-2">Blog Ideas:</h3>
            {flowData.blogIdeas && flowData.blogIdeas.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {flowData.blogIdeas.map((idea: string, index: number) => (
                  <li key={index} className="text-sm">
                    {idea}
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => {
                        setFlowData((prev) => ({
                          ...prev,
                          selectedBlogIdea: idea,
                        }));
                        onAction();
                      }}
                    >
                      Select
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No blog ideas available. Please check the analysis step.</p>
            )}
          </div>
        );
      case 'Display in "All Blogs" Tab':
        return (
          <div>
            <DisplayAllBlogs
              videoId={flowData.videoDetails?.videoId || "MvQG73ahY-U"}
            />
          </div>
        );
      case "Submit Optimization Details":
        return (
          <div>
            <h3 className="font-bold mb-2">Optimization Details:</h3>
            <p>Blog Idea: {flowData.selectedBlogIdea}</p>
            <p>Model: {selectedModel}</p>
            <p>Target Audience: {flowData.targetAudience}</p>
            <p>Audience Age Group: {flowData.audienceAge}</p>
            <p>Writing Style: {flowData.writingStyle}</p>
            <p>Additional Instructions: {flowData.additionalInstructions}</p>

            <Button
              onClick={() => {
                // ✅ Ensure all required fields are filled before proceeding
                if (
                  !flowData.targetAudience ||
                  !flowData.audienceAge ||
                  !flowData.writingStyle ||
                  !flowData.additionalInstructions
                ) {
                  toast({
                    title: "Missing Details",
                    description:
                      "Please complete all fields before submitting.",
                    variant: "destructive",
                  });
                  return;
                }

                // ✅ Proceed to Node 17 ("Submit Optimization Details")
                onAction();
              }}
            >
              Submit Optimization Details
            </Button>
          </div>
        );

      case "Generate New Analysis":
        return (
          <div>
            <p>Select the LLM model to generate a new analysis:</p>
            {renderModelSelection()}
          </div>
        );
      case "Analysis Exists?":
        return (
          <div>
            <h3 className="font-bold mb-2">Analysis Check:</h3>
            {flowData.analysisExists !== undefined ? (
              <div
                className={`p-4 rounded-md ${
                  flowData.analysisExists ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                <p className="font-semibold">
                  {flowData.analysisExists
                    ? "Analysis found. Proceeding to display existing analysis."
                    : "No existing analysis found. Preparing to generate new analysis."}
                </p>
              </div>
            ) : (
              <p>Checking if analysis exists...</p>
            )}
          </div>
        );
      case "Video in CMS?":
        return (
          <div>
            <h3 className="font-bold mb-2">CMS Check:</h3>
            <p>
              {flowData.videoExists !== undefined
                ? flowData.videoExists
                  ? "Video found in CMS. Loading existing details."
                  : "Video not found in CMS. Fetching new details."
                : "Checking if video exists in CMS..."}
            </p>
            {flowData.videoExists && flowData.videoDetails && (
              <div className="mt-2">
                <p>Video ID: {flowData.videoDetails.searchId}</p>
                <p>Title: {flowData.videoDetails.videoTitle}</p>
                <p>URL: {flowData.videoDetails.videoUrl}</p>
              </div>
            )}
          </div>
        );
      case "Open Optimization Dialog":
        return (
          <div>
            <h3 className="font-bold mb-2">Optimize Blog Idea:</h3>
            <p className="mb-4">
              Selected blog idea: {flowData.selectedBlogIdea}
            </p>
            {renderModelSelection()}
            <div className="mt-4">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="Enter target audience"
                value={flowData.targetAudience || ""}
                onChange={(e) =>
                  setFlowData((prev) => ({
                    ...prev,
                    targetAudience: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="audienceAge">Audience Age Group</Label>
              <Input
                id="audienceAge"
                placeholder="Enter audience age group"
                value={flowData.audienceAge || ""}
                onChange={(e) =>
                  setFlowData((prev) => ({
                    ...prev,
                    audienceAge: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="writingStyle">Writing Style</Label>
              <Input
                id="writingStyle"
                placeholder="Enter writing style"
                value={flowData.writingStyle || ""}
                onChange={(e) =>
                  setFlowData((prev) => ({
                    ...prev,
                    writingStyle: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="additionalInstructions">
                Additional Instructions
              </Label>
              <Textarea
                id="additionalInstructions"
                placeholder="Enter any additional instructions"
                value={flowData.additionalInstructions || ""}
                onChange={(e) =>
                  setFlowData((prev) => ({
                    ...prev,
                    additionalInstructions: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <Button onClick={onAction}>Submit Optimization Details</Button>
            </div>
          </div>
        );
      case "Wants to create new Blog": {
        // Get groupedBlogs from flowData
        let groupedBlogs = flowData.groupedBlogs;

        // If groupedBlogs is not available, compute it from videoDetails.Related_Blogs
        if (
          !groupedBlogs &&
          flowData.videoDetails?.Related_Blogs &&
          flowData.selectedBlogIdea
        ) {
          const matchingBlogs = flowData.videoDetails.Related_Blogs.filter(
            (blog: any) => blog.Title === flowData.selectedBlogIdea
          );
          groupedBlogs = matchingBlogs.reduce((acc: any, blog: any) => {
            const version = blog.Version || "Unknown";
            if (!acc[version]) {
              acc[version] = [];
            }
            acc[version].push(blog);
            return acc;
          }, {});

          // Store groupedBlogs in state for future use
          setFlowData((prev) => ({ ...prev, groupedBlogs }));
        }

        // If groupedBlogs is not available, show a message with a Regenerate button.
        if (!groupedBlogs || Object.keys(groupedBlogs).length === 0) {
          return (
            <div>
              <p>No previously generated blogs available.</p>
              <Button
                onClick={() => {
                  // Mark that the user chose to regenerate.
                  setFlowData((prev) => ({
                    ...prev,
                    userChoseRegenerate: true,
                  }));
                  // Immediately move to Node 16 (Open Optimization Dialog)
                  onAction();
                }}
              >
                Regenerate
              </Button>
            </div>
          );
        }

        // If the user hasn't chosen yet, show the choice buttons.
        if (userChoice === null) {
          return (
            <div>
              <h3 className="font-bold mb-2">
                Do you want to view previously generated blogs or regenerate?
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
                  // Immediately redirect to Node 16 (optimization dialog)
                  onAction();
                }}
              >
                Regenerate
              </Button>
            </div>
          );
        }

        // If the user chose to view previously generated blogs, show them.
        if (userChoice === "view") {
          // Get version keys for tab buttons.
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
                    variant={activeVersion === version ? "default" : "outline"}
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
                        <CardTitle className="text-sm">{blog.Title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs">
                          Target Audience: {blog.Target_audience} | Age Group:{" "}
                          {blog.Audience_age_group} | Writing Style:{" "}
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

      default:
        return isDisplayNode ? (
          <p>Click the "Continue" button to proceed with the flow.</p>
        ) : (
          <p>Information for this step will be displayed here.</p>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">{action}</CardTitle>
        <CardDescription>
          {isUserAction
            ? "User action required"
            : isDisplayNode
            ? "Information displayed"
            : "Processing step"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
        {isReached && (
          <>
            {isUserAction && (
              <Button
                onClick={onAction}
                className="mt-4"
                aria-label={`Perform ${action}`}
              >
                Perform Action
              </Button>
            )}
            {isDisplayNode && currentActiveNode !== "21" && (
              <Button
                onClick={onContinue}
                className="mt-4"
                aria-label={`Continue from ${action}`}
              >
                Continue
              </Button>
            )}
            {isDisplayNode && currentActiveNode === "21" && (
              <Button
                onClick={onViewBlogs}
                className="mt-4"
                aria-label="View Blogs"
              >
                View Blogs
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NodeInfo;
