"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  onTriggerAutomation: () => void;
  onContinueAutomation: (nodeId: string) => void;
  currentNodeId: string;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  isOpen,
  onClose,
  action,
  onTriggerAutomation,
  onContinueAutomation,
  currentNodeId,
}) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setError("");
    }
  }, [isOpen]);

  const handleAction = () => {
    onContinueAutomation(currentNodeId);
  };

  const validateYouTubeUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11;
  };

  const handleSubmitUrl = () => {
    if (validateYouTubeUrl(url)) {
      setError("");
      onTriggerAutomation();
      onClose();
    } else {
      setError("Please enter a valid YouTube URL");
    }
  };

  const renderActionContent = () => {
    switch (action) {
      case "Enter YouTube URL":
        return (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                type="url"
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button onClick={handleSubmitUrl} disabled={!url}>
              Check and Start Automation
            </Button>
          </div>
        );
      case "Initiate Analysis":
      case "Select Blog to Generate":
      case "Submit Optimization Details":
        return (
          <div className="space-y-4">
            <p>Simulating {action}</p>
            <Button onClick={handleAction}>Continue</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            {action === "Extract Video ID" || action === "Video in CMS?"
              ? "Details about this logical block:"
              : "Simulate the user action for this step."}
          </DialogDescription>
        </DialogHeader>
        {renderActionContent()}
      </DialogContent>
    </Dialog>
  );
};

export default UserActionModal;
