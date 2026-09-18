"use client";

import { useRef, useState } from "react";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "https://formspree.io/f/YOUR_FORM_ID";

/**
 * True until a real Formspree ID is in .env.local. Submitting to the placeholder
 * endpoint 404s and the lead is lost silently, so the form stays disabled until
 * it's configured rather than pretending to work.
 */
const isUnconfigured = FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID");


const fieldClass =
  "w-full rounded-[13px] border border-line bg-[#0b0d12] px-3.5 py-[13px] font-inherit text-white outline-none focus:border-brand-cyan focus:shadow-[0_0_0_3px_rgb(92_225_230/0.1)]";
const labelClass = "text-[0.82rem] text-[#c9ced8]";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  /** Choices for the "What can I help with?" dropdown. */
  serviceOptions: string[];
  /** Email subject Formspree uses, so leads from each page are easy to tell apart. */
  subject: string;
};

export default function ContactForm({ serviceOptions, subject }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Intercept the native POST so the visitor stays on the site instead of
    // being handed off to Formspree's own thank-you page. Without JS the form
    // still submits normally via `action` — it just redirects, as before.
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    setName(String(data.get("name") ?? "").trim());
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus("success");
        return;
      }

      // Formspree returns { errors: [{ message }] } for validation problems.
      const payload = await response.json().catch(() => null);
      const message = payload?.errors?.map((e: { message: string }) => e.message).join(", ");
      setErrorMessage(message || "That didn't go through. Please try again, or email me directly.");
      setStatus("error");
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[430px] flex-col items-start justify-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-brand-purple/40 bg-brand-purple/10">
          <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="var(--color-brand-purple)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="mt-6 mb-3 font-display text-[2rem] leading-none tracking-[-0.05em]">
          {name ? `Thanks, ${name}.` : "Thanks for reaching out."}
        </h3>
        <p className="max-w-[46ch] text-muted">
          Your message is in. I read everything myself and usually reply within a day or two — check your inbox, and
          your spam folder just in case.
        </p>

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setName("");
          }}
          className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full border border-line bg-white/3 px-[21px] py-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form ref={formRef} action={FORMSPREE_ENDPOINT} method="POST" onSubmit={handleSubmit}>
      <fieldset disabled={submitting} className="contents">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input id="name" name="name" autoComplete="name" required className={fieldClass} />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" type="email" name="email" autoComplete="email" required className={fieldClass} />
          </div>

          <div className="flex flex-col gap-[7px] sm:col-span-full">
            <label htmlFor="service" className={labelClass}>
              What can I help with?
            </label>
            <select id="service" name="service" defaultValue="" className={fieldClass}>
              <option value="">Choose one</option>
              {serviceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-[7px] sm:col-span-full">
            <label htmlFor="message" className={labelClass}>
              Tell me a little about it
            </label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="What do you need, when do you need it, and anything else I should know?"
              className={`${fieldClass} min-h-[140px] resize-y`}
            />
          </div>
        </div>

        {/* Spam honeypot — hidden from humans, tempting to bots. */}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] opacity-0" />
        <input type="hidden" name="_subject" value={subject} />

        <button
          type="submit"
          disabled={isUnconfigured || submitting}
          className="mt-3.5 w-full cursor-pointer rounded-full border border-brand-purple bg-brand-purple px-[21px] py-[14px] font-bold text-[#0a0b0d] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-line disabled:bg-white/6 disabled:text-muted disabled:hover:translate-y-0"
        >
          {submitting ? "Sending…" : "Send inquiry →"}
        </button>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="mt-3 text-[0.82rem] leading-relaxed text-error">
          {errorMessage}
        </p>
      )}

      {isUnconfigured && (
        <p role="status" className="mt-3 text-[0.78rem] leading-relaxed text-error">
          Form not connected yet. Set <code className="font-display">NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> in{" "}
          <code className="font-display">.env.local</code> to your Formspree URL, then restart the dev server.
        </p>
      )}
    </form>
  );
}
