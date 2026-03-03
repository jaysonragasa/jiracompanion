import { useState, Fragment } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import { getStatusStyle, getTypeStyle } from "../utils/theme";
import * as LucideIcons from "lucide-react";

export default function TicketList({ tickets }: { tickets: JiraTicket[] }) {
  const { settings, findMatches, findIndex, findQuery, openWorklogModal } = useAppContext();
  const isDark = settings.theme === "dark";
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const toggleExpand = (ticketKey: string) => {
    setExpandedTickets(prev => {
      const next = new Set(prev);
      if (next.has(ticketKey)) {
        next.delete(ticketKey);
      } else {
        next.add(ticketKey);
      }
      return next;
    });
  };

  const renderTicketRow = (ticket: JiraTicket, isLinked: boolean = false, linkType?: string) => {
    const status = getStatusStyle(ticket.fields.status.name);
    const typeStyle = getTypeStyle(
      ticket.fields.issuetype?.name || "Task",
      isDark,
    );
    const StatusIcon =
      (LucideIcons as any)[status.icon] || LucideIcons.Circle;

    const isMatch = findMatches.includes(ticket.key);
    const isFocused = findMatches[findIndex] === ticket.key;
    const hasLinks = !isLinked && ticket.fields.issuelinks && ticket.fields.issuelinks.length > 0;
    const isExpanded = expandedTickets.has(ticket.key);

    return (
      <tr
        key={`${ticket.key}${isLinked ? '-linked' : ''}`}
        data-ticket-key={ticket.key}
        className={`ticket-element hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group relative ${
          findQuery && !isMatch && !isLinked ? 'opacity-20' : 'opacity-100'
        } ${
          isMatch && !isLinked ? 'bg-amber-50 dark:bg-amber-900/30' : ''
        } ${
          isFocused && !isLinked ? 'bg-blue-100 dark:bg-blue-900/50' : ''
        } ${isLinked ? 'bg-slate-50/50 dark:bg-zinc-900/30' : ''}`}
      >
        <td className={`px-6 py-4 ${isLinked ? 'pl-12' : ''}`}>
          <div className="flex items-center gap-2">
            {!isLinked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasLinks) toggleExpand(ticket.key);
                }}
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors ${hasLinks ? 'text-slate-500 dark:text-slate-400' : 'text-transparent cursor-default'}`}
                disabled={!hasLinks}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {isLinked && linkType && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 italic mr-2">
                {linkType}
              </span>
            )}
            <div>
              <div className="font-bold text-slate-400 dark:text-zinc-500 text-xs mb-1">
                {ticket.key}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border inline-block ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
              >
                {ticket.fields.issuetype?.name || "Task"}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm max-w-md">
            {ticket.fields.summary}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`w-3.5 h-3.5 ${status.colorClass}`}
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
              {ticket.fields.status.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openWorklogModal(ticket.key);
              }}
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold transition-colors"
              title="Log Work"
            >
              LOG <LucideIcons.Timer className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-slate-200 dark:bg-zinc-700"></div>
            <a
              href={`https://${settings.domain}/browse/${ticket.key}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold transition-colors"
              title="Open in Jira"
            >
              VIEW <LucideIcons.ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Key & Type
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Summary
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {tickets.map((ticket) => (
              <Fragment key={ticket.key}>
                {renderTicketRow(ticket)}
                {expandedTickets.has(ticket.key) && ticket.fields.issuelinks?.map((link, index) => {
                  const linkedTicket = link.inwardIssue || link.outwardIssue;
                  if (!linkedTicket) return null;
                  const linkType = link.type[link.inwardIssue ? 'inward' : 'outward'];
                  return renderTicketRow(linkedTicket, true, linkType);
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
