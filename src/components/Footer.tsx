"use client";

import { Link } from 'wouter';
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useGetProjects } from "@/lib/api";

export default function Footer() {
  const { data: settings } = useSettings();
  const { data: projects } = useGetProjects();

  const contact = settings?.contact_info;
  const social = settings?.social_links;
  const footerTagline = settings?.footer_tagline;

  // No hardcoded fallbacks - data must come from settings
  const address = contact?.address ?? "";
  const phone1 = contact?.phone1 ?? "";
  const phone2 = contact?.phone2 ?? "";
  const email = contact?.email ?? "";
  const hoursWeekday = contact?.hours_weekday ?? "";
  const hoursWeekend = contact?.hours_weekend ?? "";
  const facebook = social?.facebook ?? "";
  const instagram = social?.instagram ?? "";
  const tagline = footerTagline?.text ?? "";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="h-12 w-12 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg mb-4">
              RD
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{tagline}</p>
            <div className="flex gap-3 mt-4">
              <a href={facebook} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Facebook size={14} />
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Instagram size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/projects", label: "Our Projects" },
                { href: "/plots", label: "Available Plots" },
                { href: "/about", label: "About Us" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-red-400 transition-colors no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects - Dynamic */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Projects</h3>
            <ul className="space-y-2 text-sm">
              {(projects ?? []).slice(0, 4).map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`} className="hover:text-red-400 transition-colors no-underline">
                    {project.name}
                  </Link>
                </li>
              ))}
              {(projects ?? []).length === 0 && (
                <>
                  {["Punjnad Housing Society", "Punjnad Garden", "Ravi Garden", "Punjnad Commercial Center"].map((name) => (
                    <li key={name}>
                      <Link href="/projects" className="hover:text-red-400 transition-colors">{name}</Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
            <h3 className="text-white font-semibold mt-6 mb-3">Plot Types</h3>
            <ul className="space-y-1 text-sm">
              <li>Residential: 3–20 Marla</li>
              <li>Commercial: 3 Marla</li>
              <li>Farmhouse: 4–8 Kanal</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <a href={`tel:${phone1.replace(/\s/g, "")}`} className="hover:text-red-400 block">{phone1}</a>
                  {phone2 && <a href={`tel:${phone2.replace(/\s/g, "")}`} className="hover:text-red-400 block">{phone2}</a>}
                </div>
              </li>
              <li className="flex gap-2.5">
                <Mail size={14} className="text-red-500 mt-0.5 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-red-400">{email}</a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
              <p className="font-medium text-gray-200 mb-1">Office Hours</p>
              <p>{hoursWeekday}</p>
              <p>{hoursWeekend}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Ravi Developers. All rights reserved.</p>
          <p>TMA Approved Housing Societies | Rahim Yar Khan, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
