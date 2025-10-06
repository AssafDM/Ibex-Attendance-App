import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "mock/db.json");
const loadDB = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const saveDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export default function handler(req, res) {
  const db = loadDB();

  if (req.method === "POST") {
    const { eventId, uid, name, status } = req.body;
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const existing = event.attendees.find((a) => a.uid === uid);
    if (existing) existing.status = status;
    else event.attendees.push({ uid, name, status });

    saveDB(db);
    return res.status(200).json(event);
  }

  if (req.method === "GET") {
    const { eventId } = req.query;
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    return res.status(200).json(event.attendees);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
