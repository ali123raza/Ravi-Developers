"use client";

import { useState } from "react";

import { Link } from 'wouter';
import { useLocation } from 'wouter';
import {
  LayoutDashboard, Building2, Home, MessageSquare, Star, Menu, X, LogOut, ChevronRight, Settings, FileText, Palette, Navigation, Search, Users, Image, Folder, Activity, CreditCard, UserCircle, BarChart3, Megaphone, Shield, Bell
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useAdminAuth } from "@/contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/admin/projects", label: "Projects", icon: <Building2 size={16} /> },
  { href: "/admin/plots", label: "Plots", icon: <Home size={16} /> },
  { href: "/admin/inquiries", label: "Inquiries", icon: <MessageSquare size={16} /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CreditCard size={16} /> },
  { href: "/admin/customers", label: "Customers", icon: <UserCircle size={16} /> },
  { href: "/admin/testimonials", label: "Testimonials", icon: <Star size={16} /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 size={16} /> },
  { href: "/admin/marketing", label: "Marketing", icon: <Megaphone size={16} /> },
  { href: "/admin/cms", label: "CMS Pages", icon: <FileText size={16} /> },
  { href: "/admin/theme", label: "Theme", icon: <Palette size={16} /> },
  { href: "/admin/navigation", label: "Navigation", icon: <Navigation size={16} /> },
  { href: "/admin/seo", label: "SEO", icon: <Search size={16} /> },
  { href: "/admin/gallery", label: "Gallery", icon: <Image size={16} /> },
  { href: "/admin/files", label: "Files", icon: <Folder size={16} /> },
  { href: "/admin/logs", label: "Activity Logs", icon: <Activity size={16} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
  { href: "/admin/system", label: "System", icon: <Shield size={16} /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell size={16} /> },
  { href: "/admin/settings", label: "Site Settings", icon: <Settings size={16} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pathname] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const { data: settings } = useSettings();
  const logoUrl = settings?.logo_url ?? "/assets/Ravi_Developers_Logo_1775654147275.png";

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-950 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <img src={logoUrl} alt="Ravi Developers" className="h-8 w-auto brightness-0 invert" />
          <div>
            <div className="text-white text-xs font-bold">Ravi Developers</div>
            <div className="text-gray-400 text-xs">Admin Panel</div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">{user.name}</div>
                <div className="text-gray-500 text-xs truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Home size={14} />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="text-sm text-gray-500">
              {navItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))?.label ?? "Admin Panel"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
