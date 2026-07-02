"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wash from "@/components/Wash";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong.");
        return;
      }

      router.push("/upload");
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 relative flex items-center justify-center px-6 py-16">
      <Wash />

      <form
        onSubmit={handleSubmit}
        className="animate-fade-up w-full max-w-sm bg-paper rounded-lg border border-sea-green/15 shadow-[0_1px_3px_rgba(20,47,61,0.08)] p-10 text-center"
      >
        <p className="text-[11px] tracking-[0.22em] uppercase text-sea-green font-medium mb-3">
          Welcome back
        </p>
        <h1 className="display italic text-3xl text-sea-blue-deep">Dad&apos;s Login</h1>
        <p className="text-ink/50 font-medium mt-2 mb-7 text-sm">
          Enter your password to post a photo.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full text-center bg-ivory border border-sea-green/20 rounded-md px-4 py-3 font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:border-sea-green transition-colors"
        />

        {error && (
          <p className="text-[13px] text-sea-blue-deep font-medium mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full bg-sea-blue-deep text-paper font-medium tracking-wide py-3 rounded-md hover:bg-sea-blue transition-colors disabled:opacity-40"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
