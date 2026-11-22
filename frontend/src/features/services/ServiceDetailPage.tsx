import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Send,
  MessageSquare,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Booking Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => api.getService(id!),
    enabled: !!id,
  });

  const isOwner = user && service && user.id === service.provider_id;

  const bookMutation = useMutation({
    mutationFn: () =>
      api.bookService(id!, {
        message: bookingMessage.trim(),
        desired_timeline: timeline.trim() || undefined,
      }),
    onSuccess: () => {
      setBookingSuccess("Service requested! An active task was added to your Activity.");
      setBookingError(null);
      setTimeout(() => {
        setBookModalOpen(false);
        navigate("/activity");
      }, 1200);
    },
    onError: (err: any) => {
      setBookingError(err.message || "Failed to book service.");
    },
  });

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setBookingMessage("Hi! I would like to request this service. Could we schedule a session?");
    setTimeline(service?.availability_note || "This week");
    setBookingError(null);
    setBookingSuccess(null);
    setBookModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-6 bg-[#f6f5f4] rounded w-28 animate-pulse"></div>
        <div className="h-56 bg-white rounded-xl border border-[#e6e6e6] animate-pulse"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-md mx-auto py-16 text-center paper-card">
        <h2 className="text-base font-bold text-[#1a1a1a]">Service Not Found</h2>
        <Link to="/services" className="text-[#0075de] font-semibold text-xs mt-3 inline-block hover:underline">
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73726e] hover:text-[#1a1a1a] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Services
      </Link>

      {/* Main Service Card */}
      <div className="paper-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#73726e] uppercase tracking-wider">
              {service.category}
            </span>
            <span className="text-[#dcdad7]">•</span>
            <span className="text-xs text-[#73726e] capitalize">{service.pricing_type}</span>
          </div>

          <Badge variant="paid">
            {service.pricing_type === "hourly"
              ? `₹${service.price || 0}/hr`
              : service.pricing_type === "fixed"
              ? `₹${service.price || 0} Fixed`
              : service.pricing_type}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-snug break-words">
          {service.title}
        </h1>

        <div className="prose prose-slate text-sm text-[#454340] leading-relaxed whitespace-pre-wrap break-words">
          {service.description}
        </div>

        {service.availability_note && (
          <div className="panel-flat flex items-center gap-2.5 text-xs text-[#454340]">
            <Calendar className="w-4 h-4 text-[#0075de] shrink-0" />
            <span>
              <strong>Availability:</strong> {service.availability_note}
            </span>
          </div>
        )}

        {service.tags && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {service.tags.split(",").map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-[#f6f5f4] text-[#73726e] text-xs font-medium border border-[#e6e6e6]">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Provider Profile & Clear Next Action */}
        <div className="pt-4 border-t border-[#f0efee] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {service.provider && (
              <Link to={`/profile/${service.provider.id}`} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6]">
                  {service.provider.full_name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors flex items-center gap-1 text-xs">
                    {service.provider.full_name}
                    {service.provider.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
                    )}
                  </span>
                  <span className="text-xs text-[#9b9a97] block">
                    {service.provider.department || "Verified Student Provider"}
                  </span>
                </div>
              </Link>
            )}

            {isOwner ? (
              <span className="text-xs text-[#73726e] italic">
                You offer this campus service.
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {/* Voluntary Direct WhatsApp Contact */}
                {service.provider?.whatsapp && (
                  <a
                    href={`https://wa.me/${service.provider.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(service.provider.full_name)},%20I%20saw%20your%20service%20"${encodeURIComponent(service.title)}"%20on%20CampusLoop.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Voluntary Direct Phone Call */}
                {service.provider?.phone && (
                  <a
                    href={`tel:${service.provider.phone}`}
                    className="px-3 py-2 text-xs font-semibold text-[#1a1a1a] bg-[#f6f5f4] hover:bg-[#eae9e7] rounded-lg border border-[#e6e6e6] transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#73726e]" />
                    <span>Call / SMS</span>
                  </a>
                )}

                {/* Primary Action Button: Book Service */}
                <button
                  onClick={handleOpenBooking}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Request / Book Service</span>
                </button>
              </div>
            )}
          </div>

          {!isOwner && !service.provider?.phone && !service.provider?.whatsapp && (
            <p className="text-xs text-[#73726e] bg-[#f9f9f8] p-3 rounded-lg border border-[#e6e6e6]">
              Private contact details are protected. Click "Request / Book Service" above to coordinate directly and track the interaction in your Activity.
            </p>
          )}
        </div>
      </div>

      {/* Book Service Modal */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title={`Request Service: ${service.title}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {bookingError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Your Requirements / Topic *
            </label>
            <textarea
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
              rows={3}
              placeholder="Describe what specific help, tutoring topic, or project assistance you need..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Desired Date / Time Window
            </label>
            <input
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. This Thursday after 4 PM, or weekend morning"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>

          <div className="p-3 bg-[#f9f9f8] rounded-lg border border-[#e6e6e6] text-xs text-[#73726e]">
            Submitting this request connects you directly with {service.provider?.full_name || "the provider"} and creates a tracked task in your <strong>Activity</strong> tab.
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#f0efee]">
            <button
              onClick={() => setBookModalOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending || !bookingMessage.trim()}
              className="btn-primary text-sm flex items-center gap-1.5 px-4"
            >
              <Send className="w-4 h-4" />
              {bookMutation.isPending ? "Submitting Request..." : "Confirm & Send Request"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
