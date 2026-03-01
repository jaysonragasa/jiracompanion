export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain, email, token, jql } = req.body;
    
    if (!domain || !email || !token) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const auth = btoa(`${email.trim()}:${token.trim()}`);

    const params = new URLSearchParams({
      jql: jql || '',
      maxResults: "100",
      fields: "*all"
    });

    const jiraApiUrl = `https://${domain}/rest/api/3/search/jql?${params.toString()}`;

    const response = await fetch(jiraApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check'
      }
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
