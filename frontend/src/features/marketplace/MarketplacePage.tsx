import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Search, MapPin, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { ListingItem } from "../../types";

interface MarketplacePageProps {
  onOpenCreateListing: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onOpenCreateListing }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMode, setSelectedMode] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", selectedCategory, selectedMode, searchQuery],
    queryFn: () =>
      api.getListings({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        listing_mode: selectedMode === "All" ? undefined : selectedMode,
        q: searchQuery.trim() || undefined,
        status: "available",
      }),
  });

  const getModeBadge = (item: ListingItem) => {
    switch (item.listing_mode) {
      case "sell":
        return <Badge variant="paid">₹{item.price || 0} • Sell</Badge>;
      case "lend":
        return <Badge variant="borrow">Borrow / Lend</Badge>;
      case "giveaway":
        return <Badge variant="free">Free Giveaway</Badge>;
      case "exchange":
        return <Badge variant="exchange">Exchange</Badge>;
      default:
        return <Badge variant="neutral">{item.listing_mode}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="paper-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">Campus Marketplace</h1>
          </div>
          <p className="text-xs text-[#73726e] mt-0.5">
            Borrow, lend, sell, or giveaway textbooks, electronics, and supplies within your verified campus community.
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="btn-primary text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          List an Item
        </button>
      </div>

      {/* Filter and Mode Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73726e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, calculators, equipment, lab coats..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors placeholder:text-[#888]"
          />
        </div>

        <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#0075de] transition-colors flex-1 sm:flex-initial"
          >
            <option value="All">All Modes</option>
            <option value="sell">Sell Only</option>
            <option value="lend">Lend / Borrow</option>
            <option value="giveaway">Free Giveaways</option>
            <option value="exchange">Exchange</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#0075de] transition-colors flex-1 sm:flex-initial"
          >
            <option value="All">All Categories</option>
            <option value="Books & Notes">Books & Notes</option>
            <option value="Electronics & Gadgets">Electronics & Gadgets</option>
            <option value="Campus Gear & Uniforms">Campus Gear & Uniforms</option>
            <option value="Vehicles & Sports">Vehicles & Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-[#e6e6e6] animate-pulse p-5"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          title="No marketplace items found"
          description="Have textbooks or campus supplies you no longer need? List them here."
          actionLabel="List an Item"
          onAction={onOpenCreateListing}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <Link
              key={item.id}
              to={`/marketplace/${item.id}`}
              className="paper-card hover:border-[#b8ddfe] transition-all flex flex-col justify-between group min-w-0"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[#73726e] uppercase tracking-wider">
                    {item.category}
                  </span>
                  {getModeBadge(item)}
                </div>

                <h3 className="font-bold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors line-clamp-2 text-base leading-snug break-words">
                  {item.title}
                </h3>

                <p className="text-[13px] text-[#555] line-clamp-2 leading-relaxed break-words">
                  {item.description}
                </p>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#f0efee] flex items-center justify-between text-xs text-[#73726e] gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 text-[#454340]">
                  <MapPin className="w-3.5 h-3.5 text-[#73726e] shrink-0" />
                  <span className="truncate text-xs">{item.pickup_area}</span>
                </div>

                <div className="flex items-center gap-1 text-[#0075de] font-semibold group-hover:translate-x-0.5 transition-transform text-xs shrink-0">
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
