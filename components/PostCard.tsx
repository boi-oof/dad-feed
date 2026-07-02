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
  return { date, time };
}

export default function PostCard({
  post,
  rotation,
  onTagClick,
}: {
  post: Post;
  rotation?: number;
  onTagClick?: (tag: string) => void;
}) {
  const { date, time } = formatStamp(post.created_at);
  const rot = rotation ?? 0;

  return (
    <div className="animate-pop-in break-inside-avoid mb-6 bg-white rounded-3xl p-3 pb-4 shadow-[0_8px_24px_-6px_rgba(15,61,58,0.25)] border-4 border-white">
      <div className="relative rounded-2xl overflow-hidden bg-foam">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.caption || "Photo from Dad"}
          className="w-full h-auto object-cover"
          loading="lazy"
        />

        {/* postmark timestamp sticker */}
        <div
          className="stamp-edge absolute top-3 right-3 bg-sunshine text-teal-ink text-[11px] font-bold px-3 py-2 rounded-full shadow-md leading-tight text-center"
          style={{ transform: `rotate(${rot}deg)` }}
        >
          <div>{date}</div>
          <div className="opacity-70">{time}</div>
        </div>
      </div>

      {post.caption && (
        <p className="display text-lg text-teal-ink mt-3 px-1 leading-snug">
          {post.caption}
        </p>
      )}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 px-1">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-turquoise/10 text-turquoise-dark hover:bg-turquoise hover:text-white transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
