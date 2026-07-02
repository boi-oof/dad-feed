"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Post } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Wash from "@/components/Wash";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const load = useCallback(async (tag: string | null) => {
    setLoading(true);
    const url = tag ? `/api/posts?tag=${encodeURIComponent(tag)}` : "/api/posts";
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(activeTag);
  }, [activeTag, load]);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

  return (
    <div className="flex-1 relative">
      <Wash />

      <header className="max-w-6xl mx-auto px-6 sm:px-10 pt-14 pb-6 flex items-start justify-between gap-6 border-b border-sea-green/15">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-sea-green font-medium mb-2">
            A running record
          </p>
          <h1 className="display text-4xl sm:text-5xl text-sea-blue-deep italic">
            Dad&apos;s Feed
          </h1>
        </div>
        <Link
          href="/login"
          className="shrink-0 mt-1 text-[11px] tracking-[0.14em] uppercase font-medium text-sea-blue border border-sea-blue/25 px-4 py-2.5 rounded-full hover:bg-sea-blue hover:text-paper hover:border-sea-blue transition-colors"
        >
          Dad&apos;s Login
        </Link>
      </header>

      {allTags.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-[11px] tracking-[0.1em] uppercase font-medium transition-colors ${
              activeTag === null
                ? "text-sea-blue-deep"
                : "text-ink/40 hover:text-sea-blue"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-[11px] tracking-[0.1em] uppercase font-medium transition-colors ${
                activeTag === tag
                  ? "text-sea-blue-deep"
                  : "text-ink/40 hover:text-sea-blue"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 sm:px-10 pb-20 pt-2">
        {loading ? (
          <p className="text-center text-ink/50 font-medium py-20 tracking-wide">
            Loading photos…
          </p>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="display italic text-3xl text-sea-blue-deep">
              Nothing here yet
            </p>
            <p className="text-ink/50 font-medium mt-2">
              Once Dad posts something, it&apos;ll appear right here.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onTagClick={setActiveTag} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
