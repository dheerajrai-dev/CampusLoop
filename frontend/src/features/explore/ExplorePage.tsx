import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Repeat,
  ShoppingBag,
  Wrench,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { ExploreItem } from "../../types";

const CATEGORIES = [
  "All",
  "Academic Help & Tutoring",
  "Electronics & Gadgets",
  "Design & Media",
  "Books & Notes",
  "Campus Assistance",
  "Tech & Device Support",
  "Vehicles & Sports",
];

interface ExplorePageProps {
  onOpenCreateRequest: () => void;
  onOpenCreateListing: () => void;
  onOpenCreateService: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onOpenCreateRequest,
  onOpenCreateListing,
  onOpenCreateService,
}) => {
  const [activeType, setActiveType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["explore", activeType, selectedCategory, searchQuery],
    queryFn: () =>
      api.getExplore({
        type: activeType,
        category: selectedCategory === "All" ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
      }),
  });

  const getItemLink = (item: ExploreItem) => {
    if (item.item_type === "request") return `/requests/${item.id}`;
    if (item.item_type === "listing") return `/marketplace/${item.id}`;
    return `/services/${item.id}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "request":
        return <Repeat className="w-3.5 h-3.5 text-indigo-600" />;
      case "listing":
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />;
      case "service":
        return <Wrench className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Apex Institute of Technology — Verified Campus Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            Your campus. Your people. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-indigo-200">
              Your resources.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Borrow calculators, buy used textbooks, find graphic designers, or ask a peer for help with your next assignment.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenCreateRequest}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5" />
              Post a Request
            </button>
            <button
              onClick={onOpenCreateListing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              List an Item
            </button>
            <button
              onClick={onOpenCreateService}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Offer a Service
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Search and Filters Surface */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, courses, equipment (e.g. calculator, python, slides)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setActiveType("request")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                activeType === "request" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Repeat className="w-3 h-3" /> Requests
            </button>
            <button
              onClick={() => setActiveType("listing")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                activeType === "listing" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-3 h-3" /> Items
            </button>
            <button
              onClick={() => setActiveType("service")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                activeType === "service" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wrench className="w-3 h-3" /> Services
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 pl-1">
            <Filter className="w-3 h-3" /> Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-medium"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-white border border-slate-200/80 animate-pulse p-5">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-full mb-6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No campus listings found"
          description={`No active ${activeType === "all" ? "items or requests" : activeType + "s"} match your current filters.`}
          actionLabel="Post a Request"
          onAction={onOpenCreateRequest}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              to={getItemLink(item)}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-slate-100">{getTypeIcon(item.item_type)}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      {item.item_type}
                    </span>
                  </div>
                  <Badge variant={item.badge_variant}>{item.badge_label}</Badge>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer info & student creator */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                {item.creator && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {item.creator.full_name.charAt(0)}
                    </div>
                    <span className="truncate max-w-[120px] text-slate-700 font-medium">
                      {item.creator.full_name}
                    </span>
                    {item.creator.is_verified && (
                      <span title="Verified Campus Student">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
