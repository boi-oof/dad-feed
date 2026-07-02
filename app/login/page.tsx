"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Bubbles from "@/components/Bubbles";

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
    <div className="flex-1 relative flex items-center justify-center px-5 py-16">
      <Bubbles />

      <form
        onSubmit={handleSubmit}
        className="animate-pop-in w-full max-w-sm bg-white rounded-3xl shadow-[0_12px_32px_-8px_rgba(15,61,58,0.3)] border-4 border-white p-8 text-center"
      >
        <div className="text-5xl mb-2">📸</div>
        <h1 className="display text-3xl text-turquoise-dark">Hey, Dad!</h1>
        <p className="text-teal-ink/60 font-semibold mt-1 mb-6">
          Enter your password to upload photos.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full text-center bg-foam border-2 border-turquoise/20 rounded-2xl px-4 py-3 font-bold text-teal-ink placeholder:text-teal-ink/30 focus:outline-none focus:border-turquoise transition-colors"
        />

        {error && (
          <p className="text-coral font-bold text-sm mt-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="hover-wiggle mt-5 w-full bg-turquoise text-white font-bold py-3 rounded-2xl shadow-md disabled:opacity-50 transition-opacity"
        >
          {loading ? "Checking…" : "Let me in"}
        </button>
      </form>
    </div>
  );
}
