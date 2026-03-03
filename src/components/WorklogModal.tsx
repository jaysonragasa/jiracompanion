import { useState } from "react";
import { Timer, X, Check } from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { submitWorklog } from "../utils/jira";

export default function WorklogModal() {
  const {
    settings,
    isWorklogOpen,
    worklogTicketKey,
    closeWorklogModal,
    tickets
  } = useAppContext();

  const [timeSpent, setTimeSpent] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success", message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isWorklogOpen || !worklogTicketKey) return null;

  const ticket = tickets.find(t => t.key === worklogTicketKey);
  const summary = ticket?.fields?.summary || "Unknown Ticket";

  const handleSubmit = async () => {
    if (!timeSpent.trim()) {
      setStatus({ type: "error", message: "Please enter time spent (e.g. 2h)." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await submitWorklog(settings, worklogTicketKey, timeSpent, comment);
      setStatus({ type: "success", message: "Worklog saved successfully!" });
      setTimeout(() => {
        closeWorklogModal();
        setTimeSpent("");
        setComment("");
        setStatus(null);
      }, 1500);
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Failed to save worklog." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-transform duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-500" /> Log Work
          </h2>
          <button
            onClick={closeWorklogModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight mb-1">Ticket</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">[{worklogTicketKey}] {summary}</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block mb-1">Time Spent (e.g. 2h, 1d 30m)</label>
            <input
              type="text"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="e.g. 2h 30m"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-tight block mb-1">Work Description (Optional)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          {status && (
            <div className={`text-xs font-bold px-3 py-2 rounded-lg ${status.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
              {status.message}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-end gap-3">
          <button
            onClick={closeWorklogModal}
            className="px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Worklog"}
          </button>
        </div>
      </div>
    </div>
  );
}
