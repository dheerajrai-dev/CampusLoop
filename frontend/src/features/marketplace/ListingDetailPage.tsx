import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
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

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Inquire Modal
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [meetingSpot, setMeetingSpot] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id!),
    enabled: !!id,
  });

  const isOwner = user && listing && user.id === listing.owner_id;

  const inquireMutation = useMutation({
    mutationFn: () =>
      api.inquireListing(id!, {
        message: inquiryMessage.trim(),
        proposed_meeting_spot: meetingSpot.trim() || undefined,
      }),
    onSuccess: () => {
      setInquirySuccess("Item requested! An active interaction was added to your Activity.");
      setInquiryError(null);
      setTimeout(() => {
        setInquireModalOpen(false);
        navigate("/activity");
      }, 1200);
    },
    onError: (err: any) => {
      setInquiryError(err.message || "Failed to submit item request.");
    },
  });

  const handleOpenInquiry = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const defaultMsg =
      listing?.listing_mode === "lend"
        ? "Hi! I would like to borrow this item. Is it available to pick up at the campus meeting spot?"
        : listing?.listing_mode === "giveaway"
        ? "Hi! I am interested in this giveaway item. When is a convenient time to collect it?"
        : "Hi! I am interested in buying this item. Is it still available to inspect and pick up?";
    setInquiryMessage(defaultMsg);
    setMeetingSpot(listing?.pickup_area || "Central Library Lobby");
    setInquiryError(null);
    setInquirySuccess(null);
    setInquireModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-6 bg-[#f6f5f4] rounded w-28 animate-pulse"></div>
        <div className="h-56 bg-white rounded-xl border border-[#e6e6e6] animate-pulse"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto py-16 text-center paper-card">
        <h2 className="text-base font-bold text-[#1a1a1a]">Item Not Found</h2>
        <Link to="/marketplace" className="text-[#0075de] font-semibold text-xs mt-3 inline-block hover:underline">
          &larr; Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73726e] hover:text-[#1a1a1a] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Marketplace
      </Link>

      {/* Main Listing Card */}
      <div className="paper-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#73726e] uppercase tracking-wider">
              {listing.category}
            </span>
            <span className="text-[#dcdad7]">•</span>
            <span className="text-xs text-[#73726e] capitalize">
              Condition: {listing.condition?.replace("_", " ") || "Standard"}
            </span>
          </div>

          <Badge variant={listing.listing_mode === "sell" ? "paid" : "free"}>
            {listing.listing_mode === "sell" ? `₹${listing.price || 0} • Sell` : listing.listing_mode}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-snug break-words">
          {listing.title}
        </h1>

        <div className="prose prose-slate text-sm text-[#454340] leading-relaxed whitespace-pre-wrap break-words">
          {listing.description}
        </div>

        {/* Pickup Location Guidance */}
        <div className="panel-flat flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[#0075de] shrink-0 mt-0.5" />
          <div className="text-xs text-[#454340]">
            <div className="font-semibold text-xs text-[#1a1a1a] mb-0.5">
              Pickup & Meeting Spot: {listing.pickup_area}
            </div>
            <span className="text-[#73726e] text-xs">
              Meet in designated public campus areas (e.g. library lobby, dining commons, department quads) to inspect items safely.
            </span>
          </div>
        </div>

        {/* Owner Details & Direct Contact */}
        <div className="pt-4 border-t border-[#f0efee] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {listing.owner && (
              <Link to={`/profile/${listing.owner.id}`} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6]">
                  {listing.owner.full_name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors flex items-center gap-1 text-xs">
                    {listing.owner.full_name}
                    {listing.owner.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
                    )}
                  </span>
                  <span className="text-xs text-[#9b9a97] block">
                    {listing.owner.department || "Verified Campus Member"}
                  </span>
                </div>
              </Link>
            )}

            {/* Next Action: If owner, show management info. If peer, show clear action button */}
            {isOwner ? (
              <span className="text-xs text-[#73726e] italic">
                You posted this marketplace item.
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {/* Voluntary Direct WhatsApp Contact */}
                {listing.owner?.whatsapp && (
                  <a
                    href={`https://wa.me/${listing.owner.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(listing.owner.full_name)},%20I%20saw%20your%20item%20"${encodeURIComponent(listing.title)}"%20on%20CampusLoop.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* Voluntary Direct Phone Call */}
                {listing.owner?.phone && (
                  <a
                    href={`tel:${listing.owner.phone}`}
                    className="px-3 py-2 text-xs font-semibold text-[#1a1a1a] bg-[#f6f5f4] hover:bg-[#eae9e7] rounded-lg border border-[#e6e6e6] transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#73726e]" />
                    <span>Call / SMS</span>
                  </a>
                )}

                {/* Primary Action Button: Inquire / Request */}
                <button
                  onClick={handleOpenInquiry}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {listing.listing_mode === "lend"
                      ? "Request to Borrow"
                      : listing.listing_mode === "giveaway"
                      ? "Claim Giveaway Item"
                      : "Request to Purchase"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          {!isOwner && !listing.owner?.phone && !listing.owner?.whatsapp && (
            <p className="text-xs text-[#73726e] bg-[#f9f9f8] p-3 rounded-lg border border-[#e6e6e6]">
              Private contact details are protected. Use the in-app request button above to coordinate pickup safely.
            </p>
          )}
        </div>
      </div>

      {/* Item Inquiry Modal */}
      <Modal
        isOpen={inquireModalOpen}
        onClose={() => setInquireModalOpen(false)}
        title={`Request Item: ${listing.title}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {inquiryError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{inquiryError}</span>
            </div>
          )}

          {inquirySuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{inquirySuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Message to Seller ({listing.owner?.full_name || "Peer"}) *
            </label>
            <textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              rows={3}
              placeholder="State when you can meet and any questions about item condition..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Suggested Campus Meeting Area
            </label>
            <input
              type="text"
              value={meetingSpot}
              onChange={(e) => setMeetingSpot(e.target.value)}
              placeholder="e.g. Central Library Circulation Desk or Main Canteen"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>

          <div className="p-3 bg-[#f9f9f8] rounded-lg border border-[#e6e6e6] text-xs text-[#73726e]">
            Sending this request creates an active exchange record in your <strong>Activity</strong> tab so both you and the seller can confirm pickup and leave feedback.
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#f0efee]">
            <button
              onClick={() => setInquireModalOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => inquireMutation.mutate()}
              disabled={inquireMutation.isPending || !inquiryMessage.trim()}
              className="btn-primary text-sm flex items-center gap-1.5 px-4"
            >
              <Send className="w-4 h-4" />
              {inquireMutation.isPending ? "Sending Request..." : "Send Request & Coordinate"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
