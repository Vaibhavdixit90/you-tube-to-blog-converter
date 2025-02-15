"use client"

import YouTubeToBlogFlow from "@/app/YouTubeBlogFlow/page";
import YouTubeToBlogConverter from "../components/YouTubeToBlogConverter";

export default function SyntheticV0PageForDeployment() {
  return (
    <>
      <YouTubeToBlogConverter />
      <YouTubeToBlogFlow />
    </>
  );
}