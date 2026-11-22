import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  Edit3,
  User as UserIcon,
  AlertTriangle,
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
        <div className="h-48 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Student Profile Not Found</h2>
        <Link to="/explore" className="text-indigo-600 font-semibold text-sm mt-3 inline-block">
          &larr; Back to Explore
        </Link>
      </div>
    );
  }

  const { user, stats } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-2xl sm:text-3xl shadow-sm border-2 border-white">
              {user.full_name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.full_name}</h1>
                {user.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"
                    title="Verified Campus Email"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                {user.department && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {user.department}
                  </span>
                )}
                {user.course && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
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
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                title="Report user"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {user.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600 leading-relaxed max-w-2xl">
            {user.bio}
          </div>
        )}
      </div>

      {/* Reputation & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.average_rating || "—"} / 5</div>
            <div className="text-xs text-slate-500 font-medium">Average Student Rating</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.completed_exchanges}</div>
            <div className="text-xs text-slate-500 font-medium">Completed Exchanges</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.total_reviews}</div>
            <div className="text-xs text-slate-500 font-medium">Peer Reviews Recorded</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Peer Reviews & Trust Signals</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {reviews.length}
          </span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No completed task reviews yet. Reviews appear after exchanges are marked complete by both participants.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev: Review) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-800">
                    {rev.reviewer?.full_name || "Campus Peer"}
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                {rev.comment && <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleSubmit((values) => updateProfileMutation.mutate(values))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              {...register("full_name")}
              type="text"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                {...register("department")}
                type="text"
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year / Semester</label>
              <input
                {...register("year_or_semester")}
                type="text"
                placeholder="e.g. Year 3 / Sem 5"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="Tell fellow students about your skills, major, or hobbies..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report Community Member">
        {reportSuccess ? (
          <div className="py-6 text-center text-xs text-emerald-700 font-semibold">
            ✓ Report submitted to community moderators.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              CampusLoop is committed to student safety. Reports are reviewed by campus moderators.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Report *</label>
              <input
                type="text"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="e.g. Prohibited item, spam, abusive behavior"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason.trim() || reportMutation.isPending}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
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
