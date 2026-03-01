import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { JiraTicket, Settings } from "../types";
import { fetchJiraTickets, generateJqlFromAssignees } from "./jira";

interface AppState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  tickets: JiraTicket[];
  loading: boolean;
  error: string | null;
  debugInfo: string | null;
  viewMode: "cards" | "board" | "list" | "graph";
  setViewMode: (mode: "cards" | "board" | "list" | "graph") => void;
  refreshTickets: () => void;
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
}

const defaultSettings: Settings = {
  domain: "",
  email: "",
  token: "",
  assignees: "",
  jql: "order by updated DESC",
  bgImage: "",
  theme: "dark",
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
  };

  const refreshTickets = async () => {
    if (!settings.domain || !settings.email || !settings.token) {
      setError("Missing Credentials: All fields are required.");
      setIsSettingsOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      const data = await fetchJiraTickets(settings);
      setTickets(data);
      resetFilters();
    } catch (err: any) {
      setError(err.message || "Failed to fetch tickets");
      if (err.message.includes("Jira API error")) {
        setDebugInfo(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, [settings.domain, settings.email, settings.token]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
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
