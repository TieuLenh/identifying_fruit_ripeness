export default function ImagePreview({ image }) {
  if (!image) return null;
  
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-brand-teal-dark shadow-[0_0_15px_rgba(29,205,159,0.1)] w-full max-w-md mx-auto bg-brand-dark relative group">
      <div className="absolute inset-0 bg-brand-teal/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <img 
        src={URL.createObjectURL(image)} 
        alt="Fruit Preview" 
        className="w-full h-auto object-contain max-h-[300px]" 
      />
    </div>
  );
}