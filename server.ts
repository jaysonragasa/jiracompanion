import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/jira/search", async (req, res) => {
    try {
      console.log("[Backend] Received search request");
      const { domain, email, token, jql } = req.body;
      
      if (!domain || !email || !token) {
        console.error("[Backend] Missing credentials in request");
        return res.status(400).json({ error: "Missing credentials" });
      }

      console.log(`[Backend] Target Domain: ${domain}`);
      console.log(`[Backend] JQL: ${jql}`);

      const auth = btoa(`${email.trim()}:${token.trim()}`);

      const proxyUrl = "https://corsproxy.io/?";
      const params = new URLSearchParams({
        jql: jql || '',
        maxResults: "100",
        fields: "*all"
      });

      const jiraApiUrl = `https://${domain}/rest/api/3/search/jql?${params.toString()}`;
    
      const finalUrl = jiraApiUrl; // proxyUrl + encodeURIComponent(jiraApiUrl);

      console.log(`[Backend] Fetching from Jira API: ${finalUrl}`);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'X-Atlassian-Token': 'no-check'
        }
      });

      console.log(`[Backend] Jira API Response Status: ${response.status} ${response.statusText}`);

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`[Backend] Jira API Error Response:`, responseText.substring(0, 500));
        return res.status(response.status).json({ 
          error: `Jira API error: ${response.status}`, 
          details: responseText 
        });
      }

      console.log(`[Backend] Successfully fetched data from Jira. Payload size: ${responseText.length} bytes`);
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("[Backend] Internal Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
