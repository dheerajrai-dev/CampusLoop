import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  AlertCircle,
  Sparkles,
  UserCheck,
  Ban,
  Check,
  Phone,
  MessageSquare,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Offer } from "../../types";

interface OfferFormValues {
  message: string;
  proposed_price?: number;
  availability_note?: string;
}

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loginAsDemo } = useAuth();

  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [acceptingOffer, setAcceptingOffer] = useState<Offer | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionMessage, setQuestionMessage] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.getRequest(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>();

  const isOwner = user && request && user.id === request.requester_id;
  const userOffer = request?.offers?.find((o) => o.provider_id === user?.id);

  // Submit Offer Mutation
  const submitOfferMutation = useMutation({
    mutationFn: (data: OfferFormValues) =>
      api.submitOffer(id!, {
        ...data,
        proposed_price: data.proposed_price ? Number(data.proposed_price) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setSuccessMessage("Your offer was submitted successfully!");
      setActionError(null);
      reset();
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to submit offer");
    },
  });

  // Send Direct Question Mutation
  const sendQuestionMutation = useMutation({
    mutationFn: () =>
      api.sendMessage({
        recipient_id: request!.requester_id,
        related_type: "request",
        related_id: id!,
        content: questionMessage.trim(),
      }),
    onSuccess: () => {
      setSuccessMessage("Message sent to requester!");
      setQuestionModalOpen(false);
      setQuestionMessage("");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to send message");
    },
  });

  // Accept Offer Mutation (Atomic on backend)
  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: string) => api.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setAcceptingOffer(null);
      setSuccessMessage("Offer accepted! Assigned to student and created a tracking task.");
      setActionError(null);
      setTimeout(() => navigate("/activity"), 1200);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to accept offer. It may have already been assigned or closed.");
      setAcceptingOffer(null);
    },
  });

  // Reject Offer Mutation
  const rejectOfferMutation = useMutation({
    mutationFn: (offerId: string) => api.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to reject offer");
    },
  });

  // Withdraw Offer Mutation
  const withdrawOfferMutation = useMutation({
    mutationFn: (offerId: string) => api.withdrawOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setSuccessMessage("Offer withdrawn.");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to withdraw offer");
    },
  });

  // Cancel Request Mutation
  const cancelRequestMutation = useMutation({
    mutationFn: () => api.cancelRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setCancelModalOpen(false);
      setSuccessMessage("Request has been cancelled.");
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to cancel request");
      setCancelModalOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-6 bg-[#f6f5f4] rounded w-28 animate-pulse"></div>
        <div className="h-56 bg-white rounded-xl border border-[#e6e6e6] animate-pulse"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-16 text-center paper-card">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Request Not Found</h2>
        <p className="text-xs text-[#73726e] mt-1 mb-4">
          This request may have been removed, cancelled, or archived.
        </p>
        <Link to="/requests" className="text-[#0075de] font-semibold text-xs hover:underline">
          &larr; Back to Request Board
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73726e] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Request Board
        </Link>

        {isOwner && request.status === "open" && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors flex items-center gap-1 border border-rose-200"
          >
            <Ban className="w-3 h-3" />
            Cancel Request
          </button>
        )}
      </div>

      {/* Alerts */}
      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Request Card */}
      <div className="paper-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[#73726e] uppercase tracking-wider">
              {request.category}
            </span>
            <span className="text-[#dcdad7]">•</span>
            <span className="text-xs text-[#73726e] capitalize">
              {request.request_type.replace("_", " ")}
            </span>
            <span className="text-[#dcdad7]">•</span>
            <Badge
              variant={
                request.preferred_arrangement === "free"
                  ? "free"
                  : request.preferred_arrangement === "exchange"
                  ? "exchange"
                  : "paid"
              }
            >
              {request.preferred_arrangement === "free"
                ? "Free / Peer Favor"
                : request.preferred_arrangement === "exchange"
                ? "Resource Exchange"
                : `Paid (₹${request.budget || "Negotiable"})`}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {request.status === "open" && <Badge variant="free">Open for Offers</Badge>}
            {request.status === "assigned" && <Badge variant="warning">Assigned / In Progress</Badge>}
            {request.status === "completed" && <Badge variant="neutral">Completed</Badge>}
            {request.status === "cancelled" && <Badge variant="neutral">Cancelled</Badge>}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-snug">
          {request.title}
        </h1>

        <div className="prose prose-slate text-sm text-[#454340] leading-relaxed whitespace-pre-wrap">
          {request.description}
        </div>

        {/* Assigned Banner */}
        {request.status === "assigned" && (
          <div className="panel-flat border-l-4 border-l-[#0075de] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#e6f3fe] text-[#0075de] font-bold flex items-center justify-center text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-[#1a1a1a]">
                  Assigned to: {request.assigned_provider?.full_name || "Assigned Student"}
                </span>
                <p className="text-[11px] text-[#73726e]">
                  Offer accepted. Work is currently in progress.
                </p>
              </div>
            </div>
            <Link
              to="/activity"
              className="btn-primary text-xs shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
            >
              Track in Activity &rarr;
            </Link>
          </div>
        )}

        {/* Requester Profile & Voluntary Contact Options */}
        <div className="pt-4 border-t border-[#f0efee] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {request.requester && (
              <Link
                to={`/profile/${request.requester.id}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6]">
                  {request.requester.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[#1a1a1a] group-hover:text-[#0075de] transition-colors flex items-center gap-1 text-xs">
                    {request.requester.full_name}
                    {request.requester.is_verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#9b9a97]">
                    {request.requester.department || "Campus Member"}
                  </div>
                </div>
              </Link>
            )}

            {/* Direct Contact Actions for peer */}
            {!isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                {request.requester?.whatsapp && (
                  <a
                    href={`https://wa.me/${request.requester.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(request.requester.full_name)},%20I%20saw%20your%20request%20"${encodeURIComponent(request.title)}"%20on%20CampusLoop.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {request.requester?.phone && (
                  <a
                    href={`tel:${request.requester.phone}`}
                    className="px-2.5 py-1 text-xs font-semibold text-[#1a1a1a] bg-[#f6f5f4] hover:bg-[#eae9e7] rounded-md border border-[#e6e6e6] transition-colors flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-[#73726e]" />
                    <span>Call / SMS</span>
                  </a>
                )}

                <button
                  onClick={() => setQuestionModalOpen(true)}
                  className="btn-ghost text-xs py-1 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Question</span>
                </button>
              </div>
            )}

            {request.deadline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f6f5f4] text-[#454340] font-medium text-xs border border-[#e6e6e6] self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5 text-[#73726e]" />
                <span>Needed by: {request.deadline}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Surface */}
      {isOwner ? (
        /* ================= Requester View (Reviews Submitted Offers) ================= */
        <div className="paper-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
              <span>Submitted Offers</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e6f3fe] text-[#0075de] font-semibold border border-[#d0e7fd]">
                {request.offers.length}
              </span>
            </h2>
            <span className="text-xs text-[#73726e]">
              {request.status === "open"
                ? "Compare offers and accept the best peer match"
                : `Request is ${request.status}`}
            </span>
          </div>

          {request.offers.length === 0 ? (
            <div className="text-center py-10 panel-flat">
              <Clock className="w-7 h-7 text-[#9b9a97] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1a1a1a]">No offers received yet</p>
              <p className="text-xs text-[#73726e] mt-1">
                Fellow students will see this on the Request Board and submit proposals soon.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {request.offers.map((offer: Offer) => (
                <div
                  key={offer.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    offer.status === "accepted"
                      ? "border-emerald-300 bg-emerald-50/20"
                      : offer.status === "rejected"
                      ? "border-[#f0efee] bg-[#fafafa] opacity-60"
                      : "border-[#e6e6e6] bg-white hover:border-[#d0d0d0]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    {offer.provider && (
                      <Link
                        to={`/profile/${offer.provider.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xs border border-[#e6e6e6]">
                          {offer.provider.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1a1a1a] text-xs group-hover:text-[#0075de] transition-colors flex items-center gap-1">
                            {offer.provider.full_name}
                            {offer.provider.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
                            )}
                          </span>
                          <span className="text-xs text-[#9b9a97]">
                            {offer.provider.department || "Peer"}
                          </span>
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {offer.proposed_price !== null && offer.proposed_price !== undefined ? (
                        <span className="text-sm font-bold text-[#1a1a1a]">
                          {offer.proposed_price === 0 ? "Free / Volunteer" : `₹${offer.proposed_price}`}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#73726e]">Standard Terms</span>
                      )}
                      <Badge
                        variant={
                          offer.status === "accepted"
                            ? "success"
                            : offer.status === "rejected"
                            ? "neutral"
                            : "warning"
                        }
                      >
                        {offer.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-[#454340] leading-relaxed mb-3 whitespace-pre-wrap break-words">
                    {offer.message}
                  </p>

                  {offer.availability_note && (
                    <div className="text-xs text-[#73726e] bg-[#f9f9f8] px-3 py-2 rounded-lg border border-[#e6e6e6] mb-3">
                      <strong>Delivery / Availability:</strong> {offer.availability_note}
                    </div>
                  )}

                  {/* Actions for open requests */}
                  {request.status === "open" && offer.status === "pending" && (
                    <div className="flex items-center gap-2.5 pt-3 border-t border-[#f0efee] justify-end">
                      <button
                        onClick={() => rejectOfferMutation.mutate(offer.id)}
                        disabled={rejectOfferMutation.isPending}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => setAcceptingOffer(offer)}
                        className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept Offer
                      </button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                      <span>✓ You accepted this offer</span>
                      <Link to="/activity" className="underline hover:text-emerald-900">
                        View Task in Activity &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= Peer / Provider View (Submit or Review My Offer) ================= */
        <div className="paper-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1a1a1a]">Offer to Fulfill Request</h2>
            <span className="text-xs text-[#73726e]">Help a classmate and earn or trade skills</span>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8 panel-flat p-6">
              <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#1a1a1a]">Sign in to Submit an Offer</h3>
              <p className="text-xs text-[#73726e] mt-1 mb-4">
                Sign in with your campus email or use the 1-click Demo Account:
              </p>
              <button
                onClick={() => loginAsDemo()}
                className="btn-primary text-xs"
              >
                Sign In with Demo Account
              </button>
            </div>
          ) : userOffer ? (
            /* User already has an offer */
            <div className="p-4 rounded-xl bg-[#e6f3fe]/40 border border-[#b8ddfe] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0075de]">Your Submitted Offer</span>
                <Badge
                  variant={
                    userOffer.status === "accepted"
                      ? "success"
                      : userOffer.status === "rejected"
                      ? "neutral"
                      : "warning"
                  }
                >
                  {userOffer.status}
                </Badge>
              </div>
              <p className="text-xs text-[#454340]">{userOffer.message}</p>
              {userOffer.proposed_price !== null && userOffer.proposed_price !== undefined && (
                <div className="text-xs font-semibold text-[#1a1a1a]">
                  Proposed Price: ₹{userOffer.proposed_price}
                </div>
              )}
              {userOffer.status === "pending" && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => withdrawOfferMutation.mutate(userOffer.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors"
                  >
                    Withdraw Offer
                  </button>
                </div>
              )}
              {userOffer.status === "accepted" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium flex items-center justify-between">
                  <span>Congratulations! Your offer was accepted by the requester.</span>
                  <Link to="/activity" className="font-bold underline">
                    Go to Activity &rarr;
                  </Link>
                </div>
              )}
            </div>
          ) : request.status !== "open" ? (
            <div className="text-center py-6 text-xs text-[#73726e] panel-flat">
              This request is currently <strong>{request.status}</strong> and is not accepting new offers.
            </div>
          ) : (
            /* Submit Offer Form */
            <form onSubmit={handleSubmit((data) => submitOfferMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
                  Your Proposal / Solution Message *
                </label>
                <textarea
                  {...register("message", { required: "Please provide a proposal message", minLength: 5 })}
                  rows={3}
                  placeholder="Explain what you can provide, relevant experience, or how you will solve this..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
                ></textarea>
                {errors.message && (
                  <p className="text-xs text-rose-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
                    Proposed Price (₹) (optional)
                  </label>
                  <input
                    {...register("proposed_price")}
                    type="number"
                    min="0"
                    placeholder={request.budget ? `Requester budget: ₹${request.budget}` : "0 for Free / Exchange"}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
                  />
                  <span className="text-xs text-[#9b9a97] mt-1 block">
                    Leave blank or enter 0 for free/volunteer exchange
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
                    Estimated Delivery / Availability
                  </label>
                  <input
                    {...register("availability_note")}
                    type="text"
                    placeholder="e.g., Today evening by 8 PM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end border-t border-[#f0efee]">
                <button
                  type="submit"
                  disabled={submitOfferMutation.isPending}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {submitOfferMutation.isPending ? "Submitting..." : "Send Offer"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Accept Offer Confirmation Modal */}
      <Modal
        isOpen={!!acceptingOffer}
        onClose={() => setAcceptingOffer(null)}
        title="Confirm Offer Acceptance"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#454340] leading-relaxed">
            You are about to accept the offer from{" "}
            <strong>{acceptingOffer?.provider?.full_name || "this student"}</strong> for{" "}
            <strong>
              {acceptingOffer?.proposed_price !== null && acceptingOffer?.proposed_price !== undefined
                ? acceptingOffer.proposed_price === 0
                  ? "Free"
                  : `₹${acceptingOffer.proposed_price}`
                : "Standard Terms"}
            </strong>
            .
          </p>
          <div className="p-3 bg-[#f9f9f8] rounded-md border border-[#e6e6e6] text-xs text-[#73726e]">
            <p className="font-medium text-[#1a1a1a] mb-1">What happens next?</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>The request status updates to <strong>Assigned</strong>.</li>
              <li>A tracked task record is created in your <strong>Activity</strong> tab.</li>
              <li>Other pending offers will be automatically closed.</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setAcceptingOffer(null)}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => acceptingOffer && acceptOfferMutation.mutate(acceptingOffer.id)}
              disabled={acceptOfferMutation.isPending}
              className="btn-primary text-xs"
            >
              {acceptOfferMutation.isPending ? "Assigning..." : "Confirm & Accept"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Direct Question Modal */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={`Message Requester: ${request.requester?.full_name || "Student"}`}
        maxWidth="sm"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-[#73726e]">
            Send an in-app message or question directly to the requester regarding this post.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Your Message *</label>
            <textarea
              value={questionMessage}
              onChange={(e) => setQuestionMessage(e.target.value)}
              rows={3}
              placeholder="e.g., Do you still need this? What specific textbook edition are you looking for?"
              className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setQuestionModalOpen(false)}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => sendQuestionMutation.mutate()}
              disabled={sendQuestionMutation.isPending || !questionMessage.trim()}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {sendQuestionMutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Request Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Request"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#454340]">
            Are you sure you want to cancel this request? It will be archived and will no longer accept offers.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="btn-ghost text-xs"
            >
              Keep Request
            </button>
            <button
              onClick={() => cancelRequestMutation.mutate()}
              disabled={cancelRequestMutation.isPending}
              className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
            >
              {cancelRequestMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
