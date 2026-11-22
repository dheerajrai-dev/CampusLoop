import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Wrench, Plus, Search, Tag, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { ServiceItem } from "../../types";

interface ServicesPageProps {
  onOpenCreateService: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenCreateService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", selectedCategory, searchQuery],
    queryFn: () =>
      api.getServices({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
        status: "active",
      }),
  });

  const getPricingBadge = (srv: ServiceItem) => {
    switch (srv.pricing_type) {
      case "hourly":
        return <Badge variant="paid">₹{srv.price || 0}/hr</Badge>;
      case "fixed":
        return <Badge variant="paid">₹{srv.price || 0} Fixed</Badge>;
      case "free":
        return <Badge variant="free">Free Peer Help</Badge>;
      default:
        return <Badge variant="neutral">Negotiable</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Services</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse skills and services offered by fellow students: tutoring, graphic design, device setup, and photography.
          </p>
        </div>

        <button
          onClick={onOpenCreateService}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Offer a Service
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
            placeholder="Search tutoring, slides, linux setup, photography..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white shadow-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
        >
          <option value="All">All Categories</option>
          <option value="Academic Help & Tutoring">Academic Help & Tutoring</option>
          <option value="Design & Media">Design & Media</option>
          <option value="Tech & Device Support">Tech & Device Support</option>
          <option value="Campus Assistance">Campus Assistance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-5"></div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No student services listed"
          description="Have a skill you can share or tutor? Offer a campus service to get started."
          actionLabel="Offer a Service"
          onAction={onOpenCreateService}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => (
            <Link
              key={srv.id}
              to={`/services/${srv.id}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {srv.category}
                  </span>
                  {getPricingBadge(srv)}
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 text-base">
                  {srv.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>

                {srv.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {srv.tags.split(",").slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                {srv.provider && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                      {srv.provider.full_name.charAt(0)}
                    </div>
                    <span className="text-slate-700 font-medium truncate max-w-[140px]">
                      {srv.provider.full_name}
                    </span>
                    {srv.provider.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-purple-700 font-semibold group-hover:translate-x-0.5 transition-transform">
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
