"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import YouTubeToBlogFlow from "./YouTubeToBlogFlow";
import React from "react";
import { Toaster } from "@/components/ui/toaster";

export default function FlowDiagramWrapper() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            An error occurred while rendering the flow diagram.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was an unexpected error in the YouTube to Blog Post
              conversion flow. Please try again or contact support if the
              problem persists.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setHasError(false)} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>YouTube Video to Blog Post Conversion Flow</CardTitle>
        <CardDescription>
          This diagram illustrates the process of converting a YouTube video
          into a blog post, from URL input to final blog display. Yellow nodes
          indicate steps that require user action, blue nodes represent display
          points where information is presented to the user, green nodes
          represent logical blocks that perform specific operations, and white
          nodes are system actions. Click on any node to see more details about
          that step. Enter a URL and click "Start Automation" to see the process
          in action.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorBoundary onError={() => setHasError(true)}>
          <YouTubeToBlogFlow />
        </ErrorBoundary>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 mr-2"></div>
            <span>User Action (clickable)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 mr-2"></div>
            <span>Display Point (clickable)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-500 mr-2"></div>
            <span>Logical Block</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 mr-2"></div>
            <span>System Action</span>
          </div>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
