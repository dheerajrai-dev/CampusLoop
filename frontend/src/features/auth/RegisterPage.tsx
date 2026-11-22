import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data: campuses = [] } = useQuery({
    queryKey: ["campuses"],
    queryFn: () => api.getCampuses(),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>();

  const passwordValue = watch("password");

  const onSubmit = async (values: any) => {
    if (values.password !== values.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError(null);
      await authRegister({
        email: values.email.trim(),
        password: values.password,
        full_name: values.full_name.trim(),
        campus_id: values.campus_id,
        department: values.department?.trim() || undefined,
        course: values.course?.trim() || undefined,
        year_or_semester: values.year_or_semester?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        show_phone: !!values.show_phone,
        whatsapp: values.whatsapp?.trim() || undefined,
        show_whatsapp: !!values.show_phone, // align with consent
      });
      navigate("/explore");
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 sm:py-10 px-4">
      <div className="paper-card p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xs tracking-tight mx-auto">
            CL
          </div>
          <h1 className="text-lg font-bold text-[#1a1a1a] tracking-tight">Join CampusLoop</h1>
          <p className="text-xs text-[#73726e]">
            Create your student profile and connect with verified peers on your campus.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Select Campus *</label>
            <select
              {...register("campus_id", { required: "Campus is required" })}
              className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de]"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email_domain ? `(@${c.email_domain})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Full Name *</label>
              <input
                {...register("full_name", { required: "Name is required", minLength: 2 })}
                type="text"
                placeholder="e.g. Alex Chen"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
              {errors.full_name && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.full_name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Campus Email *</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                placeholder="alex@campus.edu"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Password *</label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 chars" } })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  className="w-full pl-3 pr-8 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#73726e] hover:text-[#1a1a1a]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Confirm Password *</label>
              <input
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (val) => val === passwordValue || "Passwords do not match",
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
              {errors.confirm_password && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.confirm_password.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Department</label>
              <input
                {...register("department")}
                type="text"
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Course</label>
              <input
                {...register("course")}
                type="text"
                placeholder="e.g. B.Tech"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Year / Sem</label>
              <input
                {...register("year_or_semester")}
                type="text"
                placeholder="e.g. Year 2 / Sem 3"
                className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
            </div>
          </div>

          {/* Optional Voluntary Contact Info */}
          <div className="panel-flat space-y-2.5 border border-[#e6e6e6]">
            <span className="text-[13px] font-semibold text-[#1a1a1a] block">
              Contact Coordination (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-[#73726e] mb-0.5">Phone Number</label>
                <input
                  {...register("phone")}
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#73726e] mb-0.5">WhatsApp Number</label>
                <input
                  {...register("whatsapp")}
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#e6e6e6] bg-white focus:outline-none focus:border-[#0075de]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#454340] pt-1">
              <input
                {...register("show_phone")}
                type="checkbox"
                className="rounded border-[#e6e6e6] text-[#0075de] focus:ring-0"
              />
              <span>Allow verified campus peers to view this contact information on my posts.</span>
            </label>
          </div>

          <div className="panel-flat flex items-start gap-2 text-xs text-[#454340]">
            <ShieldCheck className="w-4 h-4 text-[#0075de] shrink-0 mt-0.5" />
            <span className="text-[11px]">
              Campus domain emails (@campus.edu or .edu) automatically receive a verified student badge. We never share your details without consent.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-xs flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? "Creating Account..." : "Complete Registration"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#73726e] pt-1 border-t border-[#f0efee]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0075de] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
