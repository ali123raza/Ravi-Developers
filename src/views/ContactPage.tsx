"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { useCreateInquiry } from "@/lib/api";
import { DEFAULT_MAPS_EMBED_URL } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();
  const { data: settings } = useSettings();
  const contact = settings?.contact_info;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    createInquiry.mutate(
      { data: { ...data, projectId: null, plotId: null } },
      {
        onSuccess: () => {
          toast({ title: "Message Sent", description: "We will contact you within 2 hours." });
          reset();
        },
        onError: () => toast({ title: "Error", description: "Failed to send message.", variant: "destructive" }),
      }
    );
  };

  // No hardcoded fallbacks - data must come from settings
  const whatsappNum = contact?.whatsapp ?? "";
  const phone1 = contact?.phone1 ?? "";
  const phone2 = contact?.phone2 ?? "";
  const email = contact?.email ?? "";
  const address = contact?.address ?? "";
  const hoursWeekday = contact?.hours_weekday ?? "";
  const hoursWeekend = contact?.hours_weekend ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Our team is ready to assist you. Reach out for property inquiries, site visits, or general information.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Get in Touch</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Booking Office</div>
                      <div className="text-sm text-gray-700">{address}</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Phone Numbers</div>
                      <a href={`tel:${phone1.replace(/\s/g, "")}`} className="block text-sm text-gray-700 hover:text-red-600">{phone1}</a>
                      {phone2 && <a href={`tel:${phone2.replace(/\s/g, "")}`} className="block text-sm text-gray-700 hover:text-red-600">{phone2}</a>}
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Email</div>
                      <a href={`mailto:${email}`} className="text-sm text-gray-700 hover:text-red-600">{email}</a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Office Hours</div>
                      <div className="text-sm text-gray-700">{hoursWeekday}</div>
                      <div className="text-sm text-gray-700">{hoursWeekend}</div>
                    </div>
                  </li>
                </ul>
                <a
                  href={`https://wa.me/${whatsappNum}?text=Hello%20Ravi%20Developers%2C%20I%20have%20an%20inquiry.`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-5 block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2.5 rounded font-semibold text-sm transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-5 text-lg">Send Us a Message</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input {...register("name")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Muhammad Ali" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input {...register("phone")} type="tel" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+92 300-0000000" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input {...register("email")} type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                    <textarea {...register("message")} rows={5} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="I am interested in a 5 Marla residential plot..." />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button
                    type="submit" disabled={createInquiry.isPending}
                    className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {createInquiry.isPending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              {/* Map */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Our Location</h3>
                  <p className="text-sm text-gray-500">{address}</p>
                </div>
                <div className="aspect-video">
                  <iframe
                    src={DEFAULT_MAPS_EMBED_URL}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

