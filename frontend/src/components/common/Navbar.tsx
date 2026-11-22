import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Repeat,
  ShoppingBag,
  Wrench,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
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
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                CampusLoop
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MVP
                </span>
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/explore")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              Explore
            </Link>
            <Link
              to="/requests"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/requests")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              Request Board
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/marketplace")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/services"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/services")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link
                to="/activity"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/activity")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                Activity
              </Link>
            )}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Demo User Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setDemoMenuOpen(!demoMenuOpen);
                setCreateMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
              title="Switch demo persona for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Demo Switch</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100"
                onClick={() => setDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Select Demo Student
                </div>
                <button
                  onClick={() => loginAsDemo("aarav@campus.edu")}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700"
                >
                  <div>
                    <div className="font-semibold text-slate-800">Aarav Sharma</div>
                    <div className="text-[11px] text-slate-500">CS Junior (Requester)</div>
                  </div>
                  {user?.email === "aarav@campus.edu" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => loginAsDemo("meera@campus.edu")}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700"
                >
                  <div>
                    <div className="font-semibold text-slate-800">Meera Patel</div>
                    <div className="text-[11px] text-slate-500">Design Senior (Provider)</div>
                  </div>
                  {user?.email === "meera@campus.edu" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => loginAsDemo("ananya@campus.edu")}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700"
                >
                  <div>
                    <div className="font-semibold text-slate-800">Ananya Iyer</div>
                    <div className="text-[11px] text-slate-500">Math & Python Peer Tutor</div>
                  </div>
                  {user?.email === "ananya@campus.edu" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => loginAsDemo("rohan@campus.edu")}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between text-slate-700"
                >
                  <div>
                    <div className="font-semibold text-slate-800">Rohan Verma</div>
                    <div className="text-[11px] text-slate-500">Mech Eng Student</div>
                  </div>
                  {user?.email === "rohan@campus.edu" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Create Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCreateMenuOpen(!createMenuOpen);
                setDemoMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Post</span>
              <ChevronDown className="w-3 h-3 text-indigo-200" />
            </button>

            {createMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100"
                onClick={() => setCreateMenuOpen(false)}
              >
                <button
                  onClick={onOpenCreateRequest}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Post a Request</div>
                    <div className="text-[11px] text-slate-400">Ask for help or an item</div>
                  </div>
                </button>
                <button
                  onClick={onOpenCreateListing}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">List an Item</div>
                    <div className="text-[11px] text-slate-400">Sell, lend, give or exchange</div>
                  </div>
                </button>
                <button
                  onClick={onOpenCreateService}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Offer a Service</div>
                    <div className="text-[11px] text-slate-400">Tutoring, design, tech help</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="View your public profile"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                  {user.full_name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">
                  {user.full_name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-sm font-medium">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Explore Feed
          </Link>
          <Link
            to="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Request Board
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Marketplace Items
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Services Directory
          </Link>
          {isAuthenticated && (
            <Link
              to="/activity"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              My Activity & Tasks
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
