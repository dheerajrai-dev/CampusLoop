import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { RequestItem } from "../../types";

interface RequestsPageProps {
  onOpenCreateRequest: () => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({ onOpenCreateRequest }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortFilter, setSortFilter] = useState<string>("recommended");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", categoryFilter, searchQuery, sortFilter],
    queryFn: () =>
      api.getRequests({
        category: categoryFilter === "All" ? undefined : categoryFilter,
        q: searchQuery.trim() || undefined,
        sort: sortFilter,
        status: "open",
      }),
  });

  const getArrangementBadge = (req: RequestItem) => {
    switch (req.preferred_arrangement) {
      case "paid":
        return <Badge variant="paid">₹{req.budget || "Budget negotiable"}</Badge>;
      case "free":
        return <Badge variant="free">Free / Peer Help</Badge>;
      case "exchange":
        return <Badge variant="exchange">Resource Exchange</Badge>;
      default:
        return <Badge variant="neutral">Any / Negotiable</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 panel-flat p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0d0d0d] tracking-tight">Request Board</h1>
          </div>
          <p className="text-xs text-[#757575] mt-1 max-w-xl">
            The core exchange of CampusLoop: post items you need, academic help, or gigs. Fellow verified students submit offers to help.
          </p>
        </div>

        <button onClick={onOpenCreateRequest} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Post a Request
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests by course, keyword, or problem..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors placeholder:text-[#888]"
          />
        </div>

        <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#0075de] transition-colors flex-1 sm:flex-initial"
          >
            <option value="recommended">Best Match (Recommended)</option>
            <option value="newest">Newest First</option>
            <option value="budget_high">Budget: High to Low</option>
            <option value="budget_low">Budget: Low to High</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#0075de] transition-colors flex-1 sm:flex-initial"
          >
            <option value="All">All Categories</option>
            <option value="Academic Help & Tutoring">Academic Help & Tutoring</option>
            <option value="Design & Media">Design & Media</option>
            <option value="Electronics & Gadgets">Electronics & Gadgets</option>
            <option value="Books & Notes">Books & Notes</option>
            <option value="Campus Assistance">Campus Assistance</option>
            <option value="Tech & Device Support">Tech & Device Support</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-xl border border-[#e6e6e6] animate-pulse p-5"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No open requests found"
          description="Have something you need? Post the first request for your campus community."
          actionLabel="Post a Request"
          onAction={onOpenCreateRequest}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="paper-card flex flex-col justify-between group hover:border-[#0075de]/50 min-w-0"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[#757575] uppercase tracking-wider">
                    {req.category}
                  </span>
                  {getArrangementBadge(req)}
                </div>

                <h3 className="font-bold text-[#0d0d0d] group-hover:text-[#0075de] transition-colors line-clamp-2 text-base leading-snug break-words">
                  {req.title}
                </h3>

                <p className="text-[13px] text-[#555] line-clamp-2 leading-relaxed break-words">
                  {req.description}
                </p>

                {/* Explainable match reasons */}
                {req.match_reasons && req.match_reasons.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    {req.match_reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-[#f6f5f4] text-[#1a1a1a] border border-[#e6e6e6] text-xs font-medium"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#e6e6e6] flex items-center justify-between text-xs text-[#757575] gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {req.requester && (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#f6f5f4] border border-[#e6e6e6] text-[#1a1a1a] font-semibold flex items-center justify-center text-xs shrink-0">
                        {req.requester.full_name.charAt(0)}
                      </span>
                      <span className="text-[#1a1a1a] font-medium text-xs truncate">
                        {req.requester.full_name}
                      </span>
                      {req.requester.is_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  )}

                  {req.deadline && (
                    <div className="hidden sm:flex items-center gap-1 text-[#757575] text-xs shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{req.deadline}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-[#f6f5f4] text-[#1a1a1a] border border-[#e6e6e6] text-xs font-medium">
                    {req.offers_count} {req.offers_count === 1 ? "offer" : "offers"}
                  </span>
                  <span className="text-[#0075de] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
