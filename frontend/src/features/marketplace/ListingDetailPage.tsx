import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, ShieldCheck, Tag, ShoppingBag, MessageSquare } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Item Not Found</h2>
        <Link to="/marketplace" className="text-emerald-600 font-semibold text-sm mt-3 inline-block">
          &larr; Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === listing.owner_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 capitalize">
              Condition: {listing.condition?.replace("_", " ") || "Not specified"}
            </span>
          </div>

          <Badge variant={listing.listing_mode === "sell" ? "paid" : "free"}>
            {listing.listing_mode === "sell" ? `₹${listing.price || 0} • Sell` : listing.listing_mode}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          {listing.title}
        </h1>

        <div className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {listing.description}
        </div>

        {/* Pickup Location Guidance */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950">
            <div className="font-semibold text-sm text-emerald-900 mb-0.5">
              Pickup & Meeting Spot: {listing.pickup_area}
            </div>
            <span>
              Always meet in public campus common areas (e.g. library lobby, cafeteria, departmental quads) to inspect and collect items.
            </span>
          </div>
        </div>

        {/* Owner details */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {listing.owner && (
            <Link to={`/profile/${listing.owner.id}`} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {listing.owner.full_name.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center gap-1 text-sm">
                  {listing.owner.full_name}
                  {listing.owner.is_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {listing.owner.department || "Student Member"}
                </span>
              </div>
            </Link>
          )}

          {!isOwner && (
            <div className="text-xs text-slate-500">
              Campus member listing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
