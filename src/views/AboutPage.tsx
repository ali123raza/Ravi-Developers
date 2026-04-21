"use client";

import { CheckCircle, TrendingUp, Users, Award, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from 'wouter';
import { useSettings } from "@/hooks/useSettings";
import { PLACEHOLDER_IMAGE, PLACEHOLDER_HERO_IMAGE } from "@/lib/utils";
import { useGetDashboardStats } from "@/lib/api";
export default function AboutPage() {
  const { data: settings } = useSettings();
  const { data: stats } = useGetDashboardStats();
  const statsData = stats;

  const hero = settings?.hero_content;
  const about = settings?.about_content;
  const companyStats = settings?.company_stats;
  
  // Get about images from settings
  const aboutImages = (about as any)?.about_images || [];
  const firstAboutImage = aboutImages[0] || PLACEHOLDER_IMAGE;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={hero?.hero_image || PLACEHOLDER_HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">About Ravi Developers</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Building trust, communities, and dreams in Rahim Yar Khan.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-red-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: stats?.totalProjects?.toString() ?? companyStats?.active_projects ?? "", label: "Active Projects" },
              { value: companyStats?.sqft_developed ?? "", label: "Sqft Developed" },
              { value: companyStats?.happy_families ?? "", label: "Happy Families" },
              { value: companyStats?.approval ?? "", label: "Approved Societies" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-red-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-2">Our Story</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">A Legacy of Trust in Rahim Yar Khan</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{about?.story ?? ""}</p>
                <p>{about?.story2 ?? ""}</p>
                <p>{about?.story3 ?? ""}</p>
              </div>
            </div>
            <div className="relative">
              <img
                src={firstAboutImage}
                alt="Ravi Developers project"
                className="rounded-xl shadow-xl w-full"
              />
              <div className="absolute -bottom-5 -right-5 bg-gray-900 text-white p-5 rounded-xl shadow-xl">
                <div className="text-4xl font-bold text-red-500">{stats?.totalProjects || companyStats?.active_projects || 4}</div>
                <div className="text-sm text-gray-300">Housing Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={22} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {about?.mission || "To provide premium, affordable, and TMA-approved residential and commercial plots in Rahim Yar Khan, enabling families and investors to secure their future with confidence."}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                <Award size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                {about?.vision || "To be the leading real estate developer in South Punjab, creating sustainable, well-planned communities where families thrive and investments grow."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">What Sets Us Apart</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle size={20} className="text-red-600" />, title: "TMA Approved Projects", desc: "Full legal compliance with Tehsil Municipal Administration. No worries about legality." },
              { icon: <Building size={20} className="text-red-600" />, title: "Residential Plots", desc: "3, 4, 5, 6, 10, 20 Marla residential plots designed for modern family living." },
              { icon: <Building size={20} className="text-red-600" />, title: "Commercial Plots", desc: "Plots in prime locations for business and investment opportunities." },
              { icon: <Building size={20} className="text-red-600" />, title: "Farmhouse Plots", desc: "4 Kanal and 8 Kanal farmhouse plots for luxurious countryside living." },
              { icon: <TrendingUp size={20} className="text-red-600" />, title: "4-Year Installment Plan", desc: "Easy payment plans with minimal down payment. Own your plot without financial strain." },
              { icon: <Users size={20} className="text-red-600" />, title: "After-Sale Support", desc: "Our team stays with you even after your purchase. We are a relationship-driven business." },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-xl hover:border-red-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Invest in Your Future?</h2>
          <p className="text-gray-300 mb-6">Browse our available plots and find the perfect property for your needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/plots" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-semibold transition-colors">
              Browse Plots
            </Link>
            <Link href="/contact" className="border border-white/30 hover:border-white text-white px-8 py-3 rounded font-semibold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

