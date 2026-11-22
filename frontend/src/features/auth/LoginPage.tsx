import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Sparkles, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Modal } from "../../components/common/Modal";

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate("/explore");
    } catch (err: any) {
      setError(err.message || "Invalid campus email or password.");
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setIsDemoSubmitting(true);
      setError(null);
      await loginAsDemo();
      navigate("/explore");
    } catch (err: any) {
      setError(err.message || "Failed demo sign-in");
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const handleRequestReset = async () => {
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your campus email address.");
      return;
    }
    try {
      setIsForgotLoading(true);
      setForgotError(null);
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(res.message);
      if (res.demo_reset_code) {
        setResetCode(res.demo_reset_code);
      }
      setForgotStep("reset");
    } catch (err: any) {
      setForgotError(err.message || "Failed to process recovery request.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleExecuteReset = async () => {
    if (!resetCode.trim() || newPassword.length < 6) {
      setForgotError("Please provide the reset code and a new password (min 6 characters).");
      return;
    }
    try {
      setIsForgotLoading(true);
      setForgotError(null);
      const res = await api.resetPassword({
        email: forgotEmail.trim(),
        reset_code: resetCode.trim(),
        new_password: newPassword,
      });
      setForgotMessage(res.message);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep("request");
        setValue("email", forgotEmail);
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || "Failed to reset password.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4">
      <div className="paper-card p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-8 h-8 rounded-md bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xs tracking-tight mx-auto">
            CL
          </div>
          <h1 className="text-lg font-bold text-[#1a1a1a] tracking-tight">Sign In to CampusLoop</h1>
          <p className="text-xs text-[#73726e]">
            Your verified peer-to-peer campus exchange and request community.
          </p>
        </div>

        {/* Documented Single Demo Account Box */}
        <div className="panel-flat space-y-3 border border-[#e6e6e6]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0075de]" />
              Documented Testing Account
            </span>
            <span className="text-[10px] text-[#73726e]">Single Demo Account</span>
          </div>
          <p className="text-[11px] text-[#454340] leading-relaxed">
            Use the sample student account: <strong>demo@campus.edu</strong> / <strong>campusloop123</strong>
          </p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isDemoSubmitting}
            className="w-full py-1.5 px-3 text-xs font-semibold text-[#0075de] bg-white hover:bg-[#f6f5f4] rounded-md border border-[#e6e6e6] transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#0075de]" />
            <span>{isDemoSubmitting ? "Signing in..." : "1-Click Demo Sign In"}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Campus Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="e.g. demo@campus.edu"
              className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-semibold text-[#1a1a1a]">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotStep("request");
                  setForgotError(null);
                  setForgotMessage(null);
                }}
                className="text-[11px] text-[#0075de] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                {...register("password", { required: "Password is required" })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-3 pr-9 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73726e] hover:text-[#1a1a1a]"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-xs flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#73726e] pt-1 border-t border-[#f0efee]">
          New student on campus?{" "}
          <Link to="/register" className="text-[#0075de] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Password Recovery"
        maxWidth="sm"
      >
        <div className="space-y-3.5">
          {forgotError && (
            <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotMessage && (
            <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{forgotMessage}</span>
            </div>
          )}

          {forgotStep === "request" ? (
            <div className="space-y-3">
              <p className="text-xs text-[#73726e] leading-relaxed">
                Enter your campus email address to receive password recovery instructions and a verification code.
              </p>
              <div>
                <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Campus Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. demo@campus.edu"
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestReset}
                  disabled={isForgotLoading}
                  className="btn-primary text-xs"
                >
                  {isForgotLoading ? "Sending..." : "Send Reset Code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#73726e] leading-relaxed">
                Enter the recovery code and your new password.
              </p>
              <div>
                <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">Verification Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-md border border-[#e6e6e6] focus:outline-none focus:border-[#0075de]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForgotStep("request")}
                  className="btn-ghost text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  disabled={isForgotLoading}
                  className="btn-primary text-xs"
                >
                  {isForgotLoading ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
