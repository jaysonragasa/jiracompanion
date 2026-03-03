export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain, email, token, ticketKey, timeSpent, comment } = req.body;
    
    if (!domain || !email || !token || !ticketKey || !timeSpent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');
    const jiraApiUrl = `https://${domain}/rest/api/3/issue/${ticketKey}/worklog`;

    const body: any = {
      timeSpent: timeSpent
    };

    if (comment) {
      body.comment = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: comment
              }
            ]
          }
        ]
      };
    }

    const response = await fetch(jiraApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Atlassian-Token': 'no-check'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Jira API error: ${response.status}`, 
        details: responseText 
      });
    }

    res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
