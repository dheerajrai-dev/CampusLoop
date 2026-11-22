import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, ShieldCheck, ArrowRight } from "lucide-react";
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
      <div className="paper-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">Student Services</h1>
          </div>
          <p className="text-xs text-[#73726e] mt-0.5">
            Discover peer tutoring, design assistance, lab report formatting, and technical help.
          </p>
        </div>

        <button
          onClick={onOpenCreateService}
          className="btn-primary text-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Offer a Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73726e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutoring, slides, python, photography..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors placeholder:text-[#888]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 text-sm font-medium rounded-lg border border-[#e6e6e6] bg-white text-[#1a1a1a] focus:outline-none focus:border-[#0075de] transition-colors"
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
            <div key={n} className="h-44 bg-white rounded-xl border border-[#e6e6e6] animate-pulse p-5"></div>
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
              className="paper-card hover:border-[#b8ddfe] transition-all flex flex-col justify-between group min-w-0"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[#73726e] uppercase tracking-wider">
                    {srv.category}
                  </span>
                  {getPricingBadge(srv)}
                </div>

                <h3 className="font-bold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors line-clamp-2 text-base leading-snug break-words">
                  {srv.title}
                </h3>

                <p className="text-[13px] text-[#555] line-clamp-2 leading-relaxed break-words">
                  {srv.description}
                </p>

                {srv.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {srv.tags.split(",").slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded-md bg-[#f6f5f4] text-[#73726e] border border-[#e6e6e6]">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#f0efee] flex items-center justify-between text-xs text-[#73726e] gap-2">
                {srv.provider && (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6] shrink-0">
                      {srv.provider.full_name.charAt(0)}
                    </div>
                    <span className="text-[#1a1a1a] font-medium truncate text-xs">
                      {srv.provider.full_name}
                    </span>
                    {srv.provider.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0075de] shrink-0" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-[#0075de] font-semibold group-hover:translate-x-0.5 transition-transform text-xs shrink-0">
                  <span>View</span>
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
