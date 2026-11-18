import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { HiArrowRight, HiCheck, HiOutlineSquare2Stack } from "react-icons/hi2";
import emailjs from "@emailjs/browser";
import { launchPlane } from "../Three/planeEvents";

type SubmitStatus = "success" | "error" | null;

interface FormData {
  from_name: string;
  reply_to: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormData = {
  from_name: "",
  reply_to: "",
  subject: "",
  message: "",
};

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const EMAIL = "anomyace@gmail.com";

const contactDetails = [
  {
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: MdEmail,
    external: false,
  },
  {
    label: "WhatsApp",
    value: "+234 (805) 912-8741",
    href: "https://wa.me/2348059128741",
    icon: FaWhatsapp,
    external: true,
  },
  {
    label: "Location",
    value: "Lagos, Nigeria",
    href: undefined,
    icon: MdLocationOn,
    external: false,
  },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/blacac3", icon: FaGithub },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/aaron-ezeala",
    icon: FaLinkedin,
  },
  { label: "Twitter / X", href: "https://twitter.com/blacac3_dev", icon: FaTwitter },
];

/** One-tap subject lines — they just fill the Subject field. */
const TOPICS = ["New product", "Backend / API", "Freelance build", "Full-time role", "Just saying hi"];

const STEPS = [
  ["Reply", "A personal answer within 24 hours."],
  ["Scope call", "Twenty minutes to pin down goals, timeline and budget."],
  ["Proposal", "A clear plan with milestones you can hold me to."],
];

const fieldClasses =
  "w-full px-5 py-4 rounded-2xl bg-canvas/60 border border-ink/10 text-ink placeholder:text-ink/40 transition-colors duration-200 hover:border-ink/20 focus:border-accent focus:bg-canvas focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/40";

const labelClasses =
  "block mb-2 text-[11px] uppercase tracking-[0.3em] font-bold font-tech text-ink/75";

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const pickTopic = (topic: string) => {
    setFormData((prev) => ({ ...prev, subject: topic }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );
      setSubmitStatus("success");
      setFormData(EMPTY_FORM);
      launchPlane();
    } catch (error) {
      console.error("Failed to send message:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-form-title"
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-6 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Details column */}
        <motion.aside
          variants={itemVariants}
          aria-labelledby="contact-details-title"
          className="surface-card relative overflow-hidden rounded-[32px] p-6 md:p-10 flex flex-col justify-between gap-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-[90px]"
          />

          <div className="relative">
            <h2
              id="contact-details-title"
              className="text-[11px] uppercase tracking-[0.5em] font-black font-tech text-accent mb-8"
            >
              Direct lines
            </h2>

            <ul className="space-y-3">
              {contactDetails.map(({ label, value, href, icon: Icon, external }) => {
                const inner = (
                  <>
                    <span
                      aria-hidden="true"
                      className="grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-ink/5 border border-ink/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-canvas"
                    >
                      <Icon size={20} />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-bold font-tech text-ink/60">
                        {label}
                      </span>
                      <span className="text-base md:text-lg font-semibold text-ink truncate">
                        {value}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li key={label} className="flex items-center gap-2">
                    {href ? (
                      <a
                        href={href}
                        {...(external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": `${label}: ${value} (opens in a new tab)`,
                            }
                          : { "aria-label": `${label}: ${value}` })}
                        className="group flex min-w-0 flex-1 items-center gap-4 rounded-2xl p-2 -m-2 transition-colors hover:bg-ink/[0.04]"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-4 p-2 -m-2">
                        {inner}
                      </div>
                    )}
                    {label === "Email" && (
                      <button
                        type="button"
                        onClick={copyEmail}
                        aria-label={copied ? "Email address copied" : "Copy email address"}
                        className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/10 px-4 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-ink/70 transition-colors hover:border-accent hover:text-accent"
                      >
                        {copied ? <HiCheck aria-hidden="true" /> : <HiOutlineSquare2Stack aria-hidden="true" />}
                        <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold font-tech text-ink/60 mb-5">
              What happens next
            </h3>
            <ol className="m-0 list-none space-y-4 p-0">
              {STEPS.map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent font-tech text-xs font-bold text-canvas"
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink/70">
                    <span className="font-bold text-ink">{title}.</span> {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold font-tech text-ink/60 mb-4">
              Elsewhere
            </h3>
            <ul className="flex gap-3" aria-label="Social profiles">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="grid place-items-center w-12 h-12 rounded-full border border-ink/10 bg-ink/5 text-ink/80 transition-colors duration-300 hover:bg-ink hover:text-canvas"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink/60">
              Typical reply time: within 24 hours.
            </p>
          </div>
        </motion.aside>

        {/* Form column */}
        <motion.div
          variants={itemVariants}
          className="surface-card relative overflow-hidden rounded-[32px] p-6 md:p-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
          <h2
            id="contact-form-title"
            className="text-2xl md:text-3xl font-black tracking-tight mb-2"
          >
            Send a message
          </h2>
          <p className="text-ink/65 mb-8">
            All fields are required. Pick a topic to fill in the subject.
          </p>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            aria-describedby="contact-status"
            aria-busy={isSubmitting}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="from_name" className={labelClasses}>
                  Your name
                </label>
                <input
                  id="from_name"
                  type="text"
                  name="from_name"
                  autoComplete="name"
                  value={formData.from_name}
                  onChange={handleChange}
                  required
                  className={fieldClasses}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="reply_to" className={labelClasses}>
                  Email address
                </label>
                <input
                  id="reply_to"
                  type="email"
                  name="reply_to"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.reply_to}
                  onChange={handleChange}
                  required
                  className={fieldClasses}
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            <fieldset className="m-0 mb-3 border-0 p-0">
              <legend className={labelClasses}>What&apos;s it about?</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const on = formData.subject === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickTopic(topic)}
                      className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
                        on
                          ? "border-accent bg-accent text-canvas"
                          : "border-ink/15 text-ink/75 hover:border-accent/60 hover:text-ink"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="subject" className={labelClasses}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={fieldClasses}
                placeholder="Project inquiry"
              />
            </div>

            <div>
              <label htmlFor="message" className={labelClasses}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                className={`${fieldClasses} resize-y min-h-[160px]`}
                placeholder="Tell me about the product, timeline and what success looks like."
              />
            </div>

            <div
              id="contact-status"
              role="status"
              aria-live="polite"
              className="min-h-0"
            >
              {submitStatus === "success" && (
                <p className="rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-accent-soft">
                  Message sent — thank you. I'll get back to you shortly.
                </p>
              )}
              {submitStatus === "error" && (
                <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-red-700 dark:text-red-200">
                  Something went wrong and your message wasn't sent. Please try
                  again, or email{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="underline underline-offset-4 hover:text-ink"
                  >
                    {EMAIL}
                  </a>{" "}
                  directly.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 min-h-14 px-10 rounded-full bg-ink text-canvas font-black uppercase tracking-widest text-sm font-tech transition-colors duration-300 hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending…" : "Send message"}
              <HiArrowRight
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
