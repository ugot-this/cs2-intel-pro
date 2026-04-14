import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Have a question, feature request, or just want to say hello? We&apos;d love to hear
          from you.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
