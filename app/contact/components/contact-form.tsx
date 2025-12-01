"use client";

import React, { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { InfoCard } from "./info-card";
import { ContactFormData, ContactSchema } from "./schema/contact.schema";
import InputField from "@/components/formfield/input-field";
import TextareaField from "@/components/formfield/textarea-field";

export const ContactForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // store name after successful submit to avoid watching it and causing re-renders
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const a = 1;

  // memoize static info cards so they don't re-render
  const infoCards = useMemo(
    () => [
      { icon: <Mail className="w-6 h-6 text-indigo-400" />, title: "Email", value: "" },
      {
        icon: <MapPin className="w-6 h-6 text-purple-400" />,
        title: "Location",
        value: "Tan Binh District, Ho Chi Minh city",
      },
      {
        icon: <Phone className="w-6 h-6 text-blue-400" />,
        title: "Phone",
        value: "+1 (555) 000-0000",
      },
    ],
    [],
  );

  const onSubmit = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to send");

      setSubmittedName(data.name); // store submitted name to show after success
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    reset();
    setIsSuccess(false);
    setErrorMessage(null);
    setSubmittedName(null);
  }, [reset]);

  if (isSuccess) {
    // keep small success panel component to avoid re-rendering parent form when not necessary
    const SuccessPanel = React.memo(function SuccessPanel({
      name,
      onReset,
    }: {
      name: string | null;
      onReset: () => void;
    }) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[500px]"
        >
          <CheckCircle2 className="w-20 h-20 text-green-400 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-400 mb-8">
            Thanks for reaching out, {name?.split(" ")[0] ?? "Friend"}.
          </p>
          <button
            onClick={onReset}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Send another message
          </button>
        </motion.div>
      );
    });

    return <SuccessPanel name={submittedName} onReset={resetForm} />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
      <motion.div
        className="flex-1 space-y-8"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="space-y-4">
          <motion.h1 className="text-5xl md:text-6xl font-bold text-white">
            Let&apos;s create something <span className="text-indigo-400">extraordinary.</span>
          </motion.h1>
          <p className="text-lg text-gray-400 max-w-lg">Have a project in mind? Drop me a line.</p>
        </div>

        <div className="grid gap-6">
          {infoCards.map((card) => (
            <InfoCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              value={card.value}
              delay={0}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="flex-1 w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden group"
        >
          <div className="space-y-6 relative z-10">
            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="name"
                control={control}
                label="Name"
                placeholder="Huy Nguyen"
                error={errors.name}
              />
              <InputField
                name="email"
                control={control}
                label="Email"
                placeholder="john@example.com"
                type="email"
                error={errors.email}
              />
            </div>

            {/* Subject */}
            <InputField
              name="subject"
              control={control}
              label="Subject"
              placeholder="Project Inquiry"
            />

            {/* Message */}
            <TextareaField
              name="message"
              control={control}
              placeholder="Tell me about your project..."
            />

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-indigo-500 rounded-xl text-white font-semibold flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {errorMessage && <p className="text-sm text-red-400 mt-3">{errorMessage}</p>}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
