"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors";

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Message sent</p>
        <p className="text-white/40 text-sm">
          We&apos;ll get back to you at <span className="text-white/60">{form.email || "your email"}</span> within 1–2 business days.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/30 font-medium uppercase tracking-wide">
            Full Name <span className="text-white/20">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/30 font-medium uppercase tracking-wide">
            Email Address <span className="text-white/20">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/30 font-medium uppercase tracking-wide">
          Subject
        </label>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select a topic…</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Billing & Payments">Billing &amp; Payments</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Account Issue">Account Issue</option>
          <option value="Commercial Licensing">Commercial Licensing</option>
          <option value="Privacy / Data Request">Privacy / Data Request</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/30 font-medium uppercase tracking-wide">
          Message <span className="text-white/20">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Describe your question or issue in detail…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-red-400/70 text-sm">
          Something went wrong. Please try again or email us directly at{" "}
          <a href="mailto:contact@smartpathavatar.online" className="underline">
            contact@smartpathavatar.online
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
