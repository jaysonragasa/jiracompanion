export function getWorkflowCategory(statusName: string) {
  const s = statusName.toLowerCase();
  if (s.includes("done") || s.includes("closed") || s.includes("resolved"))
    return "Done";
  if (s.includes("test") || s.includes("qa")) return "Test";
  if (s.includes("review")) return "Review";
  if (s.includes("progress") || s.includes("doing")) return "In Progress";
  return "To Do";
}

export function getTypeStyle(typeName: string, isDark: boolean) {
  const t = typeName.toLowerCase();
  if (t.includes("bug") || t.includes("defect"))
    return isDark
      ? {
          bg: "bg-red-900/30",
          text: "text-red-400",
          border: "border-red-800",
          hexBg: "#7f1d1d",
          hexText: "#fca5a5",
          hexBorder: "#ef4444",
        }
      : {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          hexBg: "#fee2e2",
          hexText: "#b91c1c",
          hexBorder: "#ef4444",
        };
  else if (t.includes("story"))
    return isDark
      ? {
          bg: "bg-emerald-900/30",
          text: "text-emerald-400",
          border: "border-emerald-800",
          hexBg: "#064e3b",
          hexText: "#34d399",
          hexBorder: "#10b981",
        }
      : {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          hexBg: "#d1fae5",
          hexText: "#047857",
          hexBorder: "#10b981",
        };
  else if (t.includes("sub-task") || t.includes("subtask"))
    return isDark
      ? {
          bg: "bg-sky-900/30",
          text: "text-sky-400",
          border: "border-sky-800",
          hexBg: "#0c4a6e",
          hexText: "#38bdf8",
          hexBorder: "#0ea5e9",
        }
      : {
          bg: "bg-sky-100",
          text: "text-sky-700",
          border: "border-sky-200",
          hexBg: "#e0f2fe",
          hexText: "#0369a1",
          hexBorder: "#0ea5e9",
        };
  else if (t.includes("task"))
    return isDark
      ? {
          bg: "bg-blue-900/30",
          text: "text-blue-400",
          border: "border-blue-800",
          hexBg: "#1e3a8a",
          hexText: "#60a5fa",
          hexBorder: "#3b82f6",
        }
      : {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          hexBg: "#dbeafe",
          hexText: "#1d4ed8",
          hexBorder: "#3b82f6",
        };
  else if (t.includes("epic"))
    return isDark
      ? {
          bg: "bg-violet-900/30",
          text: "text-violet-400",
          border: "border-violet-800",
          hexBg: "#4c1d95",
          hexText: "#a78bfa",
          hexBorder: "#8b5cf6",
        }
      : {
          bg: "bg-violet-100",
          text: "text-violet-700",
          border: "border-violet-200",
          hexBg: "#ede9fe",
          hexText: "#6d28d9",
          hexBorder: "#8b5cf6",
        };
  else if (t.includes("enhancement"))
    return isDark
      ? {
          bg: "bg-lime-900/30",
          text: "text-lime-400",
          border: "border-lime-800",
          hexBg: "#3f6212",
          hexText: "#a3e635",
          hexBorder: "#84cc16",
        }
      : {
          bg: "bg-lime-100",
          text: "text-lime-700",
          border: "border-lime-200",
          hexBg: "#ecfccb",
          hexText: "#4d7c0f",
          hexBorder: "#84cc16",
        };
  else if (t.includes("support"))
    return isDark
      ? {
          bg: "bg-orange-900/30",
          text: "text-orange-400",
          border: "border-orange-800",
          hexBg: "#7c2d12",
          hexText: "#fb923c",
          hexBorder: "#f97316",
        }
      : {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-200",
          hexBg: "#ffedd5",
          hexText: "#c2410c",
          hexBorder: "#f97316",
        };

  return isDark
    ? {
        bg: "bg-slate-800",
        text: "text-slate-300",
        border: "border-slate-700",
        hexBg: "#1e293b",
        hexText: "#cbd5e1",
        hexBorder: "#64748b",
      }
    : {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
        hexBg: "#f1f5f9",
        hexText: "#475569",
        hexBorder: "#94a3b8",
      };
}

export function getStatusStyle(statusName: string) {
  const s = statusName.toLowerCase();
  if (s.includes("done") || s.includes("closed") || s.includes("resolved")) {
    return {
      icon: "CheckCircle2",
      colorClass: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    };
  }
  if (s.includes("progress") || s.includes("doing") || s.includes("review")) {
    return {
      icon: "Clock",
      colorClass: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    };
  }
  return {
    icon: "Circle",
    colorClass: "text-slate-400 dark:text-zinc-500",
    bg: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700",
  };
}

export function extractDescription(desc: any): string {
  if (!desc) return "No description provided.";
  if (typeof desc === "string") return desc;
  if (desc.type === "doc" && desc.content) {
    let text = "";
    const processNode = (node: any) => {
      if (node.type === "text") text += node.text + " ";
      if (node.content) node.content.forEach(processNode);
    };
    desc.content.forEach(processNode);
    return text.trim() || "No text content available.";
  }
  return "Complex description available.";
}
