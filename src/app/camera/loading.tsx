export default function CameraLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Camera Icon Animation */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-purple-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-8 bg-purple-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">Initializing Camera</p>
          <p className="text-gray-400 text-sm">Getting ready to detect your vibe...</p>
        </div>
      </div>
    </div>
  );
}
