"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, CreditCard, Calendar, User, Home, CheckCircle, Clock, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatPKR } from "@/lib/utils";
import { useGetBookings, useCreateBooking, useUpdateBooking, useDeleteBooking, useAddPayment, getGetBookingsQueryKey } from "@/lib/api";
import { useGetPlots } from "@/lib/api";
import { useGetCustomers } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Booking {
  id: string;
  plotId: string;
  plotNumber: string;
  projectName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  installmentCount: number;
  notes: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  partial: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};

export default function AdminBookings() {
  const { data: bookings, isLoading } = useGetBookings();
  const { data: plots } = useGetPlots();
  const { data: customers } = useGetCustomers();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const addPayment = useAddPayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [form, setForm] = useState({
    plotId: "",
    customerId: "",
    totalAmount: "",
    installmentCount: "1",
    notes: "",
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    notes: "",
  });

  const availablePlots = (plots ?? []).filter((p) => p.status === "Available");

  const handleOpenAdd = () => {
    setEditingBookingId(null);
    setForm({ plotId: "", customerId: "", totalAmount: "", installmentCount: "1", notes: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setForm({
      plotId: booking.plotId,
      customerId: booking.customerId,
      totalAmount: booking.totalAmount.toString(),
      installmentCount: booking.installmentCount.toString(),
      notes: booking.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenPayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentForm({ amount: "", paymentMethod: "cash", notes: "" });
    setIsPaymentModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingBookingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBookingId) {
      updateBooking.mutate(
        { id: editingBookingId, data: { notes: form.notes } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
            toast({ title: "Updated", description: "Booking updated successfully." });
            handleClose();
          },
          onError: () => toast({ title: "Error", description: "Failed to update booking.", variant: "destructive" }),
        }
      );
    } else {
      createBooking.mutate(
        {
          plotId: form.plotId,
          customerId: form.customerId,
          totalAmount: parseFloat(form.totalAmount),
          installmentCount: parseInt(form.installmentCount),
          notes: form.notes,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
            toast({ title: "Created", description: "Booking created successfully." });
            handleClose();
          },
          onError: () => toast({ title: "Error", description: "Failed to create booking.", variant: "destructive" }),
        }
      );
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    addPayment.mutate(
      {
        bookingId: selectedBooking.id,
        data: {
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
          toast({ title: "Payment Added", description: `Payment of ${formatPKR(parseFloat(paymentForm.amount))} recorded.` });
          setIsPaymentModalOpen(false);
          setSelectedBooking(null);
        },
        onError: () => toast({ title: "Error", description: "Failed to add payment.", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string, customerName: string) => {
    if (!confirm(`Delete booking for "${customerName}"?`)) return;
    deleteBooking.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
          toast({ title: "Deleted", description: `Booking for "${customerName}" was deleted.` });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete booking.", variant: "destructive" }),
      }
    );
  };

  const handleStatusChange = (id: string, status: string) => {
    updateBooking.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
          toast({ title: "Updated", description: `Booking status changed to ${status}.` });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage plot bookings and payments</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
          >
            <Plus size={14} /> New Booking
          </button>
        </div>

        {/* Booking Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">{editingBookingId ? "Edit Booking" : "New Booking"}</DialogTitle>
            <DialogDescription className="sr-only">Manage booking details</DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Home size={18} className="text-red-600" />
                {editingBookingId ? "Edit Booking" : "New Booking"}
              </h3>

              {!editingBookingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot *</label>
                    <select
                      value={form.plotId}
                      onChange={(e) => setForm((p) => ({ ...p, plotId: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a plot</option>
                      {availablePlots.map((plot) => (
                        <option key={plot.id} value={plot.id}>
                          {plot.plotNumber} - {plot.projectName} ({formatPKR(plot.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                    <select
                      value={form.customerId}
                      onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a customer</option>
                      {(customers ?? []).map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (PKR) *</label>
                    <input
                      type="number"
                      value={form.totalAmount}
                      onChange={(e) => setForm((p) => ({ ...p, totalAmount: e.target.value }))}
                      required
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installments</label>
                    <input
                      type="number"
                      value={form.installmentCount}
                      onChange={(e) => setForm((p) => ({ ...p, installmentCount: e.target.value }))}
                      min="1"
                      max="24"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createBooking.isPending || updateBooking.isPending}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {createBooking.isPending || updateBooking.isPending ? "Saving..." : editingBookingId ? "Update" : "Create Booking"}
                </button>
                <button type="button" onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle className="sr-only">Add Payment</DialogTitle>
            <DialogDescription className="sr-only">Record a payment for this booking</DialogDescription>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-green-600" />
                Add Payment
              </h3>

              {selectedBooking && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-600">Booking for: <span className="font-medium text-gray-900">{selectedBooking.customerName}</span></p>
                  <p className="text-gray-600">Total: <span className="font-medium text-gray-900">{formatPKR(selectedBooking.totalAmount)}</span></p>
                  <p className="text-gray-600">Paid: <span className="font-medium text-gray-900">{formatPKR(selectedBooking.paidAmount)}</span></p>
                  <p className="text-gray-600">Remaining: <span className="font-medium text-red-600">{formatPKR(selectedBooking.totalAmount - selectedBooking.paidAmount)}</span></p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Receipt number, etc."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addPayment.isPending}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {addPayment.isPending ? "Processing..." : "Record Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Plot</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Payment</th>
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
              ) : (bookings ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No bookings yet. <button onClick={handleOpenAdd} className="text-red-600 hover:underline">Create one.</button>
                  </td>
                </tr>
              ) : (
                (bookings ?? []).map((booking: Booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {booking.customerName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{booking.plotNumber}</div>
                        <div className="text-xs text-gray-500">{booking.projectName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{formatPKR(booking.totalAmount)}</div>
                      <div className="text-xs text-gray-500">
                        Paid: {formatPKR(booking.paidAmount)} ({Math.round((booking.paidAmount / booking.totalAmount) * 100)}%)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`text-xs font-medium rounded px-2 py-0.5 border-0 cursor-pointer ${statusColors[booking.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPayment(booking)}
                          disabled={booking.paymentStatus === "paid"}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          title="Add Payment"
                        >
                          <CreditCard size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(booking)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id, booking.customerName || "Unknown")}
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
