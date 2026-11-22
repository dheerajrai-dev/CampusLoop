import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, ShieldCheck, Tag, Wrench, Calendar } from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => api.getService(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Service Not Found</h2>
        <Link to="/services" className="text-purple-600 font-semibold text-sm mt-3 inline-block">
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === service.provider_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {service.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 capitalize">{service.pricing_type}</span>
          </div>

          <Badge variant="paid">
            {service.pricing_type === "hourly"
              ? `₹${service.price || 0}/hr`
              : service.pricing_type === "fixed"
              ? `₹${service.price || 0} Fixed`
              : service.pricing_type}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          {service.title}
        </h1>

        <div className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {service.description}
        </div>

        {service.availability_note && (
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-center gap-3 text-xs text-purple-900">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Availability:</strong> {service.availability_note}
            </span>
          </div>
        )}

        {service.tags && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {service.tags.split(",").map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Provider Profile Info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {service.provider && (
            <Link to={`/profile/${service.provider.id}`} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                {service.provider.full_name.charAt(0)}
              </div>
              <div>
                <span className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors flex items-center gap-1 text-sm">
                  {service.provider.full_name}
                  {service.provider.is_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {service.provider.department || "Student Provider"}
                </span>
              </div>
            </Link>
          )}

          <Link
            to="/requests"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Post a Custom Request
          </Link>
        </div>
      </div>
    </div>
  );
};
