export default function Wash() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full animate-drift"
        style={{
          background:
            "radial-gradient(circle, rgba(47,111,94,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full animate-drift"
        style={{
          animationDelay: "3s",
          background:
            "radial-gradient(circle, rgba(31,74,95,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[380px] h-[380px] rounded-full animate-drift"
        style={{
          animationDelay: "1.5s",
          background:
            "radial-gradient(circle, rgba(47,111,94,0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
