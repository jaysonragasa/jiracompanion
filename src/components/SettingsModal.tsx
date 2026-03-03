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
  Timer,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppContext } from "../utils/AppContext";

export default function SettingsModal() {
  const {
    settings,
    setSettings,
    setPreviewSettings,
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
    } else {
      setPreviewSettings(null);
    }
  }, [isSettingsOpen, settings]);

  useEffect(() => {
    if (isSettingsOpen) {
      setPreviewSettings(localSettings);
    }
  }, [localSettings, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSave = () => {
    setSettings(localSettings);
    setPreviewSettings(null);
    setIsSettingsOpen(false);
    refreshTickets();
  };

  const handleCancel = () => {
    setPreviewSettings(null);
    setIsSettingsOpen(false);
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
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[420px]">
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

          <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                      Font Size
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {localSettings.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    step="1"
                    value={localSettings.fontSize}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 cursor-grab active:cursor-grabbing"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 px-1 mt-0.5 font-bold">
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>

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

                {localSettings.bgImage && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                          Background Overlay Opacity
                        </label>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {Math.round((localSettings.bgOpacity ?? 0.8) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={localSettings.bgOpacity ?? 0.8}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            bgOpacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-blue-600 cursor-grab active:cursor-grabbing"
                      />
                      <div className="flex justify-between text-[8px] text-slate-400 px-1 mt-0.5 font-bold">
                        <span>Transparent</span>
                        <span>Dark</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${localSettings.bgBlur ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                          {localSettings.bgBlur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Blur Background</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Apply a frosted glass effect</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setLocalSettings({ ...localSettings, bgBlur: !localSettings.bgBlur })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${localSettings.bgBlur ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.bgBlur ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                    Auto Refresh Interval
                  </label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <select
                      value={localSettings.autoRefresh}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          autoRefresh: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors appearance-none cursor-pointer"
                    >
                      <option value="0">Off (Manual Sync Only)</option>
                      <option value="30000">Every 30 Seconds</option>
                      <option value="60000">Every 1 Minute</option>
                      <option value="300000">Every 5 Minutes</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-end gap-3">
          <button
            onClick={handleCancel}
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
