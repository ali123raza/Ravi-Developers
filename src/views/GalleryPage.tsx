"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MetaTags from "@/components/MetaTags";
import { useGetProjects } from "@/lib/api";
import { useSections } from "@/hooks/useSections";
export default function GalleryPage() {
  const { data: projects } = useGetProjects();
  const sec = useSections("gallery");
  const [activeProject, setActiveProject] = useState("all");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const allImages: { src: string; project: string; projectId: string }[] = (projects ?? []).flatMap((p: { id: string; name: string; images?: string[] }) =>
    (p.images ?? []).map((img: string) => ({ src: img, project: p.name, projectId: p.id }))
  );

  const filtered = activeProject === "all"
    ? allImages
    : allImages.filter((img) => img.projectId === activeProject);

  return (
    <div className="min-h-screen flex flex-col">
      <MetaTags page="gallery" />
      <Navbar />

      {sec.isActive("hero") && (
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">{sec.getTitle("hero") || "Photo Gallery"}</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            {sec.getSubtitle("hero") || "Explore our housing society developments, infrastructure, and project progress."}
          </p>
        </div>
      </section>
      )}

      {/* Filter Tabs */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveProject("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeProject === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              All Projects
            </button>
            {(projects ?? []).map((p: { id: string; name: string }) => (
              <button
                key={p.id}
                onClick={() => setActiveProject(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeProject === p.id ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No images available</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => setLightboxImg(img.src)}
                >
                  <img src={img.src} alt={img.project} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-xs font-medium">{img.project}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setLightboxImg(null)}
          >
            <X size={28} />
          </button>
          <img
            src={lightboxImg}
            alt="Gallery"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

