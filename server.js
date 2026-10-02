// Run: ANTHROPIC_API_KEY=your_key node server.js   (Node 18+, no packages needed)
const http = require("http");
const fs = require("fs");
const path = require("path");

const SYS = "You are FinHire, a finance-careers assistant. You CANNOT see live job listings: never invent specific vacancies, job counts, or claim a company is hiring right now. When asked about openings: (1) say in one short line you can't see live counts; (2) list 5-8 companies that typically hire for that finance role in that location, one per line as 'Company - typical role - city'; (3) give one line of typical pay (INR LPA if India; assume India if no location given); (4) say the buttons below show current openings and totals. Plain text only, no markdown, short. Finance careers topics only.";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    let raw = "";
    for await (const c of req) raw += c;
    try {
      const { messages } = JSON.parse(raw);
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 700, system: SYS, messages: messages.slice(-12) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "API error");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text: d.content.map(b => b.text || "").join("") }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  const file = req.url === "/" ? "index.html" : req.url.slice(1);
  const full = path.join(__dirname, path.basename(file));
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(full)] || "text/plain" });
    res.end(data);
  });
}).listen(3000, () => console.log("FinHire running at http://localhost:3000"));
