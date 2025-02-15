"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  onContinue: () => void;
}

const DisplayModal: React.FC<DisplayModalProps> = ({
  isOpen,
  onClose,
  action,
  onContinue,
}) => {
  const renderContent = () => {
    switch (action) {
      case "Display Video Details":
        return (
          <div className="space-y-4">
            <p>This step displays the following video details:</p>
            <ul className="list-disc list-inside">
              <li>Video title</li>
              <li>Channel name</li>
              <li>View count</li>
              <li>Upload date</li>
              <li>Video description (truncated)</li>
              <li>Thumbnail image</li>
            </ul>
          </div>
        );
      case "Convert & Display Analysis":
        return (
          <div className="space-y-4">
            <p>
              This step shows the converted analysis of the video, including:
            </p>
            <ul className="list-disc list-inside">
              <li>Main topics covered</li>
              <li>Key points for each topic</li>
              <li>Estimated reading time</li>
              <li>Suggested tags or categories</li>
            </ul>
          </div>
        );
      case "Update CMS & Display":
        return (
          <div className="space-y-4">
            <p>This step updates the CMS with the new analysis and displays:</p>
            <ul className="list-disc list-inside">
              <li>Confirmation of successful CMS update</li>
              <li>Summary of the analysis</li>
              <li>Option to view full analysis</li>
            </ul>
          </div>
        );
      case "Display Blog Generation Options":
        return (
          <div className="space-y-4">
            <p>This step presents the user with blog generation options:</p>
            <ul className="list-disc list-inside">
              <li>Multiple blog title suggestions</li>
              <li>Estimated word count for each option</li>
              <li>Suggested focus or angle for each blog option</li>
            </ul>
          </div>
        );
      case 'Display in "All Blogs" Tab':
        return (
          <div className="space-y-4">
            <p>
              This step shows the newly generated blog in the "All Blogs" tab:
            </p>
            <ul className="list-disc list-inside">
              <li>Blog title</li>
              <li>Publication date</li>
              <li>Author name</li>
              <li>Brief excerpt or summary</li>
              <li>Associated tags or categories</li>
              <li>Options to edit, delete, or view the full blog</li>
            </ul>
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
            Information displayed at this step:
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <div className="mt-4 flex justify-end">
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayModal;
