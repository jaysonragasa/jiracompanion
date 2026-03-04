import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { JiraTicket, Settings } from "../types";
import { fetchJiraTickets, generateJqlFromAssignees } from "./jira";

interface AppState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  previewSettings: Settings | null;
  setPreviewSettings: (settings: Settings | null) => void;
  tickets: JiraTicket[];
  loading: boolean;
  error: string | null;
  debugInfo: string | null;
  viewMode: "cards" | "board" | "list" | "graph";
  setViewMode: (mode: "cards" | "board" | "list" | "graph") => void;
  refreshTickets: (silent?: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Filters
  filterText: string;
  setFilterText: (text: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedPriorities: string[];
  setSelectedPriorities: (priorities: string[]) => void;
  selectedLabels: string[];
  setSelectedLabels: (labels: string[]) => void;

  resetFilters: () => void;
  // Worklog
  isWorklogOpen: boolean;
  worklogTicketKey: string | null;
  openWorklogModal: (key: string) => void;
  closeWorklogModal: () => void;

  // Quick Find
  findQuery: string;
  setFindQuery: (query: string) => void;
  findMatches: string[];
  setFindMatches: (matches: string[]) => void;
  findIndex: number;
  setFindIndex: (index: number) => void;
}

const defaultSettings: Settings = {
  domain: "",
  email: "",
  token: "",
  assignees: "",
  jql: "order by updated DESC",
  bgImage: "",
  bgOpacity: 0.8,
  bgBlur: false,
  theme: "dark",
  fontSize: 14,
  autoRefresh: 30000,
  fishPondEnabled: false,
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const saved = localStorage.getItem("jira_settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [previewSettings, setPreviewSettings] = useState<Settings | null>(null);

  const [tickets, setTickets] = useState<JiraTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<
    "cards" | "board" | "list" | "graph"
  >("cards");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filters
  const [filterText, setFilterText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Worklog
  const [isWorklogOpen, setIsWorklogOpen] = useState(false);
  const [worklogTicketKey, setWorklogTicketKey] = useState<string | null>(null);

  const openWorklogModal = (key: string) => {
    setWorklogTicketKey(key);
    setIsWorklogOpen(true);
  };

  const closeWorklogModal = () => {
    setIsWorklogOpen(false);
    setWorklogTicketKey(null);
  };

  // Quick Find
  const [findQuery, setFindQuery] = useState("");
  const [findMatches, setFindMatches] = useState<string[]>([]);
  const [findIndex, setFindIndex] = useState(-1);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    localStorage.setItem("jira_settings", JSON.stringify(newSettings));
  };

  const resetFilters = () => {
    setFilterText("");
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedLabels([]);
    setFindQuery("");
    setFindMatches([]);
    setFindIndex(-1);
  };

  const refreshTickets = useCallback(async (silent: boolean = false) => {
    if (!settings.domain || !settings.email || !settings.token) {
      setError("Missing Credentials: All fields are required.");
      setIsSettingsOpen(true);
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    setError(null);
    setDebugInfo(null);

    try {
      const data = await fetchJiraTickets(settings);
      setTickets(data);
      // Don't reset filters on auto-refresh
    } catch (err: any) {
      setError(err.message || "Failed to fetch tickets");
      if (err.message.includes("Jira API error")) {
        setDebugInfo(err.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [settings.domain, settings.email, settings.token, settings.jql]);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (settings.autoRefresh > 0 && settings.domain && settings.email && settings.token) {
      intervalId = setInterval(() => {
        if (!document.hidden && document.hasFocus()) {
          refreshTickets(true);
        }
      }, settings.autoRefresh);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [settings.autoRefresh, settings.domain, settings.email, settings.token, refreshTickets]);

  useEffect(() => {
    const activeSettings = previewSettings || settings;
    const root = window.document.documentElement;
    if (activeSettings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme, previewSettings?.theme]);

  useEffect(() => {
    const activeSettings = previewSettings || settings;
    document.documentElement.style.fontSize = `${activeSettings.fontSize}px`;
  }, [settings.fontSize, previewSettings?.fontSize]);

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        previewSettings,
        setPreviewSettings,
        tickets,
        loading,
        error,
        debugInfo,
        viewMode,
        setViewMode,
        refreshTickets,
        isSettingsOpen,
        setIsSettingsOpen,
        filterText,
        setFilterText,
        selectedCategories,
        setSelectedCategories,
        selectedStatuses,
        setSelectedStatuses,
        selectedTypes,
        setSelectedTypes,
        selectedPriorities,
        setSelectedPriorities,
        selectedLabels,
        setSelectedLabels,
        resetFilters,
        isWorklogOpen,
        worklogTicketKey,
        openWorklogModal,
        closeWorklogModal,
        findQuery,
        setFindQuery,
        findMatches,
        setFindMatches,
        findIndex,
        setFindIndex,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
