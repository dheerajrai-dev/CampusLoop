import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Repeat,
  ShoppingBag,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { ExploreItem } from "../../types";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Explore feed
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["explore", activeType, searchQuery],
    queryFn: () =>
      api.getExplore({
        type: activeType,
        q: searchQuery.trim() || undefined,
      }),
  });

  const getItemLink = (item: ExploreItem) => {
    if (item.item_type === "request") return `/requests/${item.id}`;
    if (item.item_type === "listing") return `/marketplace/${item.id}`;
    return `/services/${item.id}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Value Proposition Hero (Answers 3 Questions) */}
      <section className="text-center py-8 sm:py-12 max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f5f4] text-[11px] text-[#73726e] font-medium border border-[#e6e6e6]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Campus-Verified Student Exchange
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight leading-tight">
          Your campus community, <br className="hidden sm:inline" />
          <span className="text-[#0075de]">shared resources and skills.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#73726e] max-w-xl mx-auto leading-relaxed">
          Borrow textbooks and calculators, request academic tutoring, or lend a hand to fellow verified students.
        </p>

        {/* 3 Core Action Cards (What can I find? What can I request? How can I offer?) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          {/* Card 1: Request */}
          <div className="paper-card space-y-2 hover:border-[#b8ddfe] transition-colors">
            <div className="w-8 h-8 rounded-md bg-[#e6f3fe] text-[#0075de] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Need something?</h3>
              <p className="text-[13px] text-[#73726e] leading-normal">
                Post an academic need, item to borrow, or campus task.
              </p>
            </div>
            <button
              onClick={onOpenCreateRequest}
              className="text-xs text-[#0075de] font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>Post a Request</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 2: Items */}
          <div className="paper-card space-y-2 hover:border-[#b8ddfe] transition-colors">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Have an extra item?</h3>
              <p className="text-[13px] text-[#73726e] leading-normal">
                Lend, sell, or giveaway calculators, textbooks, or supplies.
              </p>
            </div>
            <button
              onClick={onOpenCreateListing}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>List an Item</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 3: Services */}
          <div className="paper-card space-y-2 hover:border-[#b8ddfe] transition-colors">
            <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-800 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Offer a skill?</h3>
              <p className="text-[13px] text-[#73726e] leading-normal">
                Offer 1-on-1 tutoring, presentation design, or setup help.
              </p>
            </div>
            <button
              onClick={onOpenCreateService}
              className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>Offer a Service</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73726e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculator, tutoring, slides, textbooks..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors placeholder:text-[#888]"
            />
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f5f4] rounded-lg border border-[#e6e6e6] text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setActiveType("all")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeType === "all" ? "bg-white text-[#1a1a1a] shadow-xs font-bold" : "text-[#73726e] hover:text-[#1a1a1a]"
              }`}
            >
              All Feed
            </button>
            <button
              onClick={() => setActiveType("request")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeType === "request" ? "bg-white text-[#0075de] shadow-xs font-bold" : "text-[#73726e] hover:text-[#1a1a1a]"
              }`}
            >
              <Repeat className="w-3.5 h-3.5" /> Requests
            </button>
            <button
              onClick={() => setActiveType("listing")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeType === "listing" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-[#73726e] hover:text-[#1a1a1a]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Items
            </button>
            <button
              onClick={() => setActiveType("service")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeType === "service" ? "bg-white text-purple-800 shadow-xs font-bold" : "text-[#73726e] hover:text-[#1a1a1a]"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Services
            </button>
          </div>
        </div>
      </section>

      {/* 3. Items Grid */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-white rounded-xl border border-[#e6e6e6] animate-pulse p-5"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No campus posts match your filter"
            description="Be the first to post a request or list an item for your peers."
            actionLabel="Post a Request"
            onAction={onOpenCreateRequest}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <Link
                key={`${item.item_type}-${item.id}`}
                to={getItemLink(item)}
                className="paper-card hover:border-[#b8ddfe] transition-all flex flex-col justify-between group min-w-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#73726e] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <Badge variant={item.badge_variant}>{item.badge_label}</Badge>
                  </div>

                  <h3 className="font-bold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors line-clamp-2 text-base leading-snug break-words">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-[#555] line-clamp-2 leading-relaxed break-words">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-[#f0efee] flex items-center justify-between text-xs text-[#73726e] gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.creator && (
                      <>
                        <span className="w-6 h-6 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6] shrink-0">
                          {item.creator.full_name.charAt(0)}
                        </span>
                        <span className="truncate text-xs text-[#1a1a1a] font-medium">
                          {item.creator.full_name}
                        </span>
                        {item.creator.is_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0075de] shrink-0" />
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[#0075de] font-semibold group-hover:translate-x-0.5 transition-transform text-xs shrink-0">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
