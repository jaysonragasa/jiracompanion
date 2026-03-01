import { useState, useMemo, useEffect, useRef } from "react";
import {
  Filter,
  Expand,
  RotateCcw,
  ChevronUp,
  Users,
  Code,
  Search,
  ChevronDown,
} from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { getWorkflowCategory } from "../utils/theme";
import { generateJqlFromAssignees } from "../utils/jira";

export default function Filters() {
  const {
    settings,
    setSettings,
    tickets,
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
  } = useAppContext();

  const [isExpanded, setIsExpanded] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [assigneesInput, setAssigneesInput] = useState(settings.assignees);
  const [jqlInput, setJqlInput] = useState(settings.jql);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssigneesChange = (val: string) => {
    setAssigneesInput(val);
    const newJql = generateJqlFromAssignees(val);
    setJqlInput(newJql);
    setSettings({ ...settings, assignees: val, jql: newJql });
  };

  const handleJqlChange = (val: string) => {
    setJqlInput(val);
    setSettings({ ...settings, jql: val });
  };

  const resetToAssignees = () => {
    const newJql = generateJqlFromAssignees(assigneesInput);
    setJqlInput(newJql);
    setSettings({ ...settings, jql: newJql });
  };

  const toggleWorkspaceFullscreen = () => {
    const contentArea = document.getElementById("dashboard-content");
    if (!document.fullscreenElement && contentArea) {
      contentArea.requestFullscreen().catch((err) => console.error(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const workflowOrder = ["To Do", "In Progress", "Review", "Test", "Done"];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workflowOrder.forEach((cat) => (counts[cat] = 0));
    tickets.forEach((t) => {
      const cat = getWorkflowCategory(t.fields.status.name);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [tickets]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const filterOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(tickets.map((t) => t.fields.status.name)),
    ).sort();
    const types = Array.from(
      new Set(tickets.map((t) => t.fields.issuetype?.name || "Task")),
    ).sort();
    const priorities = Array.from(
      new Set(tickets.map((t) => t.fields.priority?.name || "None")),
    ).sort();
    const labels = Array.from(
      new Set(tickets.flatMap((t) => t.fields.labels || [])),
    ).sort();
    return { statuses, types, priorities, labels };
  }, [tickets]);

  const toggleFilter = (type: string, value: string) => {
    if (type === "status") {
      setSelectedStatuses(
        selectedStatuses.includes(value)
          ? selectedStatuses.filter((v) => v !== value)
          : [...selectedStatuses, value],
      );
    } else if (type === "type") {
      setSelectedTypes(
        selectedTypes.includes(value)
          ? selectedTypes.filter((v) => v !== value)
          : [...selectedTypes, value],
      );
    } else if (type === "priority") {
      setSelectedPriorities(
        selectedPriorities.includes(value)
          ? selectedPriorities.filter((v) => v !== value)
          : [...selectedPriorities, value],
      );
    } else if (type === "label") {
      setSelectedLabels(
        selectedLabels.includes(value)
          ? selectedLabels.filter((v) => v !== value)
          : [...selectedLabels, value],
      );
    }
  };

  const renderDropdown = (
    id: string,
    label: string,
    options: string[],
    selected: string[],
    type: string,
  ) => {
    const isOpen = openDropdown === id;
    const btnText =
      selected.length === 0
        ? `All ${label}`
        : selected.length === 1
          ? selected[0]
          : `${selected.length} Selected`;
    const btnClass =
      selected.length > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : "";

    return (
      <div className="space-y-1 relative">
        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
          {label}
        </label>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(isOpen ? null : id);
            }}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-left text-sm flex items-center justify-between overflow-hidden transition-colors"
          >
            <span className={`truncate ${btnClass}`}>{btnText}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          </button>
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
              <div className="space-y-1">
                {options.length === 0 ? (
                  <div className="p-2 text-xs text-slate-400">
                    No options found
                  </div>
                ) : (
                  options.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(item)}
                        onChange={() => toggleFilter(type, item)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 dark:bg-zinc-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {item}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white/95 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800 rounded-2xl px-6 py-5 mb-8 shadow-sm transition-colors duration-200">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Filters & Search
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWorkspaceFullscreen();
            }}
            className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200 uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <Expand className="w-3 h-3" />
            <span>Fullscreen View</span>
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetFilters();
            }}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <ChevronUp
            className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform duration-300 ml-2 ${isExpanded ? "" : "rotate-180"}`}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-visible ${isExpanded ? "max-h-[1000px] opacity-100 mt-5" : "max-h-0 opacity-0 overflow-hidden pointer-events-none"}`}
        ref={dropdownRef}
      >
        <div className="mb-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block mb-2">
              Assignees (Comma separated)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={assigneesInput}
                onChange={(e) => handleAssigneesChange(e.target.value)}
                placeholder="user1, user2..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">
                Custom JQL Query
              </label>
              <button
                onClick={resetToAssignees}
                className="text-[9px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-tight flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Assignees
              </button>
            </div>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={jqlInput}
                onChange={(e) => handleJqlChange(e.target.value)}
                placeholder="e.g. project = PROJ AND status = Done"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-blue-600 dark:text-blue-400 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mb-5 pb-5 border-b border-slate-100 dark:border-zinc-800/50">
          <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block mb-2">
            Workflow Stages
          </label>
          <div className="flex flex-wrap gap-2">
            {workflowOrder.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const count = categoryCounts[cat];
              const activeClass = isSelected
                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-zinc-900 dark:text-slate-300 dark:border-zinc-700 dark:hover:bg-zinc-800";
              const badgeClass = isSelected
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400";

              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-sm flex items-center gap-2 ${activeClass}`}
                >
                  {cat}
                  <span
                    className={`${badgeClass} px-1.5 py-0.5 rounded-full text-[10px] leading-none`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Summary/Key..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
              />
            </div>
          </div>

          {renderDropdown(
            "status",
            "Specific Status",
            filterOptions.statuses,
            selectedStatuses,
            "status",
          )}
          {renderDropdown(
            "type",
            "Issue Type",
            filterOptions.types,
            selectedTypes,
            "type",
          )}
          {renderDropdown(
            "priority",
            "Priority",
            filterOptions.priorities,
            selectedPriorities,
            "priority",
          )}
          {renderDropdown(
            "label",
            "Labels",
            filterOptions.labels,
            selectedLabels,
            "label",
          )}
        </div>
      </div>
    </section>
  );
}
