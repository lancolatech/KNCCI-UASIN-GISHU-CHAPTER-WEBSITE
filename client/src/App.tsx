import * as React from "react";
import { Switch, Route, useLocation } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { RegistrationProvider } from "@/contexts/registration-context";
import { MembershipProvider } from "@/contexts/membership-context";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { AdvertisementPopup } from "@/components/advertisement-popup";
import Home from "@/pages/home";
import Partnership from "@/pages/partnership";
import Membership from "@/pages/membership";
import Board from "@/pages/board";
import GalleryPage from "@/pages/gallery";
import BlogPage from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import HotelDetail from "@/pages/hotel-detail";
import ExhibitionBooking from "@/pages/exhibition-booking";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import WorkPage from "@/pages/work";
import EventsPage from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import MarketplacePage from "@/pages/marketplace";
import MemberDirectoryPage from "@/pages/member-directory";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import AdminDashboard from "@/pages/admin";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/partnership" component={Partnership} />
      <Route path="/work" component={WorkPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/member-directory" component={MemberDirectoryPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboard} />

      <Route path="/membership" component={Membership} />
      <Route path="/board" component={Board} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/hotels/:id" component={HotelDetail} />
      <Route path="/exhibition-booking" component={ExhibitionBooking} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { AuthProvider } from "@/services/auth-context";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <RegistrationProvider>
                <MembershipProvider>
                  <ScrollToTop />
                  <Toaster />
                  <Router />
                  <WhatsAppFloat />
                  <MembershipDialogWrapper />
                  <AdvertisementPopup />
                </MembershipProvider>
              </RegistrationProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}


import { MembershipDialog } from "@/components/membership-dialog";
import { useMembership } from "@/contexts/membership-context";

function ScrollToTop() {
  const [location] = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function MembershipDialogWrapper() {
  const { isOpen, closeMembership } = useMembership();
  return <MembershipDialog isOpen={isOpen} onOpenChange={closeMembership} />;
}

export default App;
