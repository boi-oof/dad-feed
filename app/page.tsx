"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Post } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import Bubbles from "@/components/Bubbles";

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
      <Bubbles />

      <header className="max-w-5xl mx-auto px-5 pt-10 pb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl sm:text-5xl text-turquoise-dark drop-shadow-sm">
            Dad&apos;s Feed 🌊
          </h1>
          <p className="text-teal-ink/70 font-semibold mt-1">
            Every photo, straight from him.
          </p>
        </div>
        <Link
          href="/login"
          className="shrink-0 hover-wiggle inline-flex items-center gap-1.5 bg-white text-turquoise-dark font-bold px-4 py-2 rounded-full shadow-sm border-2 border-turquoise/20 text-sm mt-1"
        >
          Dad&apos;s login
        </Link>
      </header>

      {allTags.length > 0 && (
        <div className="max-w-5xl mx-auto px-5 pb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              activeTag === null
                ? "bg-turquoise text-white"
                : "bg-white text-turquoise-dark border border-turquoise/20"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                activeTag === tag
                  ? "bg-coral text-white"
                  : "bg-white text-turquoise-dark border border-turquoise/20"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 pb-16">
        {loading ? (
          <p className="text-center text-teal-ink/60 font-semibold py-16">
            Loading photos…
          </p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl display text-turquoise-dark">No photos yet!</p>
            <p className="text-teal-ink/60 font-semibold mt-2">
              Once Dad uploads something, it&apos;ll show up right here.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                rotation={(i % 2 === 0 ? 1 : -1) * (3 + (i % 3))}
                onTagClick={setActiveTag}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
