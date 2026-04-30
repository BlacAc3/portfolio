import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import emailjs from "@emailjs/browser";

type SubmitStatus = "success" | "error" | null;

const ContactSection = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    from_name: "",
    reply_to: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus("success");
      setFormData({
        from_name: "",
        reply_to: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      console.error("EmailJS Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const formItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const socialLinks = [
    { icon: <FaGithub />, url: "https://github.com/blacac3" },
    { icon: <FaLinkedin />, url: "https://linkedin.com/in/aaron-ezeala" },
    { icon: <FaTwitter />, url: "https://twitter.com/blacac3_dev" },
  ];

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col lg:flex-row gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="lg:w-1/2" variants={itemVariants}>
            <motion.h3
              className="text-2xl font-semibold mb-6 text-chocolate-accent"
              variants={itemVariants}
            >
              Contact Information
            </motion.h3>

            <motion.div className="space-y-6">
              <motion.div
                className="flex items-start"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 pt-1">
                  <MdEmail className="text-chocolate-accent text-xl" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-white">
                    Email
                  </h4>
                  <a
                    href="mailto:anomyace@gmail.com"
                    className="text-white/60 hover:text-chocolate-accent transition"
                  >
                    anomyace@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 pt-1">
                  <FaWhatsapp className="text-chocolate-accent text-xl" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-white">
                    WhatsApp
                  </h4>
                  <a
                    href="https://wa.me/2348059128741"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-chocolate-accent transition"
                  >
                    +234 (805) 912-8741
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 pt-1">
                  <MdLocationOn className="text-chocolate-accent text-xl" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-white">
                    Location
                  </h4>
                  <p className="text-white/60">Lagos, Nigeria</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="mt-10" variants={itemVariants}>
              <h4 className="text-xl font-semibold mb-4 text-white">
                Follow Me
              </h4>
              <div className="flex space-x-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    className="social-icon text-2xl text-white/60 hover:text-chocolate-accent"
                    whileHover={{ scale: 1.2, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="lg:w-1/2" variants={itemVariants}>
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {submitStatus === "success" && (
                <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg mb-4">
                  Your message has been sent successfully, sir.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg mb-4">
                  There was an error sending your message. Please try again.
                </div>
              )}

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="from_name"
                  className="block text-sm font-medium text-white/60 mb-1"
                >
                  Your Name
                </label>
                <motion.input
                  type="text"
                  id="from_name"
                  name="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-chocolate-accent outline-none bg-white/5 text-white border border-white/10"
                  placeholder="John Doe"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="reply_to"
                  className="block text-sm font-medium text-white/60 mb-1"
                >
                  Email Address
                </label>
                <motion.input
                  type="email"
                  id="reply_to"
                  name="reply_to"
                  value={formData.reply_to}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-chocolate-accent outline-none bg-white/5 text-white border border-white/10"
                  placeholder="john@example.com"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-white/60 mb-1"
                >
                  Subject
                </label>
                <motion.input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-chocolate-accent outline-none bg-white/5 text-white border border-white/10"
                  placeholder="Project Inquiry"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white/60 mb-1"
                >
                  Your Message
                </label>
                <motion.textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-chocolate-accent outline-none bg-white/5 text-white border border-white/10"
                  placeholder="Hello, I'd like to talk about..."
                  whileFocus={{ scale: 1.01 }}
                  required
                ></motion.textarea>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] transition shadow-lg disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
