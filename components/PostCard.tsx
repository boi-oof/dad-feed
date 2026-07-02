import type { Post } from "@/lib/supabase";

function formatStamp(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export default function PostCard({
  post,
  onTagClick,
}: {
  post: Post;
  onTagClick?: (tag: string) => void;
}) {
  return (
    <div className="animate-fade-up break-inside-avoid mb-4 bg-paper rounded-lg overflow-hidden border border-sea-green/10 shadow-[0_1px_2px_rgba(20,47,61,0.06)]">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.caption || "Photo from Dad"}
          className="w-full h-auto block"
          loading="lazy"
        />

        {/* editorial timestamp — bottom-left scrim, like a photo credit line */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sea-blue-deep/70 to-transparent pointer-events-none" />
        <div className="absolute bottom-2.5 left-3 text-[11px] tracking-[0.14em] uppercase text-paper/95 font-medium">
          {formatStamp(post.created_at)}
        </div>
      </div>

      {(post.caption || post.tags?.length > 0) && (
        <div className="px-4 py-3.5">
          {post.caption && (
            <p className="display italic text-[17px] text-ink leading-snug">
              {post.caption}
            </p>
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="text-[11px] tracking-[0.08em] uppercase font-medium text-sea-green hover:text-sea-blue transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
