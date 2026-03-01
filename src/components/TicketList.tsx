import { ChevronRight } from "lucide-react";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import { getStatusStyle, getTypeStyle } from "../utils/theme";
import * as LucideIcons from "lucide-react";

export default function TicketList({ tickets }: { tickets: JiraTicket[] }) {
  const { settings } = useAppContext();
  const isDark = settings.theme === "dark";

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
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {tickets.map((ticket) => {
              const status = getStatusStyle(ticket.fields.status.name);
              const typeStyle = getTypeStyle(
                ticket.fields.issuetype?.name || "Task",
                isDark,
              );
              const StatusIcon =
                (LucideIcons as any)[status.icon] || LucideIcons.Circle;

              return (
                <tr
                  key={ticket.key}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-400 dark:text-zinc-500 text-xs mb-1">
                      {ticket.key}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border inline-block ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
                    >
                      {ticket.fields.issuetype?.name || "Task"}
                    </span>
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
                    <a
                      href={`https://${settings.domain}/browse/${ticket.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold transition-colors"
                    >
                      VIEW <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
