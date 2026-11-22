import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Building2,
  GraduationCap,
  Edit3,
  AlertTriangle,
  Phone,
  MessageCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/common/Modal";
import { User, Review } from "../../types";

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: () => api.getUserProfile(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["userReviews", id],
    queryFn: () => api.getUserReviews(id!),
    enabled: !!id,
  });

  const isOwner = currentUser && id === currentUser.id;

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Partial<User>>({
    values: currentUser || undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: Partial<User>) => api.updateMe(values),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["userProfile", id] });
      setEditModalOpen(false);
    },
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      api.reportItem({
        target_type: "user",
        target_id: id!,
        reason: reportReason,
      }),
    onSuccess: () => {
      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setReportReason("");
      }, 1500);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-44 bg-white rounded-xl border border-[#e6e6e6] animate-pulse"></div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center paper-card">
        <h2 className="text-base font-bold text-[#1a1a1a]">Student Profile Not Found</h2>
        <Link to="/explore" className="text-[#0075de] font-semibold text-xs mt-3 inline-block hover:underline">
          &larr; Back to Explore
        </Link>
      </div>
    );
  }

  const { user, stats } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Card */}
      <div className="paper-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-[#f6f5f4] text-[#1a1a1a] font-bold flex items-center justify-center text-xl border border-[#e6e6e6]">
              {user.full_name.charAt(0)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">{user.full_name}</h1>
                {user.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f3fe] text-[#0075de] text-[10px] font-semibold border border-[#d0e7fd]"
                    title="Verified Campus Member"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#0075de]" />
                    Verified
                  </span>
                )}
              </div>

              <div className="text-xs text-[#73726e] flex flex-wrap items-center gap-x-3 gap-y-1">
                {user.department && (
                  <span className="flex items-center gap-1 text-[#454340]">
                    <Building2 className="w-3.5 h-3.5 text-[#73726e]" />
                    {user.department}
                  </span>
                )}
                {user.course && (
                  <span className="flex items-center gap-1 text-[#454340]">
                    <GraduationCap className="w-3.5 h-3.5 text-[#73726e]" />
                    {user.course} {user.year_or_semester ? `• ${user.year_or_semester}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isOwner ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-1.5 text-[#9b9a97] hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                title="Report user"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {user.bio && (
          <div className="pt-3 border-t border-[#f0efee] text-sm text-[#454340] leading-relaxed max-w-2xl break-words">
            {user.bio}
          </div>
        )}

        {/* Contact info (voluntary peer sharing) */}
        <div className="pt-3 border-t border-[#f0efee] flex flex-wrap items-center gap-3 text-xs">
          {user.phone ? (
            <a
              href={`tel:${user.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f5f4] text-[#1a1a1a] hover:bg-[#e6e6e6] transition-colors border border-[#e6e6e6] font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#0075de]" />
              <span>{user.phone}</span>
            </a>
          ) : null}

          {user.whatsapp ? (
            <a
              href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Chat</span>
            </a>
          ) : null}

          {user.contact_note && (
            <span className="text-xs text-[#73726e]">
              Preference: {user.contact_note}
            </span>
          )}

          {isOwner && (
            <span className="text-xs text-[#9b9a97] sm:ml-auto">
              Privacy settings: {currentUser?.show_phone ? "Phone public" : "Phone hidden"} • {currentUser?.show_whatsapp ? "WhatsApp public" : "WhatsApp hidden"}
            </span>
          )}
        </div>
      </div>

      {/* Reputation & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="paper-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1a1a1a]">{stats.average_rating || "—"} / 5</div>
            <div className="text-[11px] text-[#73726e]">Average Student Rating</div>
          </div>
        </div>

        <div className="paper-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1a1a1a]">{stats.completed_exchanges}</div>
            <div className="text-[11px] text-[#73726e]">Completed Exchanges</div>
          </div>
        </div>

        <div className="paper-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e6f3fe] text-[#0075de] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1a1a1a]">{stats.total_reviews}</div>
            <div className="text-[11px] text-[#73726e]">Peer Reviews Recorded</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="paper-card space-y-4">
        <h2 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2">
          <span>Peer Reviews & Trust Signals</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f6f5f4] text-[#73726e] border border-[#e6e6e6]">
            {reviews.length}
          </span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9b9a97] panel-flat">
            No completed task reviews yet. Reviews appear after exchanges are marked complete by both participants.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((rev: Review) => (
              <div key={rev.id} className="p-3 rounded-lg border border-[#e6e6e6] bg-[#fafafa] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1a1a1a]">
                    {rev.reviewer?.full_name || "Campus Peer"}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-xs text-[#454340] leading-relaxed italic">"{rev.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleSubmit((values) => updateProfileMutation.mutate(values))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Full Name</label>
            <input
              {...register("full_name")}
              type="text"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Department</label>
              <input
                {...register("department")}
                type="text"
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Year / Semester</label>
              <input
                {...register("year_or_semester")}
                type="text"
                placeholder="e.g. Year 3 / Sem 5"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Short Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="Tell fellow students about your skills, major, or hobbies..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-[#f0efee] space-y-3.5">
            <span className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider block">
              Voluntary Direct Contact (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#73726e] mb-1.5">Phone Number</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#73726e] mb-1.5">WhatsApp Number</label>
                <input
                  {...register("whatsapp")}
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#73726e] mb-1.5">Preferred Contact Note</label>
              <input
                {...register("contact_note")}
                type="text"
                placeholder="e.g. WhatsApp preferred after 4 PM, or in-app message first"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("show_phone")}
                  className="rounded border-[#d0d0d0] text-[#0075de] focus:ring-[#0075de]"
                />
                <span className="text-xs text-[#454340]">Allow peers to see my phone number on my listings/requests</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("show_whatsapp")}
                  className="rounded border-[#d0d0d0] text-[#0075de] focus:ring-[#0075de]"
                />
                <span className="text-xs text-[#454340]">Allow peers to initiate WhatsApp chat from my listings/requests</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#f0efee]">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm px-4"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report Community Member">
        {reportSuccess ? (
          <div className="py-4 text-center text-xs text-emerald-700 font-semibold">
            ✓ Report submitted to community moderators.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#73726e]">
              CampusLoop is committed to student safety. Reports are reviewed by campus moderators.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Reason for Report *</label>
              <input
                type="text"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="e.g. Prohibited item, spam, abusive behavior"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason.trim() || reportMutation.isPending}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
