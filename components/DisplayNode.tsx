import { memo } from "react";
import { Handle, Position } from "reactflow";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DisplayNode = ({ data }) => {
  console.log("🚀 ~ DisplayNode ~ data:", data);
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md ${
        data.error
          ? "bg-red-100 border-2 border-red-500"
          : "bg-blue-100 border-2 border-blue-500"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-sm mb-2">{data.label}</div>
      {data.error ? (
        <div className="text-red-500 text-xs mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {data.error}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={data.onReset}
            className="p-1 h-6 text-red-500 hover:text-red-700"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      ) : data.isLoading ? (
        <div className="text-blue-500 text-xs mb-2 flex items-center">
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          Processing...
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(DisplayNode);
