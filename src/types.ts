export interface JiraTicket {
  key: string;
  fields: {
    summary: string;
    description: any;
    status: { name: string };
    issuetype?: { name: string };
    priority?: { name: string };
    updated: string;
    labels?: string[];
    assignee?: { displayName: string; avatarUrls?: Record<string, string> };
    reporter?: { displayName: string; avatarUrls?: Record<string, string> };
    customfield_devEngineer?: { displayName: string };
    customfield_reviewer?: { displayName: string };
    customfield_qa?: { displayName: string };
    customfield_devOwner?: { displayName: string };
    issuelinks?: Array<{
      type: { inward: string; outward: string };
      inwardIssue?: JiraTicket;
      outwardIssue?: JiraTicket;
    }>;
  };
}

export interface Settings {
  domain: string;
  email: string;
  token: string;
  assignees: string;
  jql: string;
  bgImage: string;
  theme: "light" | "dark";
}
