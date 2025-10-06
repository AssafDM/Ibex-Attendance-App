// src/api.fb.js
import {
  Timestamp,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  addDoc,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "./firebase";

const MIN_DATE = new Date(Date.UTC(1, 0, 1, 0, 0, 0));
const MAX_DATE = new Date(Date.UTC(9999, 11, 31, 23, 59, 59)); // ≈ year 9999
const MAX_NAMES = 50;

/** One-shot: list events in [from, to) with:
 *  - attendeeCount
 *  - attending (for current user)
 * - attendeeNames
 */
export const listEventsWithAttendance = async (
  from = MIN_DATE,
  to = MAX_DATE,
  max = 200
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not logged in");

  const qy = query(
    collection(db, "events"),
    where("startsAt", ">=", Timestamp.fromDate(from)),
    where("startsAt", "<", Timestamp.fromDate(to)),
    orderBy("startsAt", "asc"),
    limit(max)
  );

  const snap = await getDocs(qy);

  const rows = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      const attendeesRef = collection(db, "events", d.id, "attendees");

      const [countSnap, myAttendSnap, namesSnap] = await Promise.all([
        getCountFromServer(attendeesRef),
        getDoc(doc(attendeesRef, uid)),
        getDocs(
          query(
            attendeesRef,
            where("status", "==", "yes"),
            limit(MAX_NAMES) // keep it light
          )
        ),
      ]);

      const attendeeNames = namesSnap.docs.map((d) => {
        const data = d.data() || {};
        return {
          uid: d.id, // ← doc id = user uid
          name: data.name ?? "Unknown",
          team: data.team || null, // "gold" | "purple" | null
          status: data.status || "no",
        };
      });

      return {
        id: d.id,
        ...data,
        startsAt: data.startsAt.toDate(),
        attendeeCount: countSnap.data().count,
        attending: myAttendSnap.data()?.status == "yes",
        attendeeNames, // 👈 add it to your row
      };
    })
  );

  return rows;
};

// Count YES-per-team → pick smaller; random on tie
async function pickBalancedTeam(eventId) {
  const base = collection(db, "events", eventId, "attendees");
  const [goldSnap, purpleSnap] = await Promise.all([
    getCountFromServer(
      query(base, where("status", "==", "yes"), where("team", "==", "gold"))
    ),
    getCountFromServer(
      query(base, where("status", "==", "yes"), where("team", "==", "purple"))
    ),
  ]);
  const gold = goldSnap.data().count || 0;
  const purple = purpleSnap.data().count || 0;
  if (gold < purple) return "gold";
  if (purple < gold) return "purple";
  return Math.random() < 0.5 ? "gold" : "purple";
}

export async function attend(eventId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const attRef = doc(db, "events", eventId, "attendees", user.uid);
  const snap = await getDoc(attRef);
  const prev = snap.exists() ? snap.data() : null;

  // keep existing team; assign only if none
  const team = prev && prev.team ? prev.team : await pickBalancedTeam(eventId);

  await setDoc(
    attRef,
    {
      name: user.displayName || "",
      status: "yes",
      team, // sticky
      updatedAt: serverTimestamp(),
    },
    { merge: true } // never wipes team
  );
}

export async function unattend(eventId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  await setDoc(
    doc(db, "events", eventId, "attendees", user.uid),
    { status: "no", updatedAt: serverTimestamp() },
    { merge: true } // preserves team for next time
  );
}
// Count attendees
export const countAttendees = async (eventId) => {
  const cnt = await getCountFromServer(
    collection(db, "events", eventId, "attendees")
  );
  return cnt.data().count;
};

/** Create event (auto ID). Only admins will pass Firestore rules. */
export const createEvent = async ({
  title,
  startsAt = Date,
  location = "",
  notes = "",
}) => {
  const stamp = Timestamp.fromDate(startsAt);
  if (!title || !startsAt) throw new Error("title and startsAt are required");
  const ref = await addDoc(collection(db, "events"), {
    title,
    startsAt: stamp,
    location,
    notes,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/** Update/Upsert event by id (partial update). Admin-only via rules. */
export const updateEvent = async ({ eventId, patch }) => {
  if (!eventId) throw new Error("eventId required");
  await setDoc(
    doc(db, "events", eventId),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

/** Delete event + all attendee docs under it. Admin-only via rules. */
export const deleteEvent = async (eventId) => {
  if (!eventId) throw new Error("eventId required");

  // Recursively delete attendees (client-side loop, works fine for team sizes)
  const attendeesCol = collection(db, "events", eventId, "attendees");
  while (true) {
    const snap = await getDocs(query(attendeesCol, 300));
    if (snap.empty) break;
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }

  // Finally delete the event document
  await deleteDoc(doc(db, "events", eventId));
};
export const switchTeam = async (eventId, uid) => {
  const attRef = doc(db, "events", eventId, "attendees", uid);
  const snap = await getDoc(attRef);
  let team = "";

  if (!snap.exists() || snap.data()?.team == null) {
    return null; // no RSVP yet
  }

  const data = snap.data();
  team = data.team;
  const newTeam = team == "gold" ? "purple" : "gold";

  await setDoc(attRef, { team: newTeam }, { merge: true });
};

export async function updateUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  const userDoc = doc(db, "users", user.uid);

  await setDoc(
    userDoc,
    {
      uid: user.uid,
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      lastLogin: serverTimestamp(),
    },
    { merge: true }
  );
}
