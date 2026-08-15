import React from "react";
import { AlertTriangle, GitBranch, Info } from "lucide-react";

const styles = {
  info: { wrap: "border-[#b3d4ff] bg-[#f0f6ff] text-[#1a1a1a]", icon: "text-[#2c6ecb]" },
  warning: { wrap: "border-[#ffd79d] bg-[#fff5ea] text-[#1a1a1a]", icon: "text-[#b98900]" },
  error: { wrap: "border-[#ffb3ab] bg-[#fff4f4] text-[#1a1a1a]", icon: "text-[#d72c0d]" },
};

export function describeRepoError(raw) {
  const msg = String(raw || "");
  if (/repository is empty/i.test(msg) || /\(409\)/.test(msg)) {
    return {
      tone: "info",
      icon: GitBranch,
      title: "This repository has no commits yet",
      body: "Push your first commit to GitHub and the history will appear here automatically.",
    };
  }
  if (/\(404\)/.test(msg)) {
    return {
      tone: "warning",
      icon: AlertTriangle,
      title: "Repository or branch not found",
      body: "It may have been renamed, deleted, or is not accessible with the connected GitHub account.",
    };
  }
  if (/\(401\)|\(403\)/.test(msg)) {
    return {
      tone: "warning",
      icon: AlertTriangle,
      title: "GitHub access denied",
      body: "Reconnect GitHub or grant access to this repository, then try again.",
    };
  }
  return {
    tone: "error",
    icon: Info,
    title: "Could not load commit history",
    body: "GitHub did not return a result for this repository. Please try again in a moment.",
  };
}

export default function RepoNotice({ rawError }) {
  const { tone, icon: Icon, title, body } = describeRepoError(rawError);
  const s = styles[tone];
  return (
    <div className={`flex items-start gap-3 border-b px-4 py-3 ${s.wrap}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-[#616161]">{body}</p>
      </div>
    </div>
  );
}