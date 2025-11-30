"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { ContactFormData, FormState } from "@/types/contact.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InfoCard } from "./info-card";
import { RECIPIENT_EMAIL } from "@/lib/constants/recipient";

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState({ ...formState, isSubmitting: true, error: null });

    // Simulate a brief "processing" state for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Construct the email body
      const subject = encodeURIComponent(formData.subject || "New Contact Request");
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n\n` +
          `Message:\n${formData.message}`,
      );

      // Trigger the mailto action
      window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;

      setFormState({ isSubmitting: false, isSuccess: true, error: null });
    } catch (error) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        error: "Could not open email client.",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setFormState({ isSubmitting: false, isSuccess: false, error: null });
  };

  if (formState.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[500px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Message Sent!</h2>
        <p className="text-gray-400 mb-8">
          Thanks for reaching out, {formData.name.split(" ")[0]}. I'll get back to you soon.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
      {/* Contact Info Section */}
      <motion.div
        className="flex-1 space-y-8"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="space-y-4">
          <motion.h1
            className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Let's create something <span className="text-indigo-400">extraordinary.</span>
          </motion.h1>
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
            Have a project in mind? Looking for a partner in crime for your next big idea? Drop me a
            line and let's talk about the future.
          </p>
        </div>

        <div className="grid gap-6">
          <InfoCard
            icon={<Mail className="w-6 h-6 text-indigo-400" />}
            title="Email"
            value="huuhuy1801@gmail.com"
            delay={0.4}
          />

          <InfoCard
            icon={<MapPin className="w-6 h-6 text-purple-400" />}
            title="Location"
            value="Tan Binh District, Ho Chi Minh city"
            delay={0.5}
          />

          <InfoCard
            icon={<Phone className="w-6 h-6 text-blue-400" />}
            title="Phone"
            value="+1 (555) 000-0000"
            delay={0.6}
          />
        </div>
      </motion.div>

      {/* Form Section */}
      <motion.div
        className="flex-1 w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle glow effect inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="name"
                name="name"
                label="Name"
                placeholder="Huy Nguyen"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <Textarea
              id="message"
              name="message"
              label="Message"
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={handleChange}
              required
              className="min-h-[160px]"
            />

            <div className="relative">
              <Input
                id="subject"
                name="subject"
                label="Subject"
                placeholder="Project Inquiry"
                value={formData.subject}
                onChange={handleChange}
                required
                className="pr-12"
              />
              <motion.button
                type="button"
                disabled={!formData.message || isGeneratingSubject}
                className={`absolute right-2 top-8 p-1.5 rounded-lg transition-colors ${
                  !formData.message
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Generate subject from message with AI"
              >
                {isGeneratingSubject ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            <motion.button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full h-14 bg-gradient-to-r bg-indigo-400 rounded-xl font-semibold text-white shadow-lg flex items-center justify-center gap-2 overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
              {formState.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
