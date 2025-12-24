import { Eye } from 'lucide-react';

export default function Logo({ className = "w-8 h-8", textSize = "text-2xl" }: { className?: string, textSize?: string }) {
  return (
    <div className="flex items-center gap-2 text-primary-600 font-bold">
      <div className="p-2 bg-primary-100 rounded-lg">
        <Eye className={className} />
      </div>
      <span className={textSize}>AURA Screening</span>
    </div>
  );
}