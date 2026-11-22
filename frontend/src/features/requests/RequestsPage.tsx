import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Repeat, Plus, Search, Calendar, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { RequestItem } from "../../types";

interface RequestsPageProps {
  onOpenCreateRequest: () => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({ onOpenCreateRequest }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", categoryFilter, searchQuery],
    queryFn: () =>
      api.getRequests({
        category: categoryFilter === "All" ? undefined : categoryFilter,
        q: searchQuery.trim() || undefined,
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
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request Board</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Need an item, presentation polish, study tutoring, or campus assistance? Post a request and receive peer offers.
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post a Request
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests by keyword, course, topic..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200/80 animate-pulse p-6"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No open requests found"
          description="Be the first to post a request for your campus peers!"
          actionLabel="Post a Request"
          onAction={onOpenCreateRequest}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {req.category}
                  </span>
                  {getArrangementBadge(req)}
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base">
                  {req.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {req.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {req.requester && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                        {req.requester.full_name.charAt(0)}
                      </div>
                      <span className="text-slate-700 font-medium">
                        {req.requester.full_name}
                      </span>
                      {req.requester.is_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                  )}

                  {req.deadline && (
                    <div className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{req.deadline}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    <MessageSquare className="w-3 h-3" />
                    {req.offers_count} {req.offers_count === 1 ? "offer" : "offers"}
                  </span>
                  <span className="text-indigo-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
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
