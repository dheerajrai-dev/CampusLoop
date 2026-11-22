import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/common/Modal";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle } from "lucide-react";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  category: string;
  pricing_type: "free" | "fixed" | "hourly" | "negotiable";
  price?: number;
  tags?: string;
  availability_note?: string;
  description: string;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
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
      pricing_type: "hourly",
      availability_note: "Available weekdays after 5 PM",
    },
  });

  const selectedPricingType = watch("pricing_type");

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated) {
      setError("Please sign in or select a demo user to publish a service.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.createService({
        ...values,
        price: values.price ? Number(values.price) : 0,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to publish service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Offer a Service or Skill" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Service Title *</label>
          <input
            {...register("title", { required: "Title is required", minLength: 3 })}
            type="text"
            placeholder="e.g., Python & Data Structures 1-on-1 Peer Tutoring"
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
              <option value="Tech & Device Support">Tech & Device Support</option>
              <option value="Campus Assistance">Campus Assistance</option>
              <option value="Writing & Proofreading">Writing & Proofreading</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Pricing Model *</label>
            <select
              {...register("pricing_type")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="hourly">Hourly Rate (₹/hr)</option>
              <option value="fixed">Fixed Per Task (₹)</option>
              <option value="negotiable">Negotiable</option>
              <option value="free">Free Peer Assistance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedPricingType !== "free" ? (
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Price (₹)</label>
              <input
                {...register("price")}
                type="number"
                min="0"
                placeholder={selectedPricingType === "hourly" ? "e.g., 300/hr" : "e.g., 500"}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-[#73726e] mb-1.5">Pricing</label>
              <div className="text-xs text-[#73726e] italic py-2.5">
                Free service for fellow students.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
              Availability Note
            </label>
            <input
              {...register("availability_note")}
              type="text"
              placeholder="e.g., Evenings after 5 PM, weekends"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
            Tags / Skills (comma-separated)
          </label>
          <input
            {...register("tags")}
            type="text"
            placeholder="e.g., python, algorithms, leetcode, tutoring"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
            Service Description *
          </label>
          <textarea
            {...register("description", { required: "Description is required", minLength: 5 })}
            rows={3}
            placeholder="Describe your experience, past coursework or projects, how you deliver help..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          ></textarea>
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
            {isSubmitting ? "Publishing..." : "Publish Service"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
