"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Bubbles from "@/components/Bubbles";

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
      // 1. Ask our server for a signed upload URL (this checks Dad is logged in).
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

      // 2. Upload the photo straight to Supabase Storage from the browser.
      //    This skips Vercel's function size limit entirely, so full-size
      //    phone photos work fine.
      const { getPublicClient } = await import("@/lib/supabase");
      const supabase = getPublicClient();
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .uploadToSignedUrl(path, token, file);
      if (uploadError) throw uploadError;

      // 3. Tell our server the upload is done so it can save the post
      //    (caption, tags, and the server-stamped timestamp).
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
      <Bubbles />

      <header className="max-w-lg mx-auto px-5 pt-8 pb-2 flex items-center justify-between">
        <h1 className="display text-3xl text-turquoise-dark">New photo 🐬</h1>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-turquoise-dark border border-turquoise/20"
          >
            View feed
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-coral border border-coral/20"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-16 pt-4">
        <form
          onSubmit={handleSubmit}
          className="animate-pop-in bg-white rounded-3xl shadow-[0_12px_32px_-8px_rgba(15,61,58,0.3)] border-4 border-white p-6"
        >
          {/* Photo picker */}
          <label
            htmlFor="photo-input"
            className="block rounded-2xl border-4 border-dashed border-turquoise/30 bg-foam overflow-hidden cursor-pointer relative"
            style={{ aspectRatio: preview ? "auto" : "4/3" }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-full h-auto" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-turquoise-dark py-10">
                <span className="text-4xl">📷</span>
                <span className="font-bold">Tap to take or choose a photo</span>
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

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Quick caption…"
            rows={2}
            className="w-full mt-4 bg-foam border-2 border-turquoise/20 rounded-2xl px-4 py-3 font-semibold text-teal-ink placeholder:text-teal-ink/30 focus:outline-none focus:border-turquoise transition-colors resize-none"
          />

          {/* Tags */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-turquoise/10 text-turquoise-dark"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-turquoise-dark/60 hover:text-coral"
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
              className="w-full bg-foam border-2 border-turquoise/20 rounded-2xl px-4 py-2.5 text-sm font-semibold text-teal-ink placeholder:text-teal-ink/30 focus:outline-none focus:border-turquoise transition-colors"
            />
          </div>

          <p className="text-xs text-teal-ink/40 font-semibold mt-3 text-center">
            The date and time stamp on the photo when you hit post.
          </p>

          {error && (
            <p className="text-coral font-bold text-sm mt-2 text-center">{error}</p>
          )}
          {success && (
            <p className="text-turquoise-dark font-bold text-sm mt-2 text-center">
              Posted! It&apos;s live on the feed. 🎉
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !file}
            className="hover-wiggle mt-5 w-full bg-coral text-white font-bold py-3 rounded-2xl shadow-md disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Posting…" : "Post it!"}
          </button>
        </form>
      </main>
    </div>
  );
}
