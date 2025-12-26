export function PageLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
