import React, { useState } from "react";
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

// Pages
import { ExplorePage } from "./features/explore/ExplorePage";
import { RequestsPage } from "./features/requests/RequestsPage";
import { RequestDetailPage } from "./features/requests/RequestDetailPage";
import { MarketplacePage } from "./features/marketplace/MarketplacePage";
import { ListingDetailPage } from "./features/marketplace/ListingDetailPage";
import { ServicesPage } from "./features/services/ServicesPage";
import { ServiceDetailPage } from "./features/services/ServiceDetailPage";
import { ActivityPage } from "./features/activity/ActivityPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
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
