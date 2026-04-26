"use client";

import { useState } from "react";
import { Folder, File, Trash2, HardDrive, Search, FileText, Image as ImageIcon, FileCode } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon size={20} className="text-purple-500" />;
  if (type.includes("javascript") || type.includes("json")) return <FileCode size={20} className="text-yellow-500" />;
  if (type.includes("text")) return <FileText size={20} className="text-blue-500" />;
  return <File size={20} className="text-gray-500" />;
}

// Mock data for now - would be fetched from API
const mockFiles: FileItem[] = [
];

export default function AdminFiles() {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete file "${name}"?`)) return;
    setFiles(files.filter((f) => f.id !== id));
    toast({ title: "Deleted", description: `"${name}" was deleted.` });
  };

  const handleView = (file: FileItem) => {
    setSelectedFile(file);
    setIsViewOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all uploaded files and documents
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Folder size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{files.length}</div>
                <div className="text-sm text-gray-500">Total Files</div>
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
                  {formatFileSize(totalSize)}
                </div>
                <div className="text-sm text-gray-500">Total Size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">File</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Size</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <Folder size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">No files found. Upload files to see them here.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{file.type}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFileSize(file.size)}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(file.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(file)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Search size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogTitle className="sr-only">File Details</DialogTitle>
            <DialogDescription className="sr-only">View file details</DialogDescription>
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="text-gray-900">{selectedFile.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <p className="text-gray-900">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="text-gray-900">
                      {new Date(selectedFile.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>
                </div>
                {selectedFile.type.startsWith("image/") && (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="max-w-full max-h-64 object-contain rounded-lg border"
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
