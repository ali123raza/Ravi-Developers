"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { useGetInquiries, useUpdateInquiry, getGetInquiriesQueryKey, useConvertInquiryToCustomer } from "@/lib/api";

interface Inquiry {
  id: string;
  name: string;
  status: string;
  phone: string;
  email: string;
  createdAt: string;
  message?: string;
  notes?: string;
  projectId?: string;
  plotId?: string;
}

export default function AdminInquiries() {
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data: inquiries, isLoading } = useGetInquiries();
  const updateInquiry = useUpdateInquiry();
  const convertToCustomer = useConvertInquiryToCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = (inquiries as Inquiry[] ?? [])
    .filter((i) => !filter || i.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (id: string, status: string) => {
    updateInquiry.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetInquiriesQueryKey() }),
    });
  };

  const handleNoteSave = (id: string) => {
    updateInquiry.mutate({ id, data: { notes: notes[id] } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInquiriesQueryKey() });
        toast({ title: "Note saved" });
      },
    });
  };

  const handleConvertToCustomer = (id: string) => {
    if (!confirm("Convert this inquiry to a customer?")) return;
    convertToCustomer.mutate(id, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetInquiriesQueryKey() });
        if (data.existing) {
          toast({ title: "Linked", description: "Inquiry linked to existing customer." });
        } else {
          toast({ title: "Converted", description: "Inquiry converted to customer successfully." });
        }
      },
      onError: () => toast({ title: "Error", description: "Failed to convert inquiry.", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{filtered.length} inquiries</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["", "New", "Contacted", "In Progress", "Closed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No inquiries found</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((inq) => (
                <div key={inq.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{inq.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(inq.status)}`}>{inq.status}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                        <a href={`tel:${inq.phone}`} className="hover:text-red-600">{inq.phone}</a>
                        <a href={`mailto:${inq.email}`} className="hover:text-red-600">{inq.email}</a>
                        <span>{new Date(inq.createdAt).toLocaleDateString("en-PK")}</span>
                      </div>
                      {inq.message && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{inq.message}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <button
                        onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        {expandedId === inq.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {expandedId === inq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {inq.message && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Full Message</div>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{inq.message}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConvertToCustomer(inq.id)}
                          disabled={convertToCustomer.isPending}
                          className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <UserPlus size={12} />
                          {convertToCustomer.isPending ? "Converting..." : "Convert to Customer"}
                        </button>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
                        <textarea
                          rows={2}
                          defaultValue={inq.notes ?? ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [inq.id]: e.target.value }))}
                          placeholder="Add notes about this inquiry..."
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                          onClick={() => handleNoteSave(inq.id)}
                          className="mt-1 text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700"
                        >
                          Save Note
                        </button>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        {inq.projectId && <span>Project ID: {inq.projectId}</span>}
                        {inq.plotId && <span>Plot ID: {inq.plotId}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

