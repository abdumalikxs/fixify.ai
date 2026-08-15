import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import PipelineFeed from "@/components/dashboard/PipelineFeed";

export default function Pipelines() {
  const [deployments, setDeployments] = useState(null);

  useEffect(() => {
    base44.entities.Deployment.list("-timestamp", 50).then(setDeployments);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipelines</h1>
        <p className="mt-1 text-sm text-zinc-500">Every build across connected branches.</p>
      </div>
      {!deployments ? (
        <div className="flex h-40 items-center justify-center text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <PipelineFeed deployments={deployments} />
      )}
    </div>
  );
}