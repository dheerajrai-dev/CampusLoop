import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Star,
  Repeat,
  AlertCircle,
  ShieldCheck,
  Check,
  MessageSquare,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { EmptyState } from "../../components/common/EmptyState";
import { Transaction } from "../../types";

export const ActivityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["myTransactions"],
    queryFn: () => api.getMyTransactions(),
    enabled: isAuthenticated,
  });

  // Confirm completion mutation
  const confirmMutation = useMutation({
    mutationFn: (txnId: string) => api.confirmCompletion(txnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTransactions"] });
    },
  });

  // Update status (e.g. mark in_progress)
  const updateStatusMutation = useMutation({
    mutationFn: ({ txnId, status }: { txnId: string; status: string }) =>
      api.updateTransactionStatus(txnId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTransactions"] });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: ({ txnId, data }: { txnId: string; data: { rating: number; comment?: string } }) =>
      api.createReview(txnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTransactions"] });
      setReviewModalOpen(false);
      setSelectedTxnId(null);
      setComment("");
      setReviewError(null);
    },
    onError: (err: any) => {
      setReviewError(err.message || "Failed to submit review");
    },
  });

  const handleOpenReview = (txnId: string) => {
    setSelectedTxnId(txnId);
    setRating(5);
    setComment("");
    setReviewError(null);
    setReviewModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your activity</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Track your requests, accepted tasks, completion confirmations, and reviews.
        </p>
        <Link
          to="/login"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity & Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your ongoing and completed exchanges. Both sides confirm completion before reviews unlock.
          </p>
        </div>
      </div>

      {/* Transactions list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-6"></div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No tasks or exchanges yet"
          description="When you accept an offer or your offer is accepted, it will appear here with live tracking."
        />
      ) : (
        <div className="space-y-5">
          {transactions.map((txn: Transaction) => {
            const isRequester = user?.id === txn.requester_or_buyer_id;
            const otherUser = isRequester ? txn.provider_or_owner : txn.requester_or_buyer;
            const myConfirmed = isRequester
              ? txn.completion_confirmed_by_requester
              : txn.completion_confirmed_by_provider;
            const peerConfirmed = isRequester
              ? txn.completion_confirmed_by_provider
              : txn.completion_confirmed_by_requester;

            const hasReviewed = txn.reviews?.some((r) => r.reviewer_id === user?.id);

            return (
              <div
                key={txn.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        txn.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : txn.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {txn.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      You are the {isRequester ? "Requester" : "Provider"}
                    </span>
                  </div>

                  {otherUser && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Collaborating with:</span>
                      <Link
                        to={`/profile/${otherUser.id}`}
                        className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1"
                      >
                        {otherUser.full_name}
                        {otherUser.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Status progression timeline */}
                <div className="grid grid-cols-3 gap-2 py-1 text-center text-xs">
                  <div
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                      txn.status !== "cancelled"
                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>1. Offer Accepted</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                      txn.status === "in_progress" || txn.status === "completed"
                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        txn.status === "in_progress" || txn.status === "completed"
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span>2. In Progress</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                      txn.status === "completed"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        txn.status === "completed" ? "text-emerald-600" : "text-slate-400"
                      }`}
                    />
                    <span>3. Completed</span>
                  </div>
                </div>

                {/* Two-sided completion check status */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800">
                      Two-Sided Completion Status:
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        {txn.completion_confirmed_by_requester ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        )}
                        Requester confirmed
                      </span>
                      <span className="flex items-center gap-1">
                        {txn.completion_confirmed_by_provider ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        )}
                        Provider confirmed
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {txn.status === "accepted" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ txnId: txn.id, status: "in_progress" })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}

                    {txn.status !== "completed" && txn.status !== "cancelled" && (
                      <button
                        onClick={() => confirmMutation.mutate(txn.id)}
                        disabled={confirmMutation.isPending || myConfirmed}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                          myConfirmed
                            ? "bg-emerald-100 text-emerald-800 cursor-default"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {myConfirmed ? "You Confirmed" : "Confirm Completion"}
                      </button>
                    )}

                    {txn.status === "completed" && !hasReviewed && (
                      <button
                        onClick={() => handleOpenReview(txn.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Leave a Review
                      </button>
                    )}

                    {txn.status === "completed" && hasReviewed && (
                      <span className="text-xs text-emerald-700 font-semibold px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                        ✓ Review Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Display reviews for this transaction if completed */}
                {txn.reviews && txn.reviews.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                      Reviews Recorded:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {txn.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">
                              {rev.reviewer?.full_name || "Peer"}
                            </span>
                            <div className="flex items-center text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          {rev.comment && <p className="text-slate-600 italic">"{rev.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Submission Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Review for Your Peer"
        maxWidth="md"
      >
        <div className="space-y-4">
          {reviewError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {reviewError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback & Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was your peer's communication, punctuality, and help?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedTxnId) {
                  submitReviewMutation.mutate({
                    txnId: selectedTxnId,
                    data: { rating, comment: comment.trim() || undefined },
                  });
                }
              }}
              disabled={submitReviewMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
