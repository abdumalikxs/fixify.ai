import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function AddShopDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", repo: "" });
  const [repos, setRepos] = useState([]);
  const [repoError, setRepoError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || repos.length) return;
    base44.functions
      .invoke("listGithubRepos", {})
      .then((r) => setRepos(r.data.repos || []))
      .catch((e) => setRepoError(e?.response?.data?.error || "Could not load repositories."));
  }, [open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.repo) return;
    setSaving(true);
    const shop = await base44.entities.Shop.create({
      name: form.name,
      domain: form.domain,
      status: "Active",
    });
    const repo = repos.find((r) => r.full_name === form.repo);
    const existing = await base44.entities.MonitoredRepo.filter({ full_name: form.repo });
    if (existing.length) {
      await base44.entities.MonitoredRepo.update(existing[0].id, { shop_id: shop.id, enabled: true });
    } else {
      await base44.entities.MonitoredRepo.create({
        full_name: form.repo,
        default_branch: repo?.default_branch || "main",
        shop_id: shop.id,
        enabled: true,
      });
    }
    setSaving(false);
    setForm({ name: "", domain: "", repo: "" });
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add shop</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add a connected shop</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="text-xs">Shop name</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Misra Home" />
          </div>
          <div>
            <Label className="text-xs">Domain</Label>
            <Input value={form.domain} onChange={set("domain")} placeholder="misrahome.myshopify.com" />
          </div>
          <div>
            <Label className="text-xs">GitHub repository</Label>
            <Select value={form.repo} onValueChange={(v) => setForm({ ...form, repo: v })}>
              <SelectTrigger>
                <SelectValue placeholder={repos.length ? "Select a repository" : "Loading repositories…"} />
              </SelectTrigger>
              <SelectContent>
                {repos.map((r) => (
                  <SelectItem key={r.full_name} value={r.full_name} className="font-mono text-xs">
                    {r.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-[#8a8a8a]">
              This repo becomes the shop&apos;s code source and starts being monitored in Autopilot.
            </p>
            {repoError && <p className="mt-1 text-[11px] text-[#d72c0d]">{repoError}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || !form.repo}>{saving ? "Saving" : "Create shop"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}