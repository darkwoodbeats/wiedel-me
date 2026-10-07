"use client";

import { useId, useState, type FormEvent } from "react";
import { formspreeEndpoint, isFormspreeConfigured } from "@/lib/site";
import hero from "@/components/hero/OutrunHero.module.css";
import styles from "./Contact.module.css";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * The inquiry form, posting to Formspree (ported from wiedel.me). It submits with fetch so the
 * visitor stays on the site; without JS it still posts normally through `action`. Until a real
 * Formspree ID is configured the form is disabled rather than pretending to work, because the
 * placeholder endpoint 404s and the lead would be lost silently.
 */
export function ContactForm({ serviceOptions, subject }: { serviceOptions: string[]; subject: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const id = useId();
  const field = (key: string) => `${id}-${key}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setName(String(data.get("name") ?? "").trim());
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(formspreeEndpoint, {
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
      setErrorMessage(message || "That didn’t go through. Please try again, or email me directly.");
      setStatus("error");
    } catch {
      setErrorMessage("Couldn’t reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className={styles.success}>
        <svg viewBox="0 0 24 24" className={styles.successMark} aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <h3 className={styles.successTitle}>{name ? `Thanks, ${name}.` : "Thanks for reaching out."}</h3>
        <p className={styles.successBody}>
          Your message is in. I read everything myself and usually reply within a day or two — check
          your inbox, and your spam folder just in case.
        </p>
        <button
          type="button"
          className={hero.secondary}
          onClick={() => {
            setStatus("idle");
            setName("");
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const errorId = field("error");

  return (
    <form
      action={formspreeEndpoint}
      method="POST"
      onSubmit={handleSubmit}
      className={styles.form}
      aria-label="Send an inquiry"
      aria-describedby={status === "error" ? errorId : undefined}
    >
      <fieldset disabled={submitting} className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={field("name")}>Name</label>
          <input id={field("name")} name="name" autoComplete="name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor={field("email")}>Email</label>
          <input id={field("email")} type="email" name="email" autoComplete="email" required />
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor={field("service")}>What can I help with?</label>
          <select id={field("service")} name="service" defaultValue="">
            <option value="">Choose one</option>
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label htmlFor={field("message")}>Tell me a little about it</label>
          <textarea
            id={field("message")}
            name="message"
            required
            rows={5}
            placeholder="What do you need, when do you need it, and anything else I should know?"
          />
        </div>

        {/* Spam honeypot: hidden from people, tempting to bots. */}
        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
        <input type="hidden" name="_subject" value={subject} />

        <button type="submit" disabled={!isFormspreeConfigured || submitting} className={`${hero.primary} ${styles.submit}`}>
          {submitting ? "Sending…" : "Send inquiry →"}
        </button>
      </fieldset>

      {status === "error" && (
        <p id={errorId} role="alert" className={styles.error}>
          {errorMessage}
        </p>
      )}

      {!isFormspreeConfigured && (
        <p role="status" className={styles.error}>
          Form not connected yet. Set <code>NEXT_PUBLIC_FORMSPREE_ENDPOINT</code> in <code>.env.local</code> to
          your Formspree URL, then restart the dev server.
        </p>
      )}
    </form>
  );
}
