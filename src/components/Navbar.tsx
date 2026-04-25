"use client";

import { useState } from "react";
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { Menu, X, Phone, ChevronDown } from "lucide-react";

import { useSettings } from "@/hooks/useSettings";
import { useGetNavigation, type NavItem } from "@/lib/api";

const fallbackLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/plots", label: "Plots" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [pathname] = useLocation();
  const { data: settings } = useSettings();
  const { data: navItems } = useGetNavigation();
  const logoUrl = settings?.logo_url;
  const contact = settings?.contact_info;

  const links = (navItems && navItems.length > 0 ? navItems : fallbackLinks) as { id?: string; href: string; label: string; isExternal?: boolean; children?: NavItem[] }[];

  const renderLink = (link: { href: string; label: string; isExternal?: boolean; children?: NavItem[] }, mobile = false) => {
    const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
    const baseClass = mobile
      ? `block text-sm font-medium py-2 no-underline ${isActive ? "text-red-600" : "text-gray-700"}`
      : `text-sm font-medium transition-colors hover:text-red-600 no-underline ${isActive ? "text-red-600 border-b-2 border-red-600 pb-1" : "text-gray-700"}`;

    if (link.isExternal) {
      return <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={baseClass}>{link.label}</a>;
    }

    // Has children = dropdown
    if (link.children && link.children.length > 0 && !mobile) {
      return (
        <div key={link.href} className="relative group">
          <Link href={link.href} className={`${baseClass} flex items-center gap-1`}>
            {link.label} <ChevronDown size={12} />
          </Link>
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {link.children.map((child) => (
              <Link key={child.id} href={child.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 no-underline">
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link key={link.href} href={link.href} className={baseClass} onClick={() => mobile && setIsOpen(false)}>
        {link.label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            {logoUrl ? (
              <img src={logoUrl} alt="Ravi Developers" className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="h-10 w-10 bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  RD
                </div>
                <span className="font-bold text-gray-900">Ravi Developers</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => renderLink(link))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:${contact?.phone1 || "+923009659017"}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600"
            >
              <Phone size={14} />
              <span>{contact?.phone1 || "+92 300-9659017"}</span>
            </a>
            <Link
              href="/contact"
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition-colors no-underline"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-red-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {links.map((link) => renderLink(link, true))}
          <div className="pt-2 border-t border-gray-100">
            <a href={`tel:${contact?.phone1 || "+923009659017"}`} className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Phone size={14} />
              <span>{contact?.phone1 || "+92 300-9659017"}</span>
            </a>
            <Link
              href="/contact"
              className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
