import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  X,
  Layout,
  User,
  Key,
  Info,
  Sun,
  Moon,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { useAppContext } from "../utils/AppContext";

export default function SettingsModal() {
  const {
    settings,
    setSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    refreshTickets,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<"credentials" | "appearance">(
    "credentials",
  );
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isSettingsOpen) {
      setLocalSettings(settings);
    }
  }, [isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setSettings(localSettings);
    setIsSettingsOpen(false);
    refreshTickets();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-transform duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-500" /> Dashboard
            Settings
          </h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[380px]">
          <div className="w-full md:w-48 bg-slate-50 dark:bg-zinc-950/50 border-r border-slate-100 dark:border-zinc-800 p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto">
            <button
              onClick={() => setActiveTab("credentials")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "credentials" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
            >
              Credentials
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "appearance" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
            >
              Appearance
            </button>
          </div>

          <div className="flex-grow p-6 overflow-y-auto">
            {activeTab === "credentials" && (
              <div className="space-y-5 block">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
                    Jira Domain
                  </label>
                  <div className="relative">
                    <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={localSettings.domain}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          domain: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
                    Auth Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={localSettings.email}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
                    API Token
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="password"
                      value={localSettings.token}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          token: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-colors"
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg flex gap-3 items-start mt-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    Generating a new token? Go to your Atlassian Account
                    Settings &gt; Security &gt; Create and manage API tokens.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6 block">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                    Color Theme
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setLocalSettings({ ...localSettings, theme: "light" })
                      }
                      className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors ${localSettings.theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />{" "}
                      <span className="text-sm font-bold">Light</span>
                    </button>
                    <button
                      onClick={() =>
                        setLocalSettings({ ...localSettings, theme: "dark" })
                      }
                      className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors ${localSettings.theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800"}`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />{" "}
                      <span className="text-sm font-bold">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-zinc-800"></div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                    Background Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={localSettings.bgImage}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          bgImage: e.target.value,
                        })
                      }
                      placeholder="https://example.com/wallpaper.jpg"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    Leave empty for solid background.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-end gap-3">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
