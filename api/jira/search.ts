export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Failed to parse body:", body);
      }
    }

    const { domain, email, token, jql } = body || {};
    
    if (!domain || !email || !token) {
      return res.status(400).json({ 
        error: "Missing credentials",
        receivedBody: typeof req.body === 'object' ? Object.keys(req.body) : typeof req.body
      });
    }

    const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');

    const jiraApiUrl = `https://${domain}/rest/api/3/search`;

    const response = await fetch(jiraApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Atlassian-Token': 'no-check'
      },
      body: JSON.stringify({
        jql: jql || '',
        maxResults: 100,
        fields: ["*all"]
      })
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
