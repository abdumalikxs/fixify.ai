import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function ThemeCheckButton({ repo, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (repo.theme_check_enabled) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-[#008060]">
        <ShieldCheck className="h-3.5 w-3.5" /> Theme Check on
      </span>
    );
  }

  const enable = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("enableThemeCheck", { monitored_repo_id: repo.id });
      onChange();
    } catch (e) {
      setError(e?.response?.data?.error || "Could not add Theme Check.");
    }
    setBusy(false);
  };

  return (
    <div className="text-right">
      <Button size="sm" variant="outline" onClick={enable} disabled={busy}>
        {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1 h-3.5 w-3.5" />}
        {busy ? "Adding" : "Add Theme Check"}
      </Button>
      {error && <p className="mt-1 text-[11px] text-[#d72c0d]">{error}</p>}
    </div>
  );
}