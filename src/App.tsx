import { AppProvider, useAppContext } from "./utils/AppContext";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import TicketViews from "./components/TicketViews";
import SettingsModal from "./components/SettingsModal";
import WorklogModal from "./components/WorklogModal";
import QuickFindWidget from "./components/QuickFindWidget";
import { Lock, Ticket } from "lucide-react";

function Dashboard() {
  const { settings, previewSettings, loading, error, debugInfo } = useAppContext();
  const activeSettings = previewSettings || settings;

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen pb-20 transition-colors duration-200 relative">
      <div
        className={`fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat transition-all duration-500 ${activeSettings.bgImage ? "opacity-100" : "opacity-0"} ${activeSettings.bgBlur ? "blur-md scale-105" : ""}`}
        style={{
          backgroundImage: activeSettings.bgImage
            ? `url('${activeSettings.bgImage}')`
            : "none",
        }}
      ></div>
      <div
        className={`fixed inset-0 z-[-1] transition-colors duration-500 opacity-100`}
        style={{
          backgroundColor: activeSettings.bgImage
            ? activeSettings.theme === "dark"
              ? `rgba(0, 0, 0, ${activeSettings.bgOpacity ?? 0.8})`
              : `rgba(248, 250, 252, ${activeSettings.bgOpacity ?? 0.8})`
            : activeSettings.theme === "dark"
              ? "#000000"
              : "#f8fafc"
        }}
      ></div>

      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        <div id="dashboard-content" className="transition-all duration-300">
          <Filters />

          {error && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-zinc-900 shadow-lg">
              <div className="bg-red-500 dark:bg-red-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Security Exception
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">
                  {error}
                </p>
                {debugInfo && (
                  <div className="bg-slate-900 dark:bg-black rounded-lg p-3 relative group">
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {debugInfo}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 dark:border-zinc-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm tracking-widest animate-pulse uppercase">
                Querying Atlassian...
              </p>
            </div>
          ) : (
            !error && <TicketViews />
          )}
        </div>
      </main>

      <QuickFindWidget />
      <SettingsModal />
      <WorklogModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
