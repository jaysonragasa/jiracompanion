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

export async function submitWorklog(
  settings: Settings,
  ticketKey: string,
  timeSpent: string,
  comment: string
): Promise<void> {
  const { domain, email, token } = settings;

  if (!domain || !email || !token) {
    throw new Error("Missing Credentials: All fields are required.");
  }

  const response = await fetch('/api/jira/worklog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ domain, email, token, ticketKey, timeSpent, comment })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }
}

export function extractDescription(ticketOrDesc: any): string {
  let desc = ticketOrDesc;
  
  // Check if full ticket object was passed to locate the correct description field
  if (ticketOrDesc && ticketOrDesc.fields) {
      desc = ticketOrDesc.fields.description 
          || ticketOrDesc.fields.customfield_122269?.fields?.description 
          || ticketOrDesc.fields.customfield_122269?.fields?.desciption 
          || ticketOrDesc.fields.customfield_122269;
  }

  if (!desc) return 'No description provided.';
  if (typeof desc === 'string') return desc;
  
  // Jira ADF format parsing
  if (desc.content || Array.isArray(desc)) {
      let text = '';
      
      const processNode = (node: any) => {
          if (node.type === 'text') {
              text += node.text;
          } else if (node.type === 'mention') {
              text += `@${node.attrs?.text || 'user'} `;
          } else if (node.type === 'inlineCard' || node.type === 'blockCard') {
              text += `[🔗 ${node.attrs?.url || 'Link'}] `;
          } else if (node.type === 'mediaSingle' || node.type === 'mediaGroup') {
              text += '\n\n[ 🖼️ Image/Media Attachment ]\n\n';
          } else if (node.type === 'rule') {
              text += '\n---\n';
          } else if (node.type === 'hardBreak') {
              text += '\n';
          } else {
              // Pre-processing spacing for blocks
              if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'codeBlock') {
                  text += '\n';
              } else if (node.type === 'listItem') {
                  text += '\n • ';
              }
              
              // Recursively process children
              if (node.content && Array.isArray(node.content)) {
                  node.content.forEach(processNode);
              }
              
              // Post-processing spacing for blocks
              if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'codeBlock') {
                  text += '\n';
              }
          }
      };
      
      const contentArray = Array.isArray(desc) ? desc : desc.content;
      if (Array.isArray(contentArray)) {
          contentArray.forEach(processNode);
      }
      
      // Clean up excessive whitespace
      let cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
      return cleaned || 'No text content available.';
  }
  
  // Fallback for deeply nested or unknown structures
  try {
      return JSON.stringify(desc).substring(0, 200) + '...';
  } catch(e) {
      return 'Complex description available.';
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

