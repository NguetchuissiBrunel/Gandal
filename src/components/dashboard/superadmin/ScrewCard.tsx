'use client';

interface ScrewCardProps {
  children: React.ReactNode;
  className?: string;
}

export function Screw({ className }: { className: string }) {
  return (
    <div className={`absolute w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.15)] flex items-center justify-center border border-slate-200/80 select-none z-10 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-slate-50 to-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center relative">
        <div className="w-1.5 h-[1.5px] bg-slate-500/70 rounded-[1px]" />
        <div className="absolute w-[1.5px] h-1.5 bg-slate-500/70 rounded-[1px]" />
      </div>
    </div>
  );
}

export default function ScrewCard({ children, className = '' }: ScrewCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
      <Screw className="top-1.5 left-1.5" />
      <Screw className="top-1.5 right-1.5" />
      <Screw className="bottom-1.5 left-1.5" />
      <Screw className="bottom-1.5 right-1.5" />
      {children}
    </div>
  );
}
