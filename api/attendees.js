import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "mock/db.json");
const loadDB = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const saveDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export default function handler(req, res) {
  const db = loadDB();

  if (req.method === "POST") {
    const { eventId, uid, name, status, team } = req.body;
    const db = loadDB();

    // find event
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // find attendee
    const idx = event.attendees.findIndex((a) => a.uid === uid);

    if (idx >= 0) {
      // ✅ update existing
      event.attendees[idx] = { uid, name, status, team };
    } else {
      // ✅ create new
      event.attendees.push({ uid, name, status, team });
    }

    saveDB(db);
    return res.status(200).json(event.attendees);
  }

  if (req.method === "GET") {
    const { eventId } = req.query;
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    return res.status(200).json(event.attendees);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
