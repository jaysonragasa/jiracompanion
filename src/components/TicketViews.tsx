import { useMemo } from "react";
import { useAppContext } from "../utils/AppContext";
import { getWorkflowCategory } from "../utils/theme";
import TicketCards from "./TicketCards";
import TicketBoard from "./TicketBoard";
import TicketList from "./TicketList";
import TicketGraph from "./TicketGraph";
import { Search } from "lucide-react";

export default function TicketViews() {
  const {
    tickets,
    viewMode,
    filterText,
    selectedCategories,
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
    selectedLabels,
  } = useAppContext();

  const filteredTickets = useMemo(() => {
    const textFilter = filterText.toLowerCase();

    return tickets.filter((ticket) => {
      const matchesText =
        !textFilter ||
        ticket.key.toLowerCase().includes(textFilter) ||
        ticket.fields.summary.toLowerCase().includes(textFilter);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(ticket.fields.status.name);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(ticket.fields.issuetype?.name || "Task");

      const matchesPriority =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(ticket.fields.priority?.name || "None");

      const tLabels = ticket.fields.labels || [];
      const matchesLabels =
        selectedLabels.length === 0 ||
        selectedLabels.some((l) => tLabels.includes(l));

      const catName = getWorkflowCategory(ticket.fields.status.name);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(catName);

      return (
        matchesText &&
        matchesStatus &&
        matchesType &&
        matchesPriority &&
        matchesLabels &&
        matchesCategory
      );
    });
  }, [
    tickets,
    filterText,
    selectedCategories,
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
    selectedLabels,
  ]);

  if (filteredTickets.length === 0) {
    return (
      <div className="bg-white/95 dark:bg-zinc-900/80 backdrop-blur-md border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl py-24 text-center shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-slate-300 dark:text-zinc-700" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          No Tickets Found
        </h3>
        <p className="text-slate-500 dark:text-zinc-400 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
          {tickets.length === 0
            ? "No tasks currently assigned to this user."
            : "No tickets match your filter criteria."}
        </p>
      </div>
    );
  }

  switch (viewMode) {
    case "cards":
      return <TicketCards tickets={filteredTickets} />;
    case "board":
      return <TicketBoard tickets={filteredTickets} />;
    case "list":
      return <TicketList tickets={filteredTickets} />;
    case "graph":
      return <TicketGraph tickets={filteredTickets} />;
    default:
      return null;
  }
}
