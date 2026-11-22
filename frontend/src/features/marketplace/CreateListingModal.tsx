import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../../components/common/Modal";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle } from "lucide-react";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  category: string;
  listing_mode: "sell" | "lend" | "giveaway" | "exchange";
  price?: number;
  condition?: "new" | "like_new" | "good" | "fair";
  pickup_area: string;
  description: string;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
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
      category: "Books & Notes",
      listing_mode: "sell",
      condition: "like_new",
      pickup_area: "Library Quad or Central Cafeteria",
    },
  });

  const selectedMode = watch("listing_mode");

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated) {
      setError("Please sign in or select a demo user to list an item.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.createListing({
        ...values,
        price: values.listing_mode === "sell" ? Number(values.price || 0) : 0,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List an Item on Campus Marketplace" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Item Title *</label>
          <input
            {...register("title", { required: "Title is required", minLength: 3 })}
            type="text"
            placeholder="e.g., Texas Instruments TI-84 Plus Graphing Calculator"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Exchange Mode *</label>
            <select
              {...register("listing_mode")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="sell">Sell (Direct Payment)</option>
              <option value="lend">Lend / Share (Temporary borrow)</option>
              <option value="giveaway">Free Giveaway (Pay it forward)</option>
              <option value="exchange">Exchange (Item for item)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Category *</label>
            <select
              {...register("category")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="Books & Notes">Books & Notes</option>
              <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              <option value="Campus Gear & Uniforms">Campus Gear & Uniforms</option>
              <option value="Vehicles & Sports">Vehicles & Sports</option>
              <option value="Hostel & Room Essentials">Hostel & Room Essentials</option>
              <option value="Stationery & Art Supplies">Stationery & Art Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedMode === "sell" ? (
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Price (₹) *</label>
              <input
                {...register("price", { required: selectedMode === "sell" })}
                type="number"
                min="0"
                placeholder="e.g., 1500"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-[#73726e] mb-1.5">Pricing</label>
              <div className="text-xs text-[#73726e] italic py-2.5">
                Price is ₹0 for {selectedMode} mode.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Condition</label>
            <select
              {...register("condition")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de] transition-colors"
            >
              <option value="like_new">Like New (barely used)</option>
              <option value="good">Good (functional, slight wear)</option>
              <option value="fair">Fair (well-used but working)</option>
              <option value="new">Brand New / Unopened</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
            Campus Pickup Area *
          </label>
          <input
            {...register("pickup_area", { required: "Pickup area is required" })}
            type="text"
            placeholder="e.g., Central Library Lobby or Hostel 3 Common Room"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#e6e6e6] focus:outline-none focus:border-[#0075de] transition-colors"
          />
          <p className="text-xs text-[#9b9a97] mt-1.5">
            Public campus areas only. Never share private room or personal residence addresses.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">Description *</label>
          <textarea
            {...register("description", { required: "Description is required", minLength: 5 })}
            rows={3}
            placeholder="Item details, edition, included accessories, or return expectations..."
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
            {isSubmitting ? "Listing..." : "Publish Item"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
