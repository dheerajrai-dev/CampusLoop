import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/common/Modal";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  category: string;
  request_type: "item" | "academic_help" | "task" | "campus_help" | "other";
  budget?: number;
  preferred_arrangement: "free" | "paid" | "exchange" | "any";
  deadline?: string;
  description: string;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category: "Academic Help & Tutoring",
      request_type: "task",
      preferred_arrangement: "any",
    },
  });

  const selectedArrangement = watch("preferred_arrangement");

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated) {
      setError("Please sign in or select a demo user to post a request.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.createRequest({
        ...values,
        budget: values.budget ? Number(values.budget) : undefined,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a Campus Request" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Request Title *
          </label>
          <input
            {...register("title", { required: "Title is required", minLength: 3 })}
            type="text"
            placeholder="e.g., Need a 10-slide presentation polished by tomorrow"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              {...register("category")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="Academic Help & Tutoring">Academic Help & Tutoring</option>
              <option value="Design & Media">Design & Media</option>
              <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              <option value="Books & Notes">Books & Notes</option>
              <option value="Campus Assistance">Campus Assistance</option>
              <option value="Tech & Device Support">Tech & Device Support</option>
              <option value="Vehicles & Sports">Vehicles & Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type *</label>
            <select
              {...register("request_type")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="task">Specific Task / Project Help</option>
              <option value="item">Borrow / Need an Item</option>
              <option value="academic_help">Academic / Study Tutoring</option>
              <option value="campus_help">On-Campus Assistance / Pickup</option>
              <option value="other">Other Need</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Arrangement</label>
            <select
              {...register("preferred_arrangement")}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="any">Any / Negotiable</option>
              <option value="paid">Paid Gig</option>
              <option value="free">Free / Peer Favor</option>
              <option value="exchange">Resource Exchange</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Budget (₹) {selectedArrangement === "paid" ? "*" : "(optional)"}
            </label>
            <input
              {...register("budget")}
              type="number"
              min="0"
              placeholder="e.g., 400"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline / When</label>
            <input
              {...register("deadline")}
              type="text"
              placeholder="e.g., Tomorrow 6 PM"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description *
          </label>
          <textarea
            {...register("description", { required: "Description is required", minLength: 5 })}
            rows={4}
            placeholder="Explain exactly what you need help with, expectations, and any relevant details..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          ></textarea>
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
          >
            {isSubmitting ? "Posting..." : "Publish Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
