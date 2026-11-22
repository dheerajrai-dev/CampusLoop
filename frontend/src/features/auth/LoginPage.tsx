import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Repeat, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate("/explore");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    }
  };

  const handleDemoLogin = async (email: string) => {
    try {
      setError(null);
      await loginAsDemo(email);
      navigate("/explore");
    } catch (err: any) {
      setError(err.message || "Failed demo sign-in");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Repeat className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to CampusLoop</h1>
          <p className="text-xs text-slate-500">
            Connect with your campus community to borrow, exchange, and request help.
          </p>
        </div>

        {/* Demo 1-Click Login Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1-Click Demo Evaluation Sign-in:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("aarav@campus.edu")}
              className="px-3 py-2 text-xs font-semibold bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 shadow-xs transition-colors text-left"
            >
              <div className="font-bold text-slate-800">Aarav (Requester)</div>
              <div className="text-[10px] text-slate-400">CS Junior</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("meera@campus.edu")}
              className="px-3 py-2 text-xs font-semibold bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 shadow-xs transition-colors text-left"
            >
              <div className="font-bold text-slate-800">Meera (Provider)</div>
              <div className="text-[10px] text-slate-400">Design Senior</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="e.g. aarav@campus.edu"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          New student on campus?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
