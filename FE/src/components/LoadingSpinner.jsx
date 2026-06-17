import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center mt-12 py-8">
      <div className="relative">
        <Loader2 size={48} className="animate-spin text-brand-teal" />
        <div className="absolute inset-0 border-4 border-brand-teal-dark rounded-full opacity-20"></div>
      </div>
      <p className="mt-4 font-medium text-brand-teal-dark animate-pulse">Hệ thống đang trích xuất đặc trưng...</p>
    </div>
  );
}