import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaMedium,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const ContactSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://n8n-service-sfwl.onrender.com/webhook/7686876b-52a8-42fb-9a1d-dcd9cdcd5d66",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Form submission error:", error);
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
    // { icon: <FaInstagram />, url: "#" },
    // { icon: <FaMedium />, url: "#" },
  ];

  return (
    <section
      id="contact"
      className="py-20 px-4 sm:px-6 lg:px-8 section-gradient"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-chocolate-light-accent">Get In</span>
          <span className="text-chocolate-accent"> Touch</span>
        </motion.h2>

        <motion.div
          ref={ref}
          className="flex flex-col lg:flex-row gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.div className="lg:w-1/2" variants={itemVariants}>
            <motion.h3
              className="text-2xl font-semibold mb-6 text-chocolate-accent"
              variants={itemVariants}
            >
              Contact Information
            </motion.h3>

            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div
                className="flex items-start"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex-shrink-0 pt-1">
                  <MdEmail className="text-chocolate-accent text-xl" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-chocolate-light-accent">
                    Email
                  </h4>
                  <a
                    href="mailto:anomyace@gmail.com"
                    className="text-chocolate-light-accent hover:text-chocolate-accent transition"
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
                  <MdPhone className="text-chocolate-accent text-xl" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-chocolate-light-accent">
                    Phone
                  </h4>
                  <a
                    href="tel:+2348059128741"
                    className="text-chocolate-light-accent hover:text-chocolate-accent transition"
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
                  <h4 className="text-lg font-medium text-chocolate-light-accent">
                    Location
                  </h4>
                  <p className="text-chocolate-light-accent">Lagos, Nigeria</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="mt-10" variants={itemVariants}>
              <h4 className="text-xl font-semibold mb-4 text-chocolate-light-accent">
                Follow Me
              </h4>
              <div className="flex space-x-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    className="social-icon text-2xl text-chocolate-light-accent hover:text-chocolate-accent"
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
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={containerVariants}
            >
              {submitStatus === "success" && (
                <div className="p-4 bg-green-100 text-green-800 rounded-lg mb-4">
                  Your message has been sent successfully!
                </div>
              )}

              {submitStatus === "error" && (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
                  There was an error sending your message. Please try again.
                </div>
              )}

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-chocolate-light-accent mb-1"
                >
                  Your Name
                </label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 form-input rounded-lg focus:ring-2 focus:ring-chocolate-accent focus:border-transparent bg-chocolate-dark bg-opacity-80 text-chocolate-light-accent border border-chocolate-light placeholder-chocolate-light"
                  placeholder="John Doe"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-chocolate-light-accent mb-1"
                >
                  Email Address
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 form-input rounded-lg focus:ring-2 focus:ring-chocolate-accent focus:border-transparent bg-chocolate-dark bg-opacity-80 text-chocolate-light-accent border border-chocolate-light placeholder-chocolate-light"
                  placeholder="john@example.com"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-chocolate-light-accent mb-1"
                >
                  Subject
                </label>
                <motion.input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 form-input rounded-lg focus:ring-2 focus:ring-chocolate-accent focus:border-transparent bg-chocolate-dark bg-opacity-80 text-chocolate-light-accent border border-chocolate-light placeholder-chocolate-light"
                  placeholder="Project Inquiry"
                  whileFocus={{ scale: 1.01 }}
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-chocolate-light-accent mb-1"
                >
                  Your Message
                </label>
                <motion.textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 form-input rounded-lg focus:ring-2 focus:ring-chocolate-accent focus:border-transparent bg-chocolate-dark bg-opacity-80 text-chocolate-light-accent border border-chocolate-light placeholder-chocolate-light"
                  placeholder="Hello, I'd like to talk about..."
                  whileFocus={{ scale: 1.01 }}
                  required
                ></motion.textarea>
              </motion.div>

              <motion.div variants={formItemVariants}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-chocolate-accent text-chocolate-dark font-medium rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-chocolate-accent/20 disabled:opacity-70"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
