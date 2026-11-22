import React from "react";
import { Heart, ShieldCheck, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e6e6e6] mt-16 text-[#73726e] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-bold">
                CL
              </div>
              <span className="font-bold text-[#1a1a1a] text-base">CampusLoop</span>
            </div>
            <p className="text-[#73726e] leading-relaxed">
              Your campus. Your people. Your resources. A student-led exchange for textbooks, gadgets, peer tutoring, and campus tasks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider text-[11px]">Exchange Modes</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free & Giveaways</li>
              <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Short-term Borrowing & Lending</li>
              <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Resource & Skill Exchange</li>
              <li className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Direct Student Sales & Gigs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider text-[11px]">Campus Trust & Safety</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" /> Verified Student Profiles</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#73726e]" /> Public Campus Meeting Spots</li>
              <li>Two-sided completion confirmation</li>
              <li>Ratings & community moderation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#1a1a1a] mb-3 uppercase tracking-wider text-[11px]">MVP Policy</h4>
            <p className="text-[#73726e] leading-relaxed mb-2">
              CampusLoop does not process or hold payments in MVP. Users coordinate directly on campus. Prohibited and dangerous goods are strictly banned.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#e6e6e6] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#73726e]">
          <div>
            &copy; {new Date().getFullYear()} CampusLoop. Built for students, by students.
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" /> for university communities
          </div>
        </div>
      </div>
    </footer>
  );
};
