import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "mock/db.json");

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const db = loadDB();

  // Handle GET /api/events?from=...&to=...
  if (req.method === "GET") {
    const { from, to } = req.query;
    let events = db.events;

    if (from || to) {
      const fromTime = from ? new Date(from).getTime() : 0;
      const toTime = to ? new Date(to).getTime() : Infinity;
      events = events.filter((e) => {
        const t = new Date(e.startsAt).getTime();
        return t >= fromTime && t <= toTime;
      });
    }

    return res.status(200).json(events);
  }

  // Handle POST /api/events (create)
  if (req.method === "POST") {
    const newEvent = {
      id: "ev" + Date.now(),
      ...req.body,
      attendees: [],
    };
    db.events.push(newEvent);
    saveDB(db);
    return res.status(201).json(newEvent);
  }

  if (req.method === "PATCH") {
    const { eventId, patch } = req.body;
    if (!eventId || !patch)
      return res.status(400).json({ error: "eventId and patch required" });

    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // ✅ merge patch into existing event (like Firestore merge: true)
    Object.assign(event, patch);
    saveDB(db);

    return res.status(200).json(event);
  }

  /* -------------------- DELETE event -------------------- */
  if (req.method === "DELETE") {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ error: "eventId required" });

    const index = db.events.findIndex((e) => e.id === eventId);
    if (index === -1) return res.status(404).json({ error: "Event not found" });

    db.events.splice(index, 1);
    saveDB(db);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
