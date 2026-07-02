const BUBBLES = [
  { size: 60, top: "8%", left: "6%", delay: "0s", color: "bg-turquoise/20" },
  { size: 34, top: "18%", left: "82%", delay: "1.2s", color: "bg-coral/25" },
  { size: 90, top: "62%", left: "88%", delay: "0.6s", color: "bg-sunshine/25" },
  { size: 46, top: "78%", left: "10%", delay: "1.8s", color: "bg-turquoise/25" },
  { size: 24, top: "40%", left: "3%", delay: "2.4s", color: "bg-coral/20" },
];

export default function Bubbles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float ${b.color}`}
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
