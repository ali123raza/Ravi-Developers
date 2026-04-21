"use client";

import { Link } from 'wouter';
import { ArrowRight, MapPin, CheckCircle, Star, Phone, TrendingUp, Home, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGetProjects, useGetTestimonials, useGetDashboardStats } from "@/lib/api";
import { formatPKR, getStatusColor, PLACEHOLDER_IMAGE, PLACEHOLDER_HERO_IMAGE } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

export default function HomePage() {
  const { data: projects } = useGetProjects();
  const { data: testimonials } = useGetTestimonials();
  const { data: stats } = useGetDashboardStats();
  const { data: settings } = useSettings();

  const hero = settings?.hero_content;
  const contact = settings?.contact_info;
  const companyStats = settings?.company_stats;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero?.hero_image || PLACEHOLDER_HERO_IMAGE}
            alt="Ravi Developers"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-red-300 text-sm mb-6">
              <CheckCircle size={14} />
              <span>{hero?.badge ?? ""}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {hero?.title ?? ""}
            </h1>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              {hero?.subtitle ?? ""}
            </p>
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-8">
              <MapPin size={14} className="text-red-400" />
              <span>{hero?.location ?? ""}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold items-center gap-2 transition-colors">
                {hero?.cta_primary ?? "View Projects"} <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex border border-white/30 hover:border-white text-white px-6 py-3 rounded font-semibold transition-colors">
                {hero?.cta_secondary ?? "Contact Us"}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
              <span className="bg-green-500 rounded-full w-2 h-2 inline-block"></span>
              {hero?.starting_price ?? ""}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Building2 size={20} className="text-red-600" />, value: stats?.totalProjects ?? (companyStats?.active_projects || 3), label: "Active Projects" },
              { icon: <Home size={20} className="text-red-600" />, value: stats?.availablePlots ?? 0, label: "Available Plots" },
              { icon: <TrendingUp size={20} className="text-red-600" />, value: companyStats?.sqft_developed || "10M+ Sqft", label: "Developed" },
              { icon: <CheckCircle size={20} className="text-red-600" />, value: companyStats?.happy_families || "1000+", label: "Happy Families" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-1">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-2">Our Portfolio</p>
            <h2 className="text-3xl font-bold text-gray-900">Featured Projects</h2>
            <p className="text-gray-500 mt-2">TMA Approved housing societies in prime locations of Rahim Yar Khan</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projects ?? []).slice(0, 3).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={project.images?.[0] ?? PLACEHOLDER_IMAGE}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors">{project.name}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <MapPin size={12} />
                    <span>{project.location}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{project.description}</p>
                  {project.startingPrice && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">Starting from</span>
                        <div className="text-red-600 font-bold">{formatPKR(project.startingPrice)} / Marla</div>
                      </div>
                      <span className="text-red-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View <ArrowRight size={14} />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/projects" className="inline-flex items-center gap-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded font-semibold transition-colors no-underline">
              View All Projects <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Rahim Yar Khan's Most Trusted Developer</h2>
              <p className="text-gray-600 mb-6">Ravi Developers has been committed to excellence in Rahim Yar Khan. We have delivered over 10 million square feet of development to thousands of satisfied customers.</p>
              <ul className="space-y-4">
                {[
                  { title: "TMA Approved", desc: "All our projects are fully approved by Tehsil Municipal Administration." },
                  { title: "4-Year Easy Installments", desc: "Flexible payment plans starting with just 25% down payment." },
                  { title: "Prime Locations", desc: "Strategic locations on Shahbaz Pur Road with easy accessibility." },
                  { title: "Transparent Dealings", desc: "No hidden charges. Clear documentation and legal paperwork." },
                  { title: "Modern Infrastructure", desc: "Wide roads, underground utilities, parks, and community facilities." },
                  { title: "Proven Track Record", desc: "Thousands of happy plot owners across all our housing societies." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{item.title}: </span>
                      <span className="text-gray-600 text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src={PLACEHOLDER_IMAGE}
                alt="Ravi Developers project"
                className="rounded-xl shadow-xl w-full"
              />
              <div className="absolute -bottom-4 -left-4 bg-red-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">{companyStats?.active_projects || 4}</div>
                <div className="text-sm">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Secure Your Plot Today — Limited Availability
          </h2>
          <p className="text-gray-300 mb-6">{hero?.starting_price || "Plots starting from PKR 3.75 Lac per Marla. 4-Year easy installment plan available."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/plots" className="inline-flex bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-semibold transition-colors no-underline">
              Browse Available Plots
            </Link>
            <a href={`tel:${contact?.phone1 || "+923009659017"}`} className="flex items-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3 rounded font-semibold transition-colors">
              <Phone size={16} />
              Call: {contact?.phone1 || "+92 300-9659017"}
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {(testimonials ?? []).length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-red-600 text-sm font-semibold uppercase tracking-wider mb-2">Customer Reviews</p>
              <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(testimonials ?? []).slice(0, 3).map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.testimonial}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                      {t.customerName.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{t.customerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

