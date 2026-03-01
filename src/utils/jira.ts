import { JiraTicket, Settings } from "../types";

export async function fetchJiraTickets(
  settings: Settings,
): Promise<JiraTicket[]> {
  const { domain, email, token, jql } = settings;

  if (!domain || !email || !token) {
    throw new Error("Missing Credentials: All fields are required.");
  }

  console.log("[Frontend] Initiating fetch to /api/jira/search", { domain, jql });

  try {
    const response = await fetch('/api/jira/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain, email, token, jql })
    });

    console.log(`[Frontend] Received response from backend. Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Frontend] Backend returned error:", errorData);
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Frontend] Successfully parsed JSON. Found ${data.issues?.length || 0} issues.`);
    return data.issues || [];
  } catch (error) {
    console.error("[Frontend] Fetch failed:", error);
    throw error;
  }
}

export function generateJqlFromAssignees(assigneesString: string): string {
  const assignees = assigneesString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (assignees.length === 0) return "order by updated DESC";
  const assigneeJql =
    assignees.length > 1
      ? `assignee in (${assignees.map((a) => `"${a}"`).join(",")})`
      : `assignee = "${assignees[0]}"`;
  return `${assigneeJql} order by updated DESC`;
}
