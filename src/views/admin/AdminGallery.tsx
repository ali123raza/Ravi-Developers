"use client";

import { useRef } from "react";
import { Image, Trash2, Upload, Folder, ImageIcon, Calendar, HardDrive } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetGallery, useDeleteGalleryImage, getGetGalleryQueryKey } from "@/lib/api";
import { useUpload } from "@/hooks/useUpload";

interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  category: string;
  size: number;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AdminGallery() {
  const { data: images, isLoading } = useGetGallery();
  const deleteImage = useDeleteGalleryImage();
  const { upload, isUploading } = useUpload();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const result = await upload(file, "gallery");
      if (result?.url) {
        toast({ title: "Uploaded", description: `"${file.name}" uploaded successfully.` });
      } else {
        toast({ title: "Error", description: `Failed to upload "${file.name}".`, variant: "destructive" });
      }
    }

    queryClient.invalidateQueries({ queryKey: getGetGalleryQueryKey() });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string, filename: string) => {
    if (!confirm(`Delete image "${filename}"? This cannot be undone.`)) return;
    deleteImage.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGalleryQueryKey() });
          toast({ title: "Deleted", description: `"${filename}" deleted.` });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete image.", variant: "destructive" }),
      }
    );
  };

  const categories = [...new Set((images ?? []).map((img) => img.category))];
  const totalSize = (images ?? []).reduce((sum, img) => sum + img.size, 0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and organize all uploaded images
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload Images
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ImageIcon size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? "—" : images?.length ?? 0}
                </div>
                <div className="text-sm text-gray-500">Total Images</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <HardDrive size={18} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? "—" : formatFileSize(totalSize)}
                </div>
                <div className="text-sm text-gray-500">Total Size</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Folder size={18} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? "—" : categories.length}
                </div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 py-1">Categories:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Images Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (images ?? []).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No images yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Upload images to manage them here
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-red-600 hover:underline text-sm font-medium"
            >
              Upload your first image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(images ?? []).map((img: GalleryImage) => (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      title="View full image"
                    >
                      <Image size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(img.id, img.filename)}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={img.filename}>
                    {img.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{img.category}</span>
                    <span>{formatFileSize(img.size)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Calendar size={12} />
                    {new Date(img.createdAt).toLocaleDateString("en-PK")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
