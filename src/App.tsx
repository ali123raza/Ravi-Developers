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
import AdminCMS from "@/views/admin/AdminCMS";
import AdminTheme from "@/views/admin/AdminTheme";
import AdminNavigation from "@/views/admin/AdminNavigation";
import AdminSEO from "@/views/admin/AdminSEO";
import AdminUsers from "@/views/admin/AdminUsers";
import AdminGallery from "@/views/admin/AdminGallery";
import AdminFiles from "@/views/admin/AdminFiles";
import AdminLogs from "@/views/admin/AdminLogs";
import AdminBookings from "@/views/admin/AdminBookings";
import AdminCustomers from "@/views/admin/AdminCustomers";
import AdminReports from "@/views/admin/AdminReports";
import AdminMarketing from "@/views/admin/AdminMarketing";
import AdminSystem from "@/views/admin/AdminSystem";
import AdminNotifications from "@/views/admin/AdminNotifications";
import ThemeProvider from "@/components/ThemeProvider";
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
      <Route path="/admin/cms">
        {() => <ProtectedRoute><AdminCMS /></ProtectedRoute>}
      </Route>
      <Route path="/admin/theme">
        {() => <ProtectedRoute><AdminTheme /></ProtectedRoute>}
      </Route>
      <Route path="/admin/navigation">
        {() => <ProtectedRoute><AdminNavigation /></ProtectedRoute>}
      </Route>
      <Route path="/admin/seo">
        {() => <ProtectedRoute><AdminSEO /></ProtectedRoute>}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute><AdminUsers /></ProtectedRoute>}
      </Route>
      <Route path="/admin/gallery">
        {() => <ProtectedRoute><AdminGallery /></ProtectedRoute>}
      </Route>
      <Route path="/admin/files">
        {() => <ProtectedRoute><AdminFiles /></ProtectedRoute>}
      </Route>
      <Route path="/admin/logs">
        {() => <ProtectedRoute><AdminLogs /></ProtectedRoute>}
      </Route>
      <Route path="/admin/bookings">
        {() => <ProtectedRoute><AdminBookings /></ProtectedRoute>}
      </Route>
      <Route path="/admin/customers">
        {() => <ProtectedRoute><AdminCustomers /></ProtectedRoute>}
      </Route>
      <Route path="/admin/reports">
        {() => <ProtectedRoute><AdminReports /></ProtectedRoute>}
      </Route>
      <Route path="/admin/marketing">
        {() => <ProtectedRoute><AdminMarketing /></ProtectedRoute>}
      </Route>
      <Route path="/admin/system">
        {() => <ProtectedRoute><AdminSystem /></ProtectedRoute>}
      </Route>
      <Route path="/admin/notifications">
        {() => <ProtectedRoute><AdminNotifications /></ProtectedRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <WouterRouter base="/">
              <Router />
              <WhatsAppButton />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
