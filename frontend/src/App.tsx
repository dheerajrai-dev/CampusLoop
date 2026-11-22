import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { SafetyBanner } from "./components/common/SafetyBanner";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";

// Modals
import { CreateRequestModal } from "./features/requests/CreateRequestModal";
import { CreateListingModal } from "./features/marketplace/CreateListingModal";
import { CreateServiceModal } from "./features/services/CreateServiceModal";

// Lazy-loaded route chunks for code-splitting & fast initial paint
const ExplorePage = lazy(() => import("./features/explore/ExplorePage").then((m) => ({ default: m.ExplorePage })));
const RequestsPage = lazy(() => import("./features/requests/RequestsPage").then((m) => ({ default: m.RequestsPage })));
const RequestDetailPage = lazy(() => import("./features/requests/RequestDetailPage").then((m) => ({ default: m.RequestDetailPage })));
const MarketplacePage = lazy(() => import("./features/marketplace/MarketplacePage").then((m) => ({ default: m.MarketplacePage })));
const ListingDetailPage = lazy(() => import("./features/marketplace/ListingDetailPage").then((m) => ({ default: m.ListingDetailPage })));
const ServicesPage = lazy(() => import("./features/services/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import("./features/services/ServiceDetailPage").then((m) => ({ default: m.ServiceDetailPage })));
const ActivityPage = lazy(() => import("./features/activity/ActivityPage").then((m) => ({ default: m.ActivityPage })));
const ProfilePage = lazy(() => import("./features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const LoginPage = lazy(() => import("./features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-6 h-6 border-2 border-[#0075de] border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60s stale time prevents redundant background refetches
      gcTime: 1000 * 60 * 10, // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppContent: React.FC = () => {
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [createServiceOpen, setCreateServiceOpen] = useState(false);

  const handleRefreshFeed = () => {
    queryClient.invalidateQueries({ queryKey: ["explore"] });
    queryClient.invalidateQueries({ queryKey: ["requests"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f4] text-[#1a1a1a]">
      <SafetyBanner />
      <Navbar
        onOpenCreateRequest={() => setCreateRequestOpen(true)}
        onOpenCreateListing={() => setCreateListingOpen(true)}
        onOpenCreateService={() => setCreateServiceOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ExplorePage
                  onOpenCreateRequest={() => setCreateRequestOpen(true)}
                  onOpenCreateListing={() => setCreateListingOpen(true)}
                  onOpenCreateService={() => setCreateServiceOpen(true)}
                />
              }
            />
            <Route
              path="/explore"
              element={
                <ExplorePage
                  onOpenCreateRequest={() => setCreateRequestOpen(true)}
                  onOpenCreateListing={() => setCreateListingOpen(true)}
                  onOpenCreateService={() => setCreateServiceOpen(true)}
                />
              }
            />
            <Route
              path="/requests"
              element={<RequestsPage onOpenCreateRequest={() => setCreateRequestOpen(true)} />}
            />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route
              path="/marketplace"
              element={<MarketplacePage onOpenCreateListing={() => setCreateListingOpen(true)} />}
            />
            <Route path="/marketplace/:id" element={<ListingDetailPage />} />
            <Route
              path="/services"
              element={<ServicesPage onOpenCreateService={() => setCreateServiceOpen(true)} />}
            />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {/* Global Creation Modals */}
      <CreateRequestModal
        isOpen={createRequestOpen}
        onClose={() => setCreateRequestOpen(false)}
        onSuccess={handleRefreshFeed}
      />
      <CreateListingModal
        isOpen={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
        onSuccess={handleRefreshFeed}
      />
      <CreateServiceModal
        isOpen={createServiceOpen}
        onClose={() => setCreateServiceOpen(false)}
        onSuccess={handleRefreshFeed}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
