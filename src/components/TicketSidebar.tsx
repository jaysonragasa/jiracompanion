import { ExternalLink, Flag, Link2, Users, X } from "lucide-react";
import { JiraTicket } from "../types";
import { useAppContext } from "../utils/AppContext";
import { getStatusStyle, getTypeStyle } from "../utils/theme";
import * as LucideIcons from "lucide-react";

export default function TicketSidebar({
  nodeId,
  onClose,
  allTickets,
}: {
  nodeId: string | null;
  onClose: () => void;
  allTickets: JiraTicket[];
}) {
  const { settings } = useAppContext();
  const isDark = settings.theme === "dark";

  if (!nodeId) {
    return (
      <div
        className={`absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-20 flex flex-col transition-transform duration-300 translate-x-full`}
      ></div>
    );
  }

  let ticket = allTickets.find((t) => t.key === nodeId);
  if (!ticket) {
    for (let t of allTickets) {
      if (t.fields.issuelinks) {
        const link = t.fields.issuelinks.find(
          (l) =>
            l.outwardIssue?.key === nodeId || l.inwardIssue?.key === nodeId,
        );
        if (link) {
          ticket = link.outwardIssue || link.inwardIssue;
          break;
        }
      }
    }
  }

  if (!ticket) return null;

  const status = getStatusStyle(ticket.fields.status?.name || "Unknown");
  const typeStyle = getTypeStyle(
    ticket.fields.issuetype?.name || "Task",
    isDark,
  );
  const type = ticket.fields.issuetype?.name || "Task";
  const priority = ticket.fields.priority?.name || "Default";

  const assignee = ticket.fields.assignee?.displayName || "Unassigned";
  const reporter = ticket.fields.reporter?.displayName || "Unknown";

  const devEngineer =
    ticket.fields.customfield_devEngineer?.displayName || assignee;
  const reviewer =
    ticket.fields.customfield_reviewer?.displayName || "Unassigned";
  const qa = ticket.fields.customfield_qa?.displayName || "Unassigned";
  const devOwner = ticket.fields.customfield_devOwner?.displayName || assignee;

  const StatusIcon = (LucideIcons as any)[status.icon] || LucideIcons.Circle;

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-20 flex flex-col transition-transform duration-300 translate-x-0`}
    >
      <div className="flex justify-end p-4 pb-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar px-6 pb-6 pt-2 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
            {ticket.key}
          </span>
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status.bg} flex items-center gap-1`}
          >
            <StatusIcon className={`w-3 h-3 ${status.colorClass}`} />{" "}
            {ticket.fields.status?.name || "Unknown"}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug mb-6">
          {ticket.fields.summary || "External Ticket"}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-1 border border-slate-200 dark:border-zinc-700 p-2 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
              Issue Type
            </p>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 px-1.5 py-0.5 rounded border inline-flex ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}
            >
              {type}
            </span>
          </div>
          <div className="col-span-1 border border-slate-200 dark:border-zinc-700 p-2 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
              Priority
            </p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-slate-400" /> {priority}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-3 bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-700 pb-2 mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> Personnel
          </p>

          <div className="grid grid-cols-2 gap-x-2 gap-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Assigned To
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={assignee}
              >
                {assignee}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Reporter
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={reporter}
              >
                {reporter}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Dev Engineer
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={devEngineer}
              >
                {devEngineer}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Dev Owner
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={devOwner}
              >
                {devOwner}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Reviewer
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={reviewer}
              >
                {reviewer}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                QA
              </p>
              <p
                className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                title={qa}
              >
                {qa}
              </p>
            </div>
          </div>
        </div>

        {ticket.fields.issuelinks && ticket.fields.issuelinks.length > 0 && (
          <div className="mb-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> Linked Issues
            </p>
            <div className="space-y-2">
              {ticket.fields.issuelinks.map((link, i) => {
                const linkedTicket = link.outwardIssue || link.inwardIssue;
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
                    className="flex flex-col p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
                        {linkType}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${linkStatusStyle.bg.replace("bg-", "bg-opacity-50 bg-")} shrink-0`}
                      >
                        {linkStatus}
                      </span>
                    </div>
                    <a
                      href={`https://${settings.domain}/browse/${linkedTicket.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {linkedTicket.key}
                    </a>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {linkedTicket.fields?.summary || "External Ticket"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <a
            href={`https://${settings.domain}/browse/${ticket.key}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            Open in Jira <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
