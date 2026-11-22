import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Search, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Marketplace</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exchange, lend, sell, or give away items within your verified campus community.
          </p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          List an Item
        </button>
      </div>

      {/* Filter and Mode Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, calculators, equipment, lab coats..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
            className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
            <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-5"></div>
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
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {getModeBadge(item)}
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-base">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 max-w-[170px] truncate text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.pickup_area}</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Details</span>
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
