export default function PlayerLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Pulsing Circle */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">Loading Player</p>
          <p className="text-gray-400 text-sm">Preparing your music session...</p>
        </div>
      </div>
    </div>
  );
}
