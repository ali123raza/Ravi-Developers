"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Users, Lock, Mail, Shield } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGetUsers, useCreateUser, useUpdateUser, useDeleteUser, getGetUsersQueryKey } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsers() {
  const { data: users, isLoading } = useGetUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    password: "",
  });

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setForm({ name: "", email: "", role: "admin", password: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setForm({ name: "", email: "", role: "admin", password: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      // Update existing user - only include password if provided
      const updateData: { name: string; email: string; role: string; password?: string } = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (form.password.trim()) {
        updateData.password = form.password;
      }

      updateUser.mutate(
        { id: editingUserId, data: updateData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
            toast({ title: "Updated", description: "User updated successfully." });
            handleClose();
          },
          onError: () => toast({ title: "Error", description: "Failed to update user.", variant: "destructive" }),
        }
      );
    } else {
      // Create new user
      if (!form.password.trim()) {
        toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
        return;
      }

      createUser.mutate(
        {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
            toast({ title: "Created", description: "User created successfully." });
            handleClose();
          },
          onError: () => toast({ title: "Error", description: "Failed to create user.", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    deleteUser.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
          toast({ title: "Deleted", description: `User "${name}" was deleted.` });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 text-sm mt-1">Manage admin users and their roles</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
          >
            <Plus size={14} /> Add User
          </button>
        </div>

        {/* Modal for Add/Edit User */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">
              {editingUserId ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingUserId ? "Edit user details" : "Create a new admin user"}
            </DialogDescription>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-red-600" />
                <h3 className="font-semibold text-gray-900">
                  {editingUserId ? "Edit User" : "Add New User"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUserId ? "Password (leave blank to keep unchanged)" : "Password *"}
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      required={!editingUserId}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder={editingUserId ? "••••••••" : "Enter password"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <select
                      value={form.role}
                      onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {createUser.isPending || updateUser.isPending
                      ? "Saving..."
                      : editingUserId
                      ? "Update User"
                      : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    </td>
                  </tr>
                ))
              ) : (users ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No users yet.{" "}
                    <button onClick={handleOpenAdd} className="text-red-600 hover:underline">
                      Add one.
                    </button>
                  </td>
                </tr>
              ) : (
                (users ?? []).map((user: User) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "editor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
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
