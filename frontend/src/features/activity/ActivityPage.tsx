import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Star,
  ShieldCheck,
  Check,
  MessageSquare,
  ArrowUpRight,
  Send,
  HelpCircle,
  FileText,
  AlertCircle,
  Ban,
  UserCheck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { EmptyState } from "../../components/common/EmptyState";
import { Transaction, Request, Offer } from "../../types";

type ActivityTab = "tasks" | "requests" | "offers" | "completed" | "cancelled";

export const ActivityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActivityTab>("tasks");

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelTxnId, setSelectedCancelTxnId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch unified activity
  const { data: activity, isLoading } = useQuery({
    queryKey: ["myUnifiedActivity"],
    queryFn: () => api.getMyUnifiedActivity(),
    enabled: isAuthenticated,
  });

  // Cancel transaction mutation (with state rollback)
  const cancelTxnMutation = useMutation({
    mutationFn: ({ txnId, reason }: { txnId: string; reason: string }) =>
      api.cancelTransaction(txnId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUnifiedActivity"] });
      setCancelModalOpen(false);
      setSelectedCancelTxnId(null);
      setCancelReason("");
      setCancelError(null);
    },
    onError: (err: any) => {
      setCancelError(err.message || "Failed to cancel interaction");
    },
  });

  // Confirm completion mutation
  const confirmMutation = useMutation({
    mutationFn: (txnId: string) => api.confirmCompletion(txnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUnifiedActivity"] });
    },
  });

  // Update status (e.g. mark in_progress)
  const updateStatusMutation = useMutation({
    mutationFn: ({ txnId, status }: { txnId: string; status: string }) =>
      api.updateTransactionStatus(txnId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUnifiedActivity"] });
    },
  });

  // Cancel request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: string) => api.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUnifiedActivity"] });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: ({ txnId, data }: { txnId: string; data: { rating: number; comment?: string } }) =>
      api.createReview(txnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myUnifiedActivity"] });
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
      <div className="max-w-md mx-auto py-16 text-center paper-card">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Sign in to view your activity</h2>
        <p className="text-xs text-[#73726e] mt-1 mb-4">
          Track your requests, accepted tasks, completion confirmations, and reviews in one place.
        </p>
        <Link to="/login" className="btn-primary text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const stats = activity?.stats;
  const activeTasks = activity?.active_tasks || [];
  const postedRequests = activity?.posted_requests || [];
  const offersSent = activity?.offers_sent || [];
  const completedTasks = activity?.completed_tasks || [];
  const cancelledTasks = activity?.cancelled_tasks || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Page Header with Stats Bar */}
      <div className="paper-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">My Campus Activity</h1>
            <p className="text-xs text-[#73726e] mt-0.5">
              Live dashboard for your ongoing tasks, requests, submitted offers, and completed exchanges.
            </p>
          </div>
          <Link to="/requests" className="btn-secondary text-xs self-start sm:self-auto flex items-center gap-1.5">
            <span>Explore Requests</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[#f0efee]">
          <div className="panel-flat p-3.5 text-center">
            <span className="text-[11px] uppercase font-semibold text-[#73726e] tracking-wider block">
              Active Tasks
            </span>
            <span className="text-xl font-bold text-[#0075de]">
              {stats?.active_tasks ?? 0}
            </span>
          </div>
          <div className="panel-flat p-3.5 text-center">
            <span className="text-[11px] uppercase font-semibold text-[#73726e] tracking-wider block">
              My Requests
            </span>
            <span className="text-xl font-bold text-[#1a1a1a]">
              {stats?.total_posted ?? 0}
            </span>
          </div>
          <div className="panel-flat p-3.5 text-center">
            <span className="text-[11px] uppercase font-semibold text-[#73726e] tracking-wider block">
              Offers Sent
            </span>
            <span className="text-xl font-bold text-[#1a1a1a]">
              {stats?.total_offers_sent ?? 0}
            </span>
          </div>
          <div className="panel-flat p-3.5 text-center">
            <span className="text-[11px] uppercase font-semibold text-[#73726e] tracking-wider block">
              Completed
            </span>
            <span className="text-xl font-bold text-emerald-700">
              {stats?.completed_tasks ?? 0}
            </span>
          </div>
          <div className="panel-flat p-3.5 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] uppercase font-semibold text-[#73726e] tracking-wider block">
              Reputation
            </span>
            <span className="text-xl font-bold text-amber-600 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats?.reputation_score ? stats.reputation_score.toFixed(1) : "5.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e6e6e6] text-sm font-medium overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-3.5 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
            activeTab === "tasks"
              ? "text-[#0075de] font-bold border-b-2 border-[#0075de]"
              : "text-[#73726e] hover:text-[#1a1a1a]"
          }`}
        >
          <span>Ongoing Tasks</span>
          {activeTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#e6f3fe] text-[#0075de] font-semibold">
              {activeTasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-3.5 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
            activeTab === "requests"
              ? "text-[#0075de] font-bold border-b-2 border-[#0075de]"
              : "text-[#73726e] hover:text-[#1a1a1a]"
          }`}
        >
          <span>My Requests</span>
          {postedRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#f6f5f4] text-[#73726e] font-semibold">
              {postedRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`pb-3 px-3.5 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
            activeTab === "offers"
              ? "text-[#0075de] font-bold border-b-2 border-[#0075de]"
              : "text-[#73726e] hover:text-[#1a1a1a]"
          }`}
        >
          <span>Offers Sent</span>
          {offersSent.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#f6f5f4] text-[#73726e] font-semibold">
              {offersSent.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-3 px-3.5 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
            activeTab === "completed"
              ? "text-[#0075de] font-bold border-b-2 border-[#0075de]"
              : "text-[#73726e] hover:text-[#1a1a1a]"
          }`}
        >
          <span>Completed History</span>
          {completedTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#f6f5f4] text-[#73726e] font-semibold">
              {completedTasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("cancelled")}
          className={`pb-3 px-3.5 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
            activeTab === "cancelled"
              ? "text-[#0075de] font-bold border-b-2 border-[#0075de]"
              : "text-[#73726e] hover:text-[#1a1a1a]"
          }`}
        >
          <span>Cancelled</span>
          {cancelledTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 font-semibold">
              {cancelledTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-white rounded-xl border border-[#e6e6e6] animate-pulse"></div>
          ))}
        </div>
      ) : activeTab === "tasks" ? (
        /* ================= TAB 1: ONGOING TASKS ================= */
        <div className="space-y-4">
          {activeTasks.length === 0 ? (
            <EmptyState
              title="No ongoing tasks"
              description="When you accept an offer on your request or your offer is accepted by a peer, live tracking appears here."
            />
          ) : (
            activeTasks.map((txn: Transaction) => {
              const isRequester = user?.id === txn.requester_or_buyer_id;
              const otherUser = isRequester ? txn.provider_or_owner : txn.requester_or_buyer;
              const myConfirmed = isRequester
                ? txn.completion_confirmed_by_requester
                : txn.completion_confirmed_by_provider;

              return (
                <div key={txn.id} className="paper-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0efee]">
                    <div className="flex items-center gap-2">
                      <Badge variant={txn.status === "in_progress" ? "paid" : "warning"}>
                        {txn.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-[#73726e]">
                        Role: <strong>{isRequester ? "Requester" : "Fulfiller / Provider"}</strong>
                      </span>
                    </div>

                    {otherUser && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#73726e]">Partner:</span>
                        <Link
                          to={`/profile/${otherUser.id}`}
                          className="font-semibold text-[#1a1a1a] hover:text-[#0075de] transition-colors flex items-center gap-1"
                        >
                          {otherUser.full_name}
                          {otherUser.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Two-Sided Completion Banner */}
                  <div className="p-3.5 rounded-lg bg-[#f9f9f8] border border-[#e6e6e6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-[#1a1a1a] block">
                        Completion Verification (Two-Sided)
                      </span>
                      <div className="flex items-center gap-4 text-[#73726e]">
                        <span className="flex items-center gap-1.5">
                          {txn.completion_confirmed_by_requester ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#d0d0d0]"></span>
                          )}
                          Requester confirmed
                        </span>
                        <span className="flex items-center gap-1.5">
                          {txn.completion_confirmed_by_provider ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#d0d0d0]"></span>
                          )}
                          Provider confirmed
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setSelectedCancelTxnId(txn.id);
                          setCancelReason("");
                          setCancelError(null);
                          setCancelModalOpen(true);
                        }}
                        className="text-xs text-[#73726e] hover:text-rose-600 px-2.5 py-1.5 rounded hover:bg-rose-50 transition-colors"
                      >
                        Cancel Task
                      </button>

                      {txn.status === "accepted" && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({ txnId: txn.id, status: "in_progress" })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="btn-secondary text-xs"
                        >
                          Mark In Progress
                        </button>
                      )}

                      <button
                        onClick={() => confirmMutation.mutate(txn.id)}
                        disabled={confirmMutation.isPending || myConfirmed}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                          myConfirmed
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                            : "btn-primary"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {myConfirmed ? "You Confirmed ✓" : "Confirm Completion"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === "requests" ? (
        /* ================= TAB 2: MY POSTED REQUESTS ================= */
        <div className="space-y-3">
          {postedRequests.length === 0 ? (
            <EmptyState
              title="No requests posted"
              description="Need a book, tutor, lab partner, or skill? Post a request to the campus board."
            />
          ) : (
            postedRequests.map((req: Request) => (
              <div key={req.id} className="paper-card space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#73726e] uppercase">
                      {req.category}
                    </span>
                    <span className="text-[#dcdad7]">•</span>
                    <Badge
                      variant={
                        req.status === "open"
                          ? "free"
                          : req.status === "assigned"
                          ? "paid"
                          : "neutral"
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <span className="text-xs font-semibold text-[#1a1a1a]">
                    {req.preferred_arrangement === "free"
                      ? "Free"
                      : req.preferred_arrangement === "exchange"
                      ? "Exchange"
                      : `₹${req.budget || "Budget Negotiable"}`}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#1a1a1a]">{req.title}</h3>
                <p className="text-xs text-[#73726e] line-clamp-2">{req.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0efee] text-xs">
                  <span className="text-[#73726e]">
                    Offers received: <strong>{req.offers?.length || 0}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {req.status === "open" && (
                      <button
                        onClick={() => cancelRequestMutation.mutate(req.id)}
                        disabled={cancelRequestMutation.isPending}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <Link
                      to={`/requests/${req.id}`}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <span>View & Manage</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "offers" ? (
        /* ================= TAB 3: OFFERS SENT ================= */
        <div className="space-y-3">
          {offersSent.length === 0 ? (
            <EmptyState
              title="No offers submitted yet"
              description="Explore the Request Board and submit proposals to help classmates."
            />
          ) : (
            offersSent.map((offer: Offer) => (
              <div key={offer.id} className="paper-card space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1a1a1a]">
                    {offer.proposed_price !== null && offer.proposed_price !== undefined
                      ? offer.proposed_price === 0
                        ? "Free / Volunteer"
                        : `Proposed: ₹${offer.proposed_price}`
                      : "Terms as requested"}
                  </span>
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

                <p className="text-xs text-[#454340]">{offer.message}</p>
                {offer.availability_note && (
                  <p className="text-[11px] text-[#73726e]">
                    Availability: {offer.availability_note}
                  </p>
                )}

                <div className="pt-2 border-t border-[#f0efee] flex justify-end">
                  <Link
                    to={`/requests/${offer.request_id}`}
                    className="btn-ghost text-xs inline-flex items-center gap-1"
                  >
                    <span>View Request</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "completed" ? (
        /* ================= TAB 4: COMPLETED HISTORY ================= */
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <EmptyState
              title="No completed exchanges yet"
              description="Completed tasks with peer feedback will appear here."
            />
          ) : (
            completedTasks.map((txn: Transaction) => {
              const hasReviewed = txn.reviews?.some((r) => r.reviewer_id === user?.id);

              return (
                <div key={txn.id} className="paper-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Exchange Completed & Verified
                    </span>
                    <Badge variant="success">Completed</Badge>
                  </div>

                  {/* Reviews on this transaction */}
                  {txn.reviews && txn.reviews.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#f0efee]">
                      <span className="text-[10px] font-semibold uppercase text-[#73726e] tracking-wider block">
                        Peer Reviews:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {txn.reviews.map((rev) => (
                          <div key={rev.id} className="panel-flat p-2.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#1a1a1a]">
                                {rev.reviewer?.full_name || "Peer"}
                              </span>
                              <div className="flex items-center text-amber-500">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                            {rev.comment && <p className="text-[#73726e] italic">"{rev.comment}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-[#f0efee]">
                    {!hasReviewed ? (
                      <button
                        onClick={() => handleOpenReview(txn.id)}
                        className="btn-primary text-xs flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Leave a Review
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium">
                        ✓ Review recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ================= TAB 5: CANCELLED HISTORY ================= */
        <div className="space-y-4">
          <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Safe State Rollback Guarantee</span>
              When an interaction is cancelled, any linked request is automatically restored to open status so the requester can receive new offers. Cancelled interactions cannot receive peer reviews.
            </div>
          </div>

          {cancelledTasks.length === 0 ? (
            <EmptyState
              title="No cancelled interactions"
              description="Cancelled tasks and their state reversal records will appear here."
            />
          ) : (
            cancelledTasks.map((txn: Transaction) => {
              const isRequester = user?.id === txn.requester_or_buyer_id;
              const otherUser = isRequester ? txn.provider_or_owner : txn.requester_or_buyer;
              const cancelledByMe = txn.cancelled_by_id === user?.id;

              return (
                <div key={txn.id} className="paper-card space-y-3 opacity-90 border-l-4 border-l-rose-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">Cancelled</Badge>
                      <span className="text-xs text-[#73726e]">
                        Role: <strong>{isRequester ? "Requester" : "Provider"}</strong>
                      </span>
                    </div>

                    <span className="text-xs text-rose-700 font-medium">
                      {cancelledByMe ? "Cancelled by you" : "Cancelled by partner"}
                    </span>
                  </div>

                  {otherUser && (
                    <div className="text-xs text-[#73726e]">
                      Interaction Partner: <strong className="text-[#1a1a1a]">{otherUser.full_name}</strong>
                    </div>
                  )}

                  {txn.cancellation_reason && (
                    <div className="p-2.5 rounded bg-[#f6f5f4] text-xs text-[#454340] border border-[#e6e6e6]">
                      <span className="font-semibold text-[#1a1a1a] block mb-0.5">Cancellation Reason:</span>
                      "{txn.cancellation_reason}"
                    </div>
                  )}

                  <div className="text-[11px] text-[#9b9a97] flex items-center justify-between pt-1">
                    <span>Task closed with zero penalty. Request reset to open.</span>
                    {txn.request_id && (
                      <Link
                        to={`/requests/${txn.request_id}`}
                        className="text-[#0075de] hover:underline font-medium flex items-center gap-1"
                      >
                        <span>View Request</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Review for Your Peer"
        maxWidth="md"
      >
        <div className="space-y-4">
          {reviewError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {reviewError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-2">
              Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-[#dcdad7]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#1a1a1a] ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
              Feedback & Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was your peer's communication, punctuality, and help?"
              className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="btn-ghost text-xs"
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
              className="btn-primary text-xs"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Interaction Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Campus Interaction"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <span className="font-semibold block">Important Notice:</span>
            Cancelling this task will safely release the associated request back to open status so other peers can help. You and your partner will not receive a negative score.
          </div>

          {cancelError && (
            <div className="p-2.5 rounded bg-rose-100 text-rose-800 text-xs">
              {cancelError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
              Cancellation Reason *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Schedule conflict, item no longer needed, found another solution..."
              className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="btn-ghost text-xs"
            >
              Keep Interaction
            </button>
            <button
              onClick={() => {
                if (selectedCancelTxnId && cancelReason.trim()) {
                  cancelTxnMutation.mutate({
                    txnId: selectedCancelTxnId,
                    reason: cancelReason.trim(),
                  });
                }
              }}
              disabled={!cancelReason.trim() || cancelTxnMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {cancelTxnMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
