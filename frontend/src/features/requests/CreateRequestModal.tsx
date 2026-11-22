import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/common/Modal";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle } from "lucide-react";

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
      setError("Please sign in or switch to a demo persona to post a request.");
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
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
            Request Title *
          </label>
          <input
            {...register("title", { required: "Title is required", minLength: 3 })}
            type="text"
            placeholder="e.g., Need a 10-slide presentation reviewed and polished by tomorrow"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Category *</label>
            <select
              {...register("category")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
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
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Request Type *</label>
            <select
              {...register("request_type")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
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
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Arrangement</label>
            <select
              {...register("preferred_arrangement")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="any">Any / Open to Offers</option>
              <option value="paid">Paid (Stipend / Bounty)</option>
              <option value="free">Free / Peer Favor</option>
              <option value="exchange">Skill / Item Exchange</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Budget (₹) {selectedArrangement === "paid" ? "*" : "(optional)"}
            </label>
            <input
              {...register("budget")}
              type="number"
              min="0"
              placeholder={selectedArrangement === "free" ? "0 (Free)" : "e.g., 400"}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Deadline / When</label>
            <input
              {...register("deadline")}
              type="text"
              placeholder="e.g., Tomorrow 6 PM"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
            Detailed Description *
          </label>
          <textarea
            {...register("description", { required: "Description is required", minLength: 5 })}
            rows={4}
            placeholder="Explain what you need help with, requirements, and any specific expectations..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          ></textarea>
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#f0efee]">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            {isSubmitting ? "Publishing..." : "Publish Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
