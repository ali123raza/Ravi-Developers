import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/views/not-found";
import HomePage from "@/views/HomePage";
import ProjectsPage from "@/views/ProjectsPage";
import ProjectDetailPage from "@/views/ProjectDetailPage";
import PlotsPage from "@/views/PlotsPage";
import AboutPage from "@/views/AboutPage";
import ContactPage from "@/views/ContactPage";
import GalleryPage from "@/views/GalleryPage";
import AdminLogin from "@/views/admin/AdminLogin";
import AdminDashboard from "@/views/admin/AdminDashboard";
import AdminProjects from "@/views/admin/AdminProjects";
import AdminProjectForm from "@/views/admin/AdminProjectForm";
import AdminPlots from "@/views/admin/AdminPlots";
import AdminPlotForm from "@/views/admin/AdminPlotForm";
import AdminInquiries from "@/views/admin/AdminInquiries";
import AdminTestimonials from "@/views/admin/AdminTestimonials";
import AdminSettings from "@/views/admin/AdminSettings";
import WhatsAppButton from "@/components/WhatsAppButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/plots" component={PlotsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/gallery" component={GalleryPage} />

      {/* Admin - Public */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin - Protected */}
      <Route path="/admin">
        {() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>}
      </Route>
      <Route path="/admin/projects">
        {() => <ProtectedRoute><AdminProjects /></ProtectedRoute>}
      </Route>
      <Route path="/admin/projects/new">
        {() => <ProtectedRoute><AdminProjectForm /></ProtectedRoute>}
      </Route>
      <Route path="/admin/projects/:id/edit">
        {() => <ProtectedRoute><AdminProjectForm /></ProtectedRoute>}
      </Route>
      <Route path="/admin/plots">
        {() => <ProtectedRoute><AdminPlots /></ProtectedRoute>}
      </Route>
      <Route path="/admin/plots/new">
        {() => <ProtectedRoute><AdminPlotForm /></ProtectedRoute>}
      </Route>
      <Route path="/admin/plots/:id/edit">
        {() => <ProtectedRoute><AdminPlotForm /></ProtectedRoute>}
      </Route>
      <Route path="/admin/inquiries">
        {() => <ProtectedRoute><AdminInquiries /></ProtectedRoute>}
      </Route>
      <Route path="/admin/testimonials">
        {() => <ProtectedRoute><AdminTestimonials /></ProtectedRoute>}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedRoute><AdminSettings /></ProtectedRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <WouterRouter base={(process.env.NEXT_PUBLIC_BASE_URL || "/").replace(/\/$/, "")}>
            <Router />
            <WhatsAppButton />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
