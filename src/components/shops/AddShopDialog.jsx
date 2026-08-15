import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function AddShopDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", domain: "", contact_email: "" });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await base44.entities.Shop.create({ ...form, status: "Active" });
    setSaving(false);
    setForm({ name: "", domain: "", contact_email: "" });
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
            <Label className="text-xs">Contact email</Label>
            <Input value={form.contact_email} onChange={set("contact_email")} placeholder="owner@shop.com" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>{saving ? "Saving" : "Create shop"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}