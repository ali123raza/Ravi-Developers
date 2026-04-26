"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Send, Mail, MessageSquare, Tag, Clock, Users, Eye, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetEmailCampaigns, useCreateEmailCampaign, useSendEmailCampaign, useDeleteEmailCampaign } from "@/lib/api";
import { useGetSMSCampaigns, useCreateSMSCampaign, useSendSMSCampaign, useDeleteSMSCampaign } from "@/lib/api";
import { useGetPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientType: string;
  recipientCount: number;
  sentCount: number;
  status: string;
  sentAt?: string;
  createdAt: string;
}

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  recipientType: string;
  recipientCount: number;
  sentCount: number;
  status: string;
  sentAt?: string;
}

interface Promotion {
  id: string;
  title: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  usedCount: number;
}

const recipientTypeLabels: Record<string, string> = {
  all: "All Contacts",
  customers: "Customers Only",
  inquiries: "Inquiries Only",
};

export default function AdminMarketing() {
  const [activeTab, setActiveTab] = useState<"email" | "sms" | "promotions">("email");
  
  // Email hooks
  const { data: emailCampaigns, isLoading: emailLoading } = useGetEmailCampaigns();
  const createEmailCampaign = useCreateEmailCampaign();
  const sendEmailCampaign = useSendEmailCampaign();
  const deleteEmailCampaign = useDeleteEmailCampaign();
  
  // SMS hooks
  const { data: smsCampaigns, isLoading: smsLoading } = useGetSMSCampaigns();
  const createSMSCampaign = useCreateSMSCampaign();
  const sendSMSCampaign = useSendSMSCampaign();
  const deleteSMSCampaign = useDeleteSMSCampaign();
  
  // Promotions hooks
  const { data: promotions, isLoading: promoLoading } = useGetPromotions();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  
  const [emailForm, setEmailForm] = useState({
    name: "",
    subject: "",
    content: "",
    recipientType: "all",
  });
  
  const [smsForm, setSMSForm] = useState({
    name: "",
    message: "",
    recipientType: "all",
  });
  
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minBookingAmount: "",
    validFrom: "",
    validUntil: "",
    maxUses: "",
  });

  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    createEmailCampaign.mutate(emailForm, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
        toast({ title: "Created", description: "Email campaign created successfully." });
        setIsEmailModalOpen(false);
        setEmailForm({ name: "", subject: "", content: "", recipientType: "all" });
      },
    });
  };

  const handleSendEmail = (id: string) => {
    if (!confirm("Send this email campaign to all recipients?")) return;
    sendEmailCampaign.mutate({ id }, {
      onSuccess: (data) => {
        toast({ title: "Sent", description: `Email sent to ${data.sentCount} recipients.` });
      },
    });
  };

  const handleDeleteEmail = (id: string) => {
    if (!confirm("Delete this email campaign?")) return;
    deleteEmailCampaign.mutate({ id }, {
      onSuccess: () => toast({ title: "Deleted", description: "Email campaign deleted." }),
    });
  };

  const handleCreateSMS = (e: React.FormEvent) => {
    e.preventDefault();
    createSMSCampaign.mutate(smsForm, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["smsCampaigns"] });
        toast({ title: "Created", description: "SMS campaign created successfully." });
        setIsSMSModalOpen(false);
        setSMSForm({ name: "", message: "", recipientType: "all" });
      },
    });
  };

  const handleSendSMS = (id: string) => {
    if (!confirm("Send this SMS to all recipients?")) return;
    sendSMSCampaign.mutate({ id }, {
      onSuccess: (data) => {
        toast({ title: "Sent", description: `SMS sent to ${data.sentCount} recipients.` });
      },
    });
  };

  const handleDeleteSMS = (id: string) => {
    if (!confirm("Delete this SMS campaign?")) return;
    deleteSMSCampaign.mutate({ id }, {
      onSuccess: () => toast({ title: "Deleted", description: "SMS campaign deleted." }),
    });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    createPromotion.mutate({
      ...promoForm,
      discountValue: parseFloat(promoForm.discountValue),
      minBookingAmount: parseFloat(promoForm.minBookingAmount) || 0,
      maxUses: parseInt(promoForm.maxUses) || null,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["promotions"] });
        toast({ title: "Created", description: "Promotion created successfully." });
        setIsPromoModalOpen(false);
        setPromoForm({
          title: "", description: "", code: "", discountType: "percentage",
          discountValue: "", minBookingAmount: "", validFrom: "", validUntil: "", maxUses: "",
        });
      },
    });
  };

  const togglePromoStatus = (promo: Promotion) => {
    updatePromotion.mutate(
      { id: promo.id, data: { isActive: !promo.isActive } },
      {
        onSuccess: () => {
          toast({
            title: promo.isActive ? "Deactivated" : "Activated",
            description: `Promotion ${promo.isActive ? "deactivated" : "activated"}.`,
          });
        },
      }
    );
  };

  const handleDeletePromo = (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    deletePromotion.mutate({ id }, {
      onSuccess: () => toast({ title: "Deleted", description: "Promotion deleted." }),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
            <p className="text-gray-500 text-sm mt-1">Email campaigns, SMS & promotions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "email", label: "Email Campaigns", icon: Mail },
            { key: "sms", label: "SMS", icon: MessageSquare },
            { key: "promotions", label: "Promotions", icon: Tag },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === key ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Email Campaigns Tab */}
        {activeTab === "email" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                <Plus size={14} /> New Campaign
              </button>
            </div>

            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogTitle className="sr-only">New Email Campaign</DialogTitle>
                <form onSubmit={handleCreateEmail} className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail size={18} className="text-red-600" /> New Email Campaign
                  </h3>
                  <input
                    placeholder="Campaign Name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Subject Line"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Email Content"
                    value={emailForm.content}
                    onChange={(e) => setEmailForm((p) => ({ ...p, content: e.target.value }))}
                    required
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <select
                    value={emailForm.recipientType}
                    onChange={(e) => setEmailForm((p) => ({ ...p, recipientType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Contacts</option>
                    <option value="customers">Customers Only</option>
                    <option value="inquiries">Inquiries Only</option>
                  </select>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={createEmailCampaign.isPending}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {createEmailCampaign.isPending ? "Creating..." : "Create Campaign"}
                    </button>
                    <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                    <th className="px-4 py-3 text-center font-semibold">Recipients</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                    ))
                  ) : (emailCampaigns ?? []).length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No email campaigns yet.</td></tr>
                  ) : (
                    (emailCampaigns ?? []).map((c: EmailCampaign) => (
                      <tr key={c.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.subject}</div>
                          <div className="text-xs text-gray-400">{recipientTypeLabels[c.recipientType]}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-medium">{c.sentCount}/{c.recipientCount}</div>
                          <div className="text-xs text-gray-500">sent</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            c.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {c.status !== "sent" && (
                              <button
                                onClick={() => handleSendEmail(c.id)}
                                disabled={sendEmailCampaign.isPending}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Send"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteEmail(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
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
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === "sms" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsSMSModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                <Plus size={14} /> New SMS Campaign
              </button>
            </div>

            <Dialog open={isSMSModalOpen} onOpenChange={setIsSMSModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogTitle className="sr-only">New SMS Campaign</DialogTitle>
                <form onSubmit={handleCreateSMS} className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-red-600" /> New SMS Campaign
                  </h3>
                  <input
                    placeholder="Campaign Name"
                    value={smsForm.name}
                    onChange={(e) => setSMSForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="SMS Message (max 160 chars recommended)"
                    value={smsForm.message}
                    onChange={(e) => setSMSForm((p) => ({ ...p, message: e.target.value }))}
                    required
                    rows={3}
                    maxLength={320}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <div className="text-xs text-gray-500 text-right">{smsForm.message.length}/320</div>
                  <select
                    value={smsForm.recipientType}
                    onChange={(e) => setSMSForm((p) => ({ ...p, recipientType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Contacts</option>
                    <option value="customers">Customers Only</option>
                    <option value="inquiries">Inquiries Only</option>
                  </select>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={createSMSCampaign.isPending}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {createSMSCampaign.isPending ? "Creating..." : "Create SMS"}
                    </button>
                    <button type="button" onClick={() => setIsSMSModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                    <th className="px-4 py-3 text-left font-semibold">Message Preview</th>
                    <th className="px-4 py-3 text-center font-semibold">Recipients</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {smsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                    ))
                  ) : (smsCampaigns ?? []).length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No SMS campaigns yet.</td></tr>
                  ) : (
                    (smsCampaigns ?? []).map((c: SMSCampaign) => (
                      <tr key={c.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-400">{recipientTypeLabels[c.recipientType]}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">{c.message}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-medium">{c.sentCount}/{c.recipientCount}</div>
                          <span className={`text-xs ${c.status === "sent" ? "text-green-600" : "text-yellow-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {c.status !== "sent" && (
                              <button
                                onClick={() => handleSendSMS(c.id)}
                                disabled={sendSMSCampaign.isPending}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Send"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSMS(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
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
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                <Plus size={14} /> New Promotion
              </button>
            </div>

            <Dialog open={isPromoModalOpen} onOpenChange={setIsPromoModalOpen}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogTitle className="sr-only">New Promotion</DialogTitle>
                <form onSubmit={handleCreatePromo} className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Tag size={18} className="text-red-600" /> New Promotion
                  </h3>
                  <input
                    placeholder="Promotion Title"
                    value={promoForm.title}
                    onChange={(e) => setPromoForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Description"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Promo Code"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      required
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                      value={promoForm.discountType}
                      onChange={(e) => setPromoForm((p) => ({ ...p, discountType: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">PKR</option>
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder={promoForm.discountType === "percentage" ? "Discount %" : "Discount Amount (PKR)"}
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm((p) => ({ ...p, discountValue: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Minimum Booking Amount (PKR)"
                    value={promoForm.minBookingAmount}
                    onChange={(e) => setPromoForm((p) => ({ ...p, minBookingAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={promoForm.validFrom}
                      onChange={(e) => setPromoForm((p) => ({ ...p, validFrom: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={promoForm.validUntil}
                      onChange={(e) => setPromoForm((p) => ({ ...p, validUntil: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Max Uses (optional)"
                    value={promoForm.maxUses}
                    onChange={(e) => setPromoForm((p) => ({ ...p, maxUses: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={createPromotion.isPending}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {createPromotion.isPending ? "Creating..." : "Create Promotion"}
                    </button>
                    <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))
              ) : (promotions ?? []).length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">No promotions yet.</div>
              ) : (
                (promotions ?? []).map((p: Promotion) => (
                  <div key={p.id} className={`border rounded-xl p-4 ${p.isActive ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 opacity-70"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{p.title}</div>
                        <div className="text-2xl font-bold text-red-600">{p.code}</div>
                      </div>
                      <button
                        onClick={() => togglePromoStatus(p)}
                        className={`p-1.5 rounded ${p.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      >
                        {p.isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {p.discountType === "percentage" ? `${p.discountValue}% off` : `${p.discountValue} PKR off`}
                      {p.minBookingAmount > 0 && ` (min. ${p.minBookingAmount} PKR)`}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Used: {p.usedCount}{p.maxUses ? `/${p.maxUses}` : " times"}</span>
                      <button onClick={() => handleDeletePromo(p.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
