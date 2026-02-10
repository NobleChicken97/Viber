export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Music Notes */}
        <div className="flex gap-2 justify-center items-end h-16">
          <div className="w-2 bg-purple-500 rounded-full animate-pulse" style={{ 
            height: '30%', 
            animationDelay: '0ms',
            animationDuration: '800ms'
          }}></div>
          <div className="w-2 bg-purple-400 rounded-full animate-pulse" style={{ 
            height: '60%', 
            animationDelay: '150ms',
            animationDuration: '800ms'
          }}></div>
          <div className="w-2 bg-purple-500 rounded-full animate-pulse" style={{ 
            height: '40%', 
            animationDelay: '300ms',
            animationDuration: '800ms'
          }}></div>
          <div className="w-2 bg-purple-400 rounded-full animate-pulse" style={{ 
            height: '70%', 
            animationDelay: '450ms',
            animationDuration: '800ms'
          }}></div>
          <div className="w-2 bg-purple-500 rounded-full animate-pulse" style={{ 
            height: '50%', 
            animationDelay: '600ms',
            animationDuration: '800ms'
          }}></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">Loading Your Vibe</p>
          <p className="text-gray-400 text-sm">Setting up the perfect playlist...</p>
        </div>
      </div>
    </div>
  );
}
