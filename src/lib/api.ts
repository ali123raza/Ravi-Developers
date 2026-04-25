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
