import { TextSearch, ChevronUp, ChevronDown } from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { useEffect } from "react";

export default function QuickFindWidget() {
  const {
    findQuery,
    setFindQuery,
    findMatches,
    setFindMatches,
    findIndex,
    setFindIndex,
    tickets,
    viewMode
  } = useAppContext();

  useEffect(() => {
    if (!findQuery.trim()) {
      setFindMatches([]);
      setFindIndex(-1);
      return;
    }

    const query = findQuery.toLowerCase();
    const matches = tickets.filter(t => {
      const key = t.key.toLowerCase();
      const summary = (t.fields.summary || "").toLowerCase();
      // Basic description search for quick find
      const desc = typeof t.fields.description === 'string' ? t.fields.description.toLowerCase() : JSON.stringify(t.fields.description || "").toLowerCase();
      return key.includes(query) || summary.includes(query) || desc.includes(query);
    });

    setFindMatches(matches.map(m => m.key));
    if (matches.length > 0) {
      setFindIndex(0);
    } else {
      setFindIndex(-1);
    }
  }, [findQuery, tickets]);

  useEffect(() => {
    if (findMatches.length > 0 && findIndex >= 0) {
      const targetKey = findMatches[findIndex];
      if (viewMode !== 'graph') {
        const el = document.querySelector(`[data-ticket-key="${targetKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [findIndex, findMatches, viewMode]);

  const cycleFind = (direction: number) => {
    if (findMatches.length === 0) return;
    let newIndex = findIndex + direction;
    if (newIndex >= findMatches.length) newIndex = 0;
    if (newIndex < 0) newIndex = findMatches.length - 1;
    setFindIndex(newIndex);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md pl-4 pr-2 py-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-3 transition-transform duration-300">
      <TextSearch className="w-4 h-4 text-blue-500 shrink-0" />
      <input
        type="text"
        value={findQuery}
        onChange={(e) => setFindQuery(e.target.value)}
        placeholder="Find in view (Key, Summary, Desc)..."
        className="bg-transparent border-none outline-none text-sm w-48 sm:w-64 text-slate-800 dark:text-slate-200 placeholder-slate-400"
      />
      <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-700 pl-3">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap min-w-[36px] text-center">
          {findMatches.length > 0 ? `${findIndex + 1}/${findMatches.length}` : "0/0"}
        </span>
        <div className="flex flex-col bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
          <button
            onClick={() => cycleFind(-1)}
            className="px-1.5 py-0.5 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors border-b border-slate-200 dark:border-zinc-700"
            title="Previous Match"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => cycleFind(1)}
            className="px-1.5 py-0.5 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            title="Next Match"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
