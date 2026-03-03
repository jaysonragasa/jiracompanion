import { Calendar, ExternalLink, Layers, User } from "lucide-react";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import { getStatusStyle, getTypeStyle } from "../utils/theme";
import * as LucideIcons from "lucide-react";

export default function TicketBoard({ tickets }: { tickets: JiraTicket[] }) {
  const { settings, findMatches, findIndex, findQuery, openWorklogModal } = useAppContext();
  const isDark = settings.theme === "dark";

  const preferredOrder = ['open', 'approved', 'development', 'review', 'test', 'closed'];
  
  const statuses = Array.from(
    new Set(tickets.map((t) => t.fields.status.name)),
  ).sort((a, b) => {
    let idxA = preferredOrder.findIndex(p => a.toLowerCase().includes(p));
    let idxB = preferredOrder.findIndex(p => b.toLowerCase().includes(p));
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    if (idxA !== idxB) return idxA - idxB;
    return a.localeCompare(b);
  });

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start">
      {statuses.map((statusName) => {
        const columnTickets = tickets.filter(
          (t) => t.fields.status.name === statusName,
        );
        const statusStyle = getStatusStyle(statusName);
        const StatusIcon =
          (LucideIcons as any)[statusStyle.icon] || LucideIcons.Circle;

        return (
          <div
            key={statusName}
            className="flex-shrink-0 w-80 bg-slate-100/50 dark:bg-zinc-900/30 rounded-2xl p-4 flex flex-col gap-4 border border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between px-1">
              <h3
                className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 ${statusStyle.colorClass}`}
              >
                <StatusIcon className="w-4 h-4" /> {statusName}
              </h3>
              <span className="text-xs font-bold bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full shadow-sm">
                {columnTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {columnTickets.map((ticket) => {
                const updated = new Date(
                  ticket.fields.updated,
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const typeStyle = getTypeStyle(
                  ticket.fields.issuetype?.name || "Task",
                  isDark,
                );

                const assigneeName =
                  ticket.fields.assignee?.displayName || "Unassigned";
                const assigneeAvatar =
                  ticket.fields.assignee?.avatarUrls?.["24x24"] ||
                  ticket.fields.assignee?.avatarUrls?.["32x32"];

                const isMatch = findMatches.includes(ticket.key);
                const isFocused = findMatches[findIndex] === ticket.key;

                return (
                  <div
                    key={ticket.key}
                    data-ticket-key={ticket.key}
                    className={`ticket-element group bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-zinc-600 transition-all shadow-sm flex flex-col relative ${
                      findQuery && !isMatch ? 'opacity-20' : 'opacity-100'
                    } ${
                      isMatch ? 'ring-4 ring-amber-400 dark:ring-amber-500' : ''
                    } ${
                      isFocused ? 'ring-8 ring-blue-500 dark:ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                        {ticket.key}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 px-1.5 py-0.5 rounded border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
                      >
                        <Layers className="w-3 h-3" />{" "}
                        {ticket.fields.issuetype?.name || "Task"}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ticket.fields.summary}
                    </h4>

                    <div className="flex items-center gap-2 mb-3 mt-1">
                      {assigneeAvatar ? (
                        <img
                          src={assigneeAvatar}
                          alt={assigneeName}
                          className="w-5 h-5 rounded-full border border-slate-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                          <User className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate">
                        {assigneeName}
                      </span>
                    </div>

                    <div className="pt-3 mt-auto border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">
                          {updated}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorklogModal(ticket.key);
                          }}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-all"
                          title="Log Work"
                        >
                          <LucideIcons.Timer className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://${settings.domain}/browse/${ticket.key}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-zinc-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
