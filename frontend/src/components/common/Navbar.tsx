import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Repeat,
  ShoppingBag,
  Wrench,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onOpenCreateRequest: () => void;
  onOpenCreateListing: () => void;
  onOpenCreateService: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateRequest,
  onOpenCreateListing,
  onOpenCreateService,
}) => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const location = useLocation();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/requests" && (location.pathname === "/requests" || location.pathname.startsWith("/requests/"))) return true;
    if (path === "/explore" && location.pathname === "/explore") return true;
    if (path === "/marketplace" && location.pathname.startsWith("/marketplace")) return true;
    if (path === "/services" && location.pathname.startsWith("/services")) return true;
    if (path === "/activity" && location.pathname.startsWith("/activity")) return true;
    return location.pathname === path;
  };

  // Close create menu when clicking outside
  useEffect(() => {
    if (!createMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [createMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Main Nav */}
        <div className="flex items-center gap-6">
          <Link to="/explore" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xs tracking-tight">
              CL
            </div>
            <span className="font-bold text-base text-[#1a1a1a] tracking-tight">
              CampusLoop
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#1a1a1a]">
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/explore")
                  ? "bg-[#f6f5f4] text-[#1a1a1a] font-bold"
                  : "text-[#73726e] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
              }`}
            >
              Explore
            </Link>
            <Link
              to="/requests"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/requests")
                  ? "bg-[#f6f5f4] text-[#1a1a1a] font-bold"
                  : "text-[#73726e] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
              }`}
            >
              Request Board
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/marketplace")
                  ? "bg-[#f6f5f4] text-[#1a1a1a] font-bold"
                  : "text-[#73726e] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/services"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/services")
                  ? "bg-[#f6f5f4] text-[#1a1a1a] font-bold"
                  : "text-[#73726e] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
              }`}
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link
                to="/activity"
                className={`px-3 py-2 rounded-md transition-colors ${
                  isActive("/activity")
                    ? "bg-[#f6f5f4] text-[#1a1a1a] font-bold"
                    : "text-[#73726e] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
                }`}
              >
                My Activity
              </Link>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Post Action Menu */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="btn-primary text-sm px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {createMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-[#e6e6e6] py-1.5 z-50 text-sm"
                onClick={() => setCreateMenuOpen(false)}
              >
                <button
                  onClick={onOpenCreateRequest}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#f6f5f4] flex items-center gap-2.5 text-[#1a1a1a]"
                >
                  <div className="w-6 h-6 rounded bg-[#e6f3fe] text-[#0075de] flex items-center justify-center shrink-0">
                    <Repeat className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1a1a1a]">Post a Request</div>
                    <div className="text-xs text-[#73726e]">Need an item, help, or tutor</div>
                  </div>
                </button>
                <button
                  onClick={onOpenCreateListing}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#f6f5f4] flex items-center gap-2.5 text-[#1a1a1a]"
                >
                  <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1a1a1a]">List an Item</div>
                    <div className="text-xs text-[#73726e]">Borrow, sell, or giveaway</div>
                  </div>
                </button>
                <button
                  onClick={onOpenCreateService}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#f6f5f4] flex items-center gap-2.5 text-[#1a1a1a]"
                >
                  <div className="w-6 h-6 rounded bg-purple-50 text-purple-800 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1a1a1a]">Offer a Service</div>
                    <div className="text-xs text-[#73726e]">Tutoring, skills, or setup</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Auth controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#f6f5f4] text-sm font-medium text-[#1a1a1a] transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#f6f5f4] border border-[#e6e6e6] text-[#1a1a1a] font-bold flex items-center justify-center text-xs">
                  {user.full_name.charAt(0)}
                </span>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.full_name.split(" ")[0]}
                </span>
                {user.is_verified && <ShieldCheck className="w-3 h-3 text-[#0075de]" />}
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-[#73726e] hover:text-[#1a1a1a] rounded-md hover:bg-[#f6f5f4] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loginAsDemo()}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#0075de] bg-[#e6f3fe] hover:bg-[#d5ebfe] rounded-md transition-colors"
                title="1-Click sign in as demo student"
              >
                <Sparkles className="w-3 h-3 text-[#0075de]" />
                <span className="hidden sm:inline">Try Demo</span>
              </button>
              <Link
                to="/login"
                className="btn-ghost text-sm"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#1a1a1a] hover:bg-[#f6f5f4] rounded-md"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e6e6e6] bg-white px-4 py-3 space-y-1 text-sm font-medium">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4]"
          >
            Explore
          </Link>
          <Link
            to="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4]"
          >
            Request Board
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4]"
          >
            Marketplace
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4]"
          >
            Services
          </Link>
          {isAuthenticated && (
            <Link
              to="/activity"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4]"
            >
              My Activity
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
