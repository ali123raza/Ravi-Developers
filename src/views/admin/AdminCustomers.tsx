"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, Home, CreditCard, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatPKR } from "@/lib/utils";
import { useGetCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, getGetCustomersQueryKey } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  source: string;
  status: string;
  totalBookings: number;
  totalPayments: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  blacklisted: "bg-red-100 text-red-700",
};

export default function AdminCustomers() {
  const { data: customers, isLoading } = useGetCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    status: "active",
  });

  const handleOpenAdd = () => {
    setEditingCustomerId(null);
    setForm({ name: "", email: "", phone: "", address: "", notes: "", status: "active" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      notes: customer.notes || "",
      status: customer.status,
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCustomerId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomerId) {
      updateCustomer.mutate(
        { id: editingCustomerId, data: form },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
            toast({ title: "Updated", description: "Customer updated successfully." });
            handleClose();
          },
          onError: () => toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" }),
        }
      );
    } else {
      createCustomer.mutate(form, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
          toast({ title: "Created", description: "Customer created successfully." });
          handleClose();
        },
        onError: () => toast({ title: "Error", description: "Failed to create customer.", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    deleteCustomer.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
          toast({ title: "Deleted", description: `"${name}" was deleted.` });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete customer.", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-sm mt-1">Manage customer profiles and history</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
          >
            <Plus size={14} /> Add Customer
          </button>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">{editingCustomerId ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription className="sr-only">Manage customer details</DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-red-600" />
                {editingCustomerId ? "Edit Customer" : "Add Customer"}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createCustomer.isPending || updateCustomer.isPending}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {createCustomer.isPending || updateCustomer.isPending ? "Saving..." : editingCustomerId ? "Update" : "Create"}
                </button>
                <button type="button" onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Customers Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Contact</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Bookings</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total Paid</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : (customers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No customers yet. <button onClick={handleOpenAdd} className="text-red-600 hover:underline">Add one.</button>
                  </td>
                </tr>
              ) : (
                (customers ?? []).map((customer: Customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.source || "Manual"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone size={12} /> {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail size={12} /> {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Home size={14} className="text-gray-400" />
                        <span className="font-medium">{customer.totalBookings}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <CreditCard size={14} className="text-green-500" />
                        {formatPKR(customer.totalPayments)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[customer.status]}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
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
      </div>
    </AdminLayout>
  );
}
