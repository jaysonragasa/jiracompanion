import {
  Ticket,
  ShieldAlert,
  Sun,
  Moon,
  Settings as SettingsIcon,
  RefreshCw,
} from "lucide-react";
import { useAppContext } from "../utils/AppContext";

export default function Navbar() {
  const {
    settings,
    setSettings,
    viewMode,
    setViewMode,
    refreshTickets,
    loading,
    error,
    setIsSettingsOpen,
  } = useAppContext();

  const toggleTheme = () => {
    setSettings({
      ...settings,
      theme: settings.theme === "dark" ? "light" : "dark",
    });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 py-4 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100 dark:shadow-none">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Jira Dashboard</h1>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${error ? "bg-red-500" : "bg-emerald-500"}`}
              ></span>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                {error ? "Connection Blocked" : "Cloud Sync Active"}
              </p>
              {error && (
                <div className="ml-1">
                  <span className="text-[9px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800 uppercase tracking-tighter flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Failed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle Theme"
          >
            {settings.theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
            {["cards", "board", "list", "graph"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === mode
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {mode === "graph" ? "GRAPH VIEW" : mode.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={refreshTickets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white rounded-lg transition-all font-bold text-sm shadow-md shadow-blue-100 dark:shadow-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
        </div>
      </div>
    </nav>
  );
}
