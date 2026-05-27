import { GraduationCap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-purple-100/60 bg-white/50 py-8">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-500">
              Quiz Attaché Territorial
            </span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} — Préparation concours IA
          </p>
        </div>
      </div>
    </footer>
  );
};
