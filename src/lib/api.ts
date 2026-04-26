"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api";

// Types
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  totalArea?: string;
  status?: string;
  images?: string[];
  features?: string[];
  launchDate?: string;
  completionDate?: string;
  startingPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

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
  useQuery<Project[]>({ queryKey: ["projects"], queryFn: getProjects });

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

// ========== SECTIONS ==========
export interface PageSection {
  id: string;
  page: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  images: string[];
  buttons: { text: string; link: string; variant: string }[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getSections = async (page?: string) => {
  const url = page ? `${API_BASE}/sections?page=${page}` : `${API_BASE}/sections`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sections");
  return res.json();
};

const getSection = async (id: string) => {
  const res = await fetch(`${API_BASE}/sections/${id}`);
  if (!res.ok) throw new Error("Failed to fetch section");
  return res.json();
};

const createSection = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create section");
  return res.json();
};

const updateSection = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/sections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update section");
  return res.json();
};

const deleteSection = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/sections/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete section");
  return res.json();
};

const reorderSections = async (sections: { id: string; displayOrder: number }[]) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/sections/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sections }),
  });
  if (!res.ok) throw new Error("Failed to reorder sections");
  return res.json();
};

export const useGetSections = (page?: string) =>
  useQuery<PageSection[]>({ queryKey: ["sections", page], queryFn: () => getSections(page) });

export const useGetSection = (id: string) =>
  useQuery<PageSection>({ queryKey: ["section", id], queryFn: () => getSection(id), enabled: !!id });

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSection,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["section", vars.id] });
    },
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useReorderSections = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderSections,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

// ========== THEME ==========
export interface ThemeSettings {
  colors: {
    primary: string; primaryHover: string; primaryLight: string;
    secondary: string; secondaryHover: string;
    background: { main: string; alt: string; dark: string };
    text: { primary: string; secondary: string; light: string; white: string };
    border: { light: string; medium: string };
    accent: { success: string; warning: string; error: string };
  };
  typography: { fontFamily: string; fontHeading: string };
  assets: { logoUrl: string; logoDarkUrl: string; faviconUrl: string };
  updatedAt: string;
}

const getTheme = async () => {
  const res = await fetch(`${API_BASE}/theme`);
  if (!res.ok) throw new Error("Failed to fetch theme");
  return res.json();
};

const updateTheme = async (data: Record<string, string>) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/theme`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update theme");
  return res.json();
};

export const useGetTheme = () =>
  useQuery<ThemeSettings>({ queryKey: ["theme"], queryFn: getTheme });

export const useUpdateTheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTheme,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["theme"] }),
  });
};

// ========== NAVIGATION ==========
export interface NavItem {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  isExternal: boolean;
  icon: string | null;
  children?: NavItem[];
}

const getNavigation = async () => {
  const res = await fetch(`${API_BASE}/navigation`);
  if (!res.ok) throw new Error("Failed to fetch navigation");
  return res.json();
};

const getNavigationFlat = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/navigation/flat`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch navigation");
  return res.json();
};

const createNavItem = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/navigation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create navigation item");
  return res.json();
};

const updateNavItem = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/navigation/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update navigation item");
  return res.json();
};

const deleteNavItem = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/navigation/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete navigation item");
  return res.json();
};

const reorderNavigation = async (items: { id: string; displayOrder: number }[]) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/navigation/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to reorder navigation");
  return res.json();
};

export const useGetNavigation = () =>
  useQuery<NavItem[]>({ queryKey: ["navigation"], queryFn: getNavigation });

export const useGetNavigationFlat = () =>
  useQuery<NavItem[]>({ queryKey: ["navigation-flat"], queryFn: getNavigationFlat });

export const useCreateNavItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNavItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation"] });
      qc.invalidateQueries({ queryKey: ["navigation-flat"] });
    },
  });
};

export const useUpdateNavItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNavItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation"] });
      qc.invalidateQueries({ queryKey: ["navigation-flat"] });
    },
  });
};

export const useDeleteNavItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteNavItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation"] });
      qc.invalidateQueries({ queryKey: ["navigation-flat"] });
    },
  });
};

export const useReorderNavigation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderNavigation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["navigation"] });
      qc.invalidateQueries({ queryKey: ["navigation-flat"] });
    },
  });
};

// ========== SEO ==========
export interface SEOSettings {
  id: string;
  page: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  robotsMeta: string;
  updatedAt: string;
}

const getSEOSettings = async () => {
  const res = await fetch(`${API_BASE}/seo`);
  if (!res.ok) throw new Error("Failed to fetch SEO settings");
  return res.json();
};

const getSEOByPage = async (page: string) => {
  const res = await fetch(`${API_BASE}/seo/page/${page}`);
  if (!res.ok) throw new Error("Failed to fetch SEO for page");
  return res.json();
};

const createSEO = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/seo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create SEO settings");
  return res.json();
};

const updateSEO = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/seo/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update SEO settings");
  return res.json();
};

const deleteSEO = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/seo/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete SEO settings");
  return res.json();
};

export const useGetSEOSettings = () =>
  useQuery<SEOSettings[]>({ queryKey: ["seo"], queryFn: getSEOSettings });

export const useGetSEOByPage = (page: string) =>
  useQuery<SEOSettings>({ queryKey: ["seo", page], queryFn: () => getSEOByPage(page), enabled: !!page });

export const useCreateSEO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSEO,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo"] }),
  });
};

export const useUpdateSEO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSEO,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo"] }),
  });
};

export const useDeleteSEO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSEO(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo"] }),
  });
};

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

// ========== USERS ==========
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const getUsers = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/users`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

const createUser = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

const updateUser = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
};

const deleteUser = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
};

export const useGetUsers = () =>
  useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const getGetUsersQueryKey = () => ["users"];

// ========== GALLERY ==========
export interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  category: string;
  size: number;
  createdAt: string;
}

const getGallery = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/gallery`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch gallery");
  return res.json();
};

const deleteGalleryImage = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/gallery/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete image");
  return res.json();
};

export const useGetGallery = () =>
  useQuery<GalleryImage[]>({ queryKey: ["gallery"], queryFn: getGallery });

export const useDeleteGalleryImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteGalleryImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
};

export const getGetGalleryQueryKey = () => ["gallery"];

// ========== BOOKINGS ==========
export interface Booking {
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
  updatedAt: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptUrl: string;
  notes: string;
  createdAt: string;
}

const getBookings = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

const getBooking = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
};

const createBooking = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
};

const updateBooking = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
};

const deleteBooking = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
};

const addPayment = async ({ bookingId, data }: { bookingId: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add payment");
  return res.json();
};

export const useGetBookings = () =>
  useQuery<Booking[]>({ queryKey: ["bookings"], queryFn: getBookings });

export const useGetBooking = (id: string) =>
  useQuery<Booking>({ queryKey: ["booking", id], queryFn: () => getBooking(id), enabled: !!id });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useDeleteBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useAddPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addPayment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const getGetBookingsQueryKey = () => ["bookings"];

// ========== CUSTOMERS ==========
export interface Customer {
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
  updatedAt: string;
}

const getCustomers = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
};

const getCustomer = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
};

const createCustomer = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
};

const updateCustomer = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
};

const deleteCustomer = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
};

const convertInquiryToCustomer = async (inquiryId: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/customers/from-inquiry/${inquiryId}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to convert inquiry");
  return res.json();
};

export const useGetCustomers = () =>
  useQuery<Customer[]>({ queryKey: ["customers"], queryFn: getCustomers });

export const useGetCustomer = (id: string) =>
  useQuery({ queryKey: ["customer", id], queryFn: () => getCustomer(id), enabled: !!id });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};

export const useConvertInquiryToCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: convertInquiryToCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
};

export const getGetCustomersQueryKey = () => ["customers"];

// ========== REPORTS ==========
const getSalesReport = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/reports/sales`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch sales report");
  return res.json();
};

const getInquiryReport = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/reports/inquiries`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch inquiry report");
  return res.json();
};

const getPlotsReport = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/reports/plots`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch plots report");
  return res.json();
};

const getSummaryReport = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/reports/summary`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
};

export const useGetSalesReport = () =>
  useQuery({ queryKey: ["reports", "sales"], queryFn: getSalesReport });

export const useGetInquiryReport = () =>
  useQuery({ queryKey: ["reports", "inquiries"], queryFn: getInquiryReport });

export const useGetPlotsReport = () =>
  useQuery({ queryKey: ["reports", "plots"], queryFn: getPlotsReport });

export const useGetSummaryReport = () =>
  useQuery({ queryKey: ["reports", "summary"], queryFn: getSummaryReport });

// ========== NOTIFICATIONS ==========
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  createdAt: string;
}

const getNotifications = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

const getUnreadCount = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
};

const markNotificationRead = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PUT",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
};

const markAllNotificationsRead = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PUT",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
};

const deleteNotification = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
};

export const useGetNotifications = () =>
  useQuery<Notification[]>({ queryKey: ["notifications"], queryFn: getNotifications });

export const useGetUnreadCount = () =>
  useQuery<{ count: number }>({ queryKey: ["notifications", "unread"], queryFn: getUnreadCount });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

// ========== MARKETING ==========
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientType: string;
  recipientCount: number;
  sentCount: number;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  recipientType: string;
  recipientCount: number;
  sentCount: number;
  status: string;
  sentAt?: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minBookingAmount: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

const getEmailCampaigns = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/campaigns`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
};

const createEmailCampaign = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create campaign");
  return res.json();
};

const sendEmailCampaign = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/campaigns/${id}/send`, {
    method: "PUT",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to send campaign");
  return res.json();
};

const deleteEmailCampaign = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/campaigns/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete campaign");
  return res.json();
};

const getSMSCampaigns = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/sms`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch SMS campaigns");
  return res.json();
};

const createSMSCampaign = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create SMS campaign");
  return res.json();
};

const sendSMSCampaign = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/sms/${id}/send`, {
    method: "PUT",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to send SMS");
  return res.json();
};

const deleteSMSCampaign = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/sms/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete SMS campaign");
  return res.json();
};

const getPromotions = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/promotions`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch promotions");
  return res.json();
};

const createPromotion = async (data: unknown) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create promotion");
  return res.json();
};

const updatePromotion = async ({ id, data }: { id: string; data: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/promotions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update promotion");
  return res.json();
};

const deletePromotion = async (id: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/marketing/promotions/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to delete promotion");
  return res.json();
};

export const useGetEmailCampaigns = () =>
  useQuery<EmailCampaign[]>({ queryKey: ["emailCampaigns"], queryFn: getEmailCampaigns });

export const useCreateEmailCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmailCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emailCampaigns"] }),
  });
};

export const useSendEmailCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => sendEmailCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emailCampaigns"] }),
  });
};

export const useDeleteEmailCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteEmailCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emailCampaigns"] }),
  });
};

export const useGetSMSCampaigns = () =>
  useQuery<SMSCampaign[]>({ queryKey: ["smsCampaigns"], queryFn: getSMSCampaigns });

export const useCreateSMSCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSMSCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["smsCampaigns"] }),
  });
};

export const useSendSMSCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => sendSMSCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["smsCampaigns"] }),
  });
};

export const useDeleteSMSCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteSMSCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["smsCampaigns"] }),
  });
};

export const useGetPromotions = () =>
  useQuery<Promotion[]>({ queryKey: ["promotions"], queryFn: getPromotions });

export const useCreatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

export const useUpdatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

export const useDeletePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deletePromotion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });
};

// ========== SYSTEM ==========
const getSystemHealth = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/system/health`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch system health");
  return res.json();
};

const getSystemStats = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/system/stats`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch system stats");
  return res.json();
};

const createBackup = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/system/backup`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to create backup");
  return res.json();
};

const getBackups = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/system/backups`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch backups");
  return res.json();
};

const clearCache = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/system/clear-cache`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to clear cache");
  return res.json();
};

export const useGetSystemHealth = () =>
  useQuery({ queryKey: ["systemHealth"], queryFn: getSystemHealth, refetchInterval: 30000 });

export const useGetSystemStats = () =>
  useQuery({ queryKey: ["systemStats"], queryFn: getSystemStats });

export const useCreateBackup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBackup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backups"] }),
  });
};

export const useGetBackups = () =>
  useQuery({ queryKey: ["backups"], queryFn: getBackups });

export const useClearCache = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearCache,
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
};

// ========== ADVANCED SETTINGS ==========
const getAdvancedSettings = async () => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/settings-advanced`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
};

const updateAdvancedSetting = async ({ key, value }: { key: string; value: unknown }) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/settings-advanced/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Failed to update setting");
  return res.json();
};

const testIntegration = async (provider: string) => {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/settings-advanced/integrations/${provider}/test`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to test integration");
  return res.json();
};

export const useGetAdvancedSettings = () =>
  useQuery({ queryKey: ["advancedSettings"], queryFn: getAdvancedSettings });

export const useUpdateAdvancedSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdvancedSetting,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["advancedSettings"] }),
  });
};

export const useTestIntegration = () => useMutation({ mutationFn: testIntegration });
