import {
  Calendar,
  ExternalLink,
  Flag,
  Layers,
  Link2,
  User,
} from "lucide-react";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import {
  extractDescription,
  getStatusStyle,
  getTypeStyle,
} from "../utils/theme";
import * as LucideIcons from "lucide-react";

export default function TicketCards({ tickets }: { tickets: JiraTicket[] }) {
  const { settings } = useAppContext();
  const isDark = settings.theme === "dark";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => {
        const status = getStatusStyle(ticket.fields.status.name);
        const updated = new Date(ticket.fields.updated).toLocaleDateString(
          undefined,
          { month: "short", day: "numeric" },
        );
        const typeStyle = getTypeStyle(
          ticket.fields.issuetype?.name || "Task",
          isDark,
        );
        const priority = ticket.fields.priority?.name || "Medium";
        const descriptionSnippet = extractDescription(
          ticket.fields.description,
        );

        const assigneeName =
          ticket.fields.assignee?.displayName || "Unassigned";
        const assigneeAvatar =
          ticket.fields.assignee?.avatarUrls?.["24x24"] ||
          ticket.fields.assignee?.avatarUrls?.["32x32"];

        const StatusIcon =
          (LucideIcons as any)[status.icon] || LucideIcons.Circle;

        return (
          <div
            key={ticket.key}
            className="group bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.bg} flex items-center gap-1.5 shadow-sm`}
              >
                <StatusIcon className={`w-4 h-4 ${status.colorClass}`} />
                {ticket.fields.status.name}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-50 dark:bg-zinc-800 rounded-md border border-slate-100 dark:border-zinc-700 uppercase">
                {ticket.key}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {ticket.fields.summary}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 mb-4 leading-relaxed flex-grow">
              {descriptionSnippet}
            </p>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 border px-1.5 py-0.5 rounded ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
              >
                <Layers className="w-3 h-3" />{" "}
                {ticket.fields.issuetype?.name || "Task"}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight flex items-center gap-1 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                <Flag className="w-3 h-3 text-slate-400" /> {priority}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
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
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                {assigneeName}
              </span>
            </div>

            {ticket.fields.issuelinks &&
              ticket.fields.issuelinks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/50">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Linked Items
                  </p>
                  <div className="space-y-1.5">
                    {ticket.fields.issuelinks.map((link, i) => {
                      const linkedTicket =
                        link.outwardIssue || link.inwardIssue;
                      if (!linkedTicket) return null;
                      const linkType = link.outwardIssue
                        ? link.type.outward
                        : link.type.inward;
                      const linkStatus =
                        linkedTicket.fields?.status?.name || "Unknown";
                      const linkStatusStyle = getStatusStyle(linkStatus);

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] bg-slate-50/50 dark:bg-zinc-800/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-700/50 group/link"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-grow mr-2">
                            <span className="text-slate-400 dark:text-zinc-500 font-medium italic shrink-0">
                              {linkType}:
                            </span>
                            <a
                              href={`https://${settings.domain}/browse/${linkedTicket.key}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                            >
                              {linkedTicket.key}
                            </a>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${linkStatusStyle.bg.replace("bg-", "bg-opacity-50 bg-")} shrink-0`}
                          >
                            {linkStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase">
                  {updated}
                </span>
              </div>
              <a
                href={`https://${settings.domain}/browse/${ticket.key}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-50 dark:bg-zinc-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:text-slate-400 rounded-xl transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
