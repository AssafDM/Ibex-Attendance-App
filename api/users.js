import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "mock/db.json");

const loadDB = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const saveDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export default function handler(req, res) {
  const db = loadDB();

  // ✅ Get specific user by UID
  if (req.method === "GET") {
    const { uid } = req.query;

    if (uid) {
      const user = db.users.find((u) => u.uid === uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    }

    // If no uid, return all users
    return res.status(200).json(db.users);
  }

  // ✅ GET /api/users
  if (req.method === "GET") {
    const { uid } = req.query;
    if (uid) {
      const user = db.users.find((u) => u.uid === uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    }
    return res.status(200).json(db.users);
  }

  // ✏️ PATCH /api/users (update username)
  if (req.method === "PATCH") {
    const { uid, displayName } = req.body;
    if (!uid || !displayName)
      return res.status(400).json({ error: "uid and name are required" });

    const user = db.users.find((u) => u.uid === uid);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.displayName = displayName;
    saveDB(db);

    return res.status(200).json(user);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
