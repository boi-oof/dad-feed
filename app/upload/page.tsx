"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Wash from "@/components/Wash";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  }

  function addTag() {
    const t = tagDraft.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagDraft === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter((tag) => tag !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Pick a photo first!");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      if (!urlRes.ok) {
        const data = await urlRes.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't prepare the upload.");
      }
      const { path, token } = await urlRes.json();

      const { getPublicClient } = await import("@/lib/supabase");
      const supabase = getPublicClient();
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .uploadToSignedUrl(path, token, file);
      if (uploadError) throw uploadError;

      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, caption, tags }),
      });
      if (!postRes.ok) {
        const data = await postRes.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't save the post.");
      }

      setSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption("");
      setTags([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex-1 relative">
      <Wash />

      <header className="max-w-lg mx-auto px-6 pt-10 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-sea-green font-medium mb-1">
            New entry
          </p>
          <h1 className="display italic text-3xl text-sea-blue-deep">Add a photo</h1>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <a
            href="/"
            className="text-[11px] tracking-[0.1em] uppercase font-medium text-sea-blue border border-sea-blue/25 px-3 py-1.5 rounded-full hover:bg-sea-blue hover:text-paper transition-colors"
          >
            Feed
          </a>
          <button
            onClick={handleLogout}
            className="text-[11px] tracking-[0.1em] uppercase font-medium text-ink/50 border border-ink/15 px-3 py-1.5 rounded-full hover:border-ink/30 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 pb-16 pt-4">
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up bg-paper rounded-lg border border-sea-green/15 shadow-[0_1px_3px_rgba(20,47,61,0.08)] p-6"
        >
          <label
            htmlFor="photo-input"
            className="block rounded-md border border-sea-green/20 bg-ivory overflow-hidden cursor-pointer relative"
            style={{ aspectRatio: preview ? "auto" : "4/3" }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-full h-auto" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-sea-blue py-10">
                <span className="text-3xl">＋</span>
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium">
                  Tap to take or choose a photo
                </span>
              </div>
            )}
          </label>
          <input
            id="photo-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Quick caption…"
            rows={2}
            className="w-full mt-4 bg-ivory border border-sea-green/20 rounded-md px-4 py-3 font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:border-sea-green transition-colors resize-none display italic text-[17px]"
          />

          <div className="mt-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-[11px] tracking-[0.08em] uppercase font-medium text-sea-green"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-sea-green/50 hover:text-sea-blue-deep"
                    aria-label={`Remove tag ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Add a tag and hit enter (e.g. family, garden)"
              className="w-full bg-ivory border border-sea-green/20 rounded-md px-4 py-2.5 text-sm font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:border-sea-green transition-colors"
            />
          </div>

          <p className="text-[11px] tracking-[0.08em] uppercase text-ink/35 font-medium mt-4 text-center">
            The date and time stamp automatically when you post
          </p>

          {error && (
            <p className="text-[13px] text-sea-blue-deep font-medium mt-2 text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-[13px] text-sea-green font-medium mt-2 text-center">
              Posted — it&apos;s live on the feed.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="mt-6 w-full bg-sea-blue-deep text-paper font-medium tracking-wide py-3 rounded-md hover:bg-sea-blue transition-colors disabled:opacity-40"
          >
            {submitting ? "Posting…" : "Post it"}
          </button>
        </form>
      </main>
    </div>
  );
}
