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
  XCircle,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
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

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.getRequest(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

  // Accept Offer Mutation
  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: string) => api.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      setSuccessMessage("Offer accepted! A task record was created in your Activity.");
      setActionError(null);
      setTimeout(() => navigate("/activity"), 1200);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to accept offer");
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-24 animate-pulse"></div>
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          This request may have been removed or archived.
        </p>
        <Link to="/requests" className="text-indigo-600 font-semibold text-sm">
          &larr; Back to Request Board
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <Link
        to="/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Request Board
      </Link>

      {/* Notifications */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Request Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {request.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 capitalize">{request.request_type.replace("_", " ")}</span>
          </div>

          <div className="flex items-center gap-2">
            {request.status === "open" && <Badge variant="free">Open for Offers</Badge>}
            {request.status === "assigned" && <Badge variant="paid">Assigned</Badge>}
            {request.status === "completed" && <Badge variant="neutral">Completed</Badge>}
            {request.preferred_arrangement === "paid" && (
              <Badge variant="paid">₹{request.budget || "Budget Negotiable"}</Badge>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          {request.title}
        </h1>

        <div className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {request.description}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          {request.requester && (
            <Link
              to={`/profile/${request.requester.id}`}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                {request.requester.full_name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                  {request.requester.full_name}
                  {request.requester.is_verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {request.requester.department || "Student"}
                </div>
              </div>
            </Link>
          )}

          {request.deadline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Needed by: {request.deadline}</span>
            </div>
          )}
        </div>
      </div>

      {/* Offer Surface */}
      {isOwner ? (
        /* ================= Requester View (Reviews Submitted Offers) ================= */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Submitted Offers</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {request.offers.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500">
              {request.status === "open"
                ? "Compare offers and accept the best peer match"
                : `Request is currently ${request.status}`}
            </span>
          </div>

          {request.offers.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No offers received yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Fellow students will see this in their campus feed and submit proposals soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {request.offers.map((offer: Offer) => (
                <div
                  key={offer.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    offer.status === "accepted"
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    {offer.provider && (
                      <Link
                        to={`/profile/${offer.provider.id}`}
                        className="flex items-center gap-2 group"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {offer.provider.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                            {offer.provider.full_name}
                            {offer.provider.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </span>
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center gap-2">
                      {offer.proposed_price !== null && offer.proposed_price !== undefined && (
                        <span className="text-sm font-bold text-slate-900">
                          ₹{offer.proposed_price}
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          offer.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : offer.status === "rejected"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">
                    {offer.message}
                  </p>

                  {offer.availability_note && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 mb-3">
                      <strong>Availability:</strong> {offer.availability_note}
                    </div>
                  )}

                  {/* Actions for open requests */}
                  {request.status === "open" && offer.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-end">
                      <button
                        onClick={() => rejectOfferMutation.mutate(offer.id)}
                        disabled={rejectOfferMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptOfferMutation.mutate(offer.id)}
                        disabled={acceptOfferMutation.isPending}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept Offer
                      </button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Offer to Fulfill Request</h2>
            <span className="text-xs text-slate-500">Help a classmate and earn or trade skills</span>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Sign in to Submit an Offer</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You can also use 1-click Demo Sign-in as Meera (Provider) to test this flow:
              </p>
              <button
                onClick={() => loginAsDemo("meera@campus.edu")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Sign In as Meera (Demo Provider)
              </button>
            </div>
          ) : userOffer ? (
            /* User already has an offer */
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Your Submitted Offer</span>
                <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {userOffer.status}
                </span>
              </div>
              <p className="text-xs text-slate-700">{userOffer.message}</p>
              {userOffer.proposed_price !== null && (
                <div className="text-xs font-semibold text-slate-800">
                  Proposed Price: ₹{userOffer.proposed_price}
                </div>
              )}
              {userOffer.status === "pending" && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => withdrawOfferMutation.mutate(userOffer.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Withdraw Offer
                  </button>
                </div>
              )}
              {userOffer.status === "accepted" && (
                <div className="p-3 bg-emerald-100/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between">
                  <span>Congratulations! Your offer was accepted by the requester.</span>
                  <Link to="/activity" className="font-bold underline">
                    Go to Activity &rarr;
                  </Link>
                </div>
              )}
            </div>
          ) : request.status !== "open" ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-2xl">
              This request is currently <strong>{request.status}</strong> and is not accepting new offers.
            </div>
          ) : (
            /* Submit Offer Form */
            <form onSubmit={handleSubmit((data) => submitOfferMutation.mutate(data))} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Proposal / Solution Message *
                </label>
                <textarea
                  {...register("message", { required: "Please provide a message", minLength: 5 })}
                  rows={3}
                  placeholder="e.g., I have completed this course with an A grade. Can review and polish your slides in 2 hours."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                ></textarea>
                {errors.message && (
                  <p className="text-xs text-rose-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proposed Price (₹) (optional)
                  </label>
                  <input
                    {...register("proposed_price")}
                    type="number"
                    min="0"
                    placeholder="e.g., 350"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    When Can You Complete This?
                  </label>
                  <input
                    {...register("availability_note")}
                    type="text"
                    placeholder="e.g., Today evening, can deliver by 8 PM"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitOfferMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitOfferMutation.isPending ? "Submitting..." : "Send Offer"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
