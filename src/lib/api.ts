"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// Helper to get admin auth token from localStorage
const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

// ========== PROJECTS ==========
const getProjects = async () => {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

const getProject = async (id: string) => {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
};

const createProject = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
};

const updateProject = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
};

const deleteProject = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
};

export const useGetProjects = () =>
  useQuery({ queryKey: ["projects"], queryFn: getProjects });

export const useGetProject = (id: string) =>
  useQuery({ queryKey: ["project", id], queryFn: () => getProject(id), enabled: !!id });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", vars.id] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const getGetProjectsQueryKey = () => ["projects"];

// ========== PLOTS ==========
const getPlots = async (projectId?: string) => {
  const url = projectId
    ? `${API_BASE}/plots?projectId=${projectId}`
    : `${API_BASE}/plots`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch plots");
  return res.json();
};

const getPlot = async (id: string) => {
  const res = await fetch(`${API_BASE}/plots/${id}`);
  if (!res.ok) throw new Error("Failed to fetch plot");
  return res.json();
};

const createPlot = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/plots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create plot");
  return res.json();
};

const updatePlot = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/plots/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update plot");
  return res.json();
};

const deletePlot = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/plots/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to delete plot");
  return res.json();
};

export const useGetPlots = (projectId?: string) =>
  useQuery({ queryKey: ["plots", projectId], queryFn: () => getPlots(projectId) });

export const useGetPlot = (id: string, options?: { query?: { enabled?: boolean } }) =>
  useQuery({ queryKey: ["plot", id], queryFn: () => getPlot(id), enabled: options?.query?.enabled !== false });

export const useCreatePlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plots"] }),
  });
};

export const useUpdatePlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePlot,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["plots"] });
      qc.invalidateQueries({ queryKey: ["plot", vars.id] });
    },
  });
};

export const useDeletePlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deletePlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plots"] }),
  });
};

export const getGetPlotsQueryKey = () => ["plots"];

// ========== INQUIRIES ==========
const getInquiries = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/inquiries`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  return res.json();
};

const createInquiry = async (data: unknown) => {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create inquiry");
  return res.json();
};

const updateInquiry = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update inquiry");
  return res.json();
};

export const useGetInquiries = () =>
  useQuery({ queryKey: ["inquiries"], queryFn: getInquiries });

export const useCreateInquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInquiry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
};

export const useUpdateInquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateInquiry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquiries"] }),
  });
};

export const getGetInquiriesQueryKey = () => ["inquiries"];

// ========== TESTIMONIALS ==========
const getTestimonials = async () => {
  const res = await fetch(`${API_BASE}/testimonials`);
  if (!res.ok) throw new Error("Failed to fetch testimonials");
  return res.json();
};

const createTestimonial = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/testimonials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create testimonial");
  return res.json();
};

const deleteTestimonial = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to delete testimonial");
  return res.json();
};

export const useGetTestimonials = () =>
  useQuery({ queryKey: ["testimonials"], queryFn: getTestimonials });

export const useCreateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTestimonial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const getGetTestimonialsQueryKey = () => ["testimonials"];

// ========== DASHBOARD ==========
const getDashboardStats = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};

export const useGetDashboardStats = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: getDashboardStats });

// Alias for plots by status (uses same endpoint)
export const useGetPlotsByStatus = () => {
  const { data } = useGetDashboardStats();
  return {
    data: data?.plotsByStatus,
    isLoading: !data,
  };
};
