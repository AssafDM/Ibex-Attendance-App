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

      const attendeeNames = namesSnap.docs.map(
        (x) => x.data()?.name ?? "Unknown"
      );

      return {
        id: d.id,
        ...data,
        startsAt: data.startsAt.toDate(),
        attendeeCount: countSnap.data().count,
        attending: myAttendSnap.exists(),
        attendeeNames, // 👈 add it to your row
      };
    })
  );

  return rows;
};

// RSVP YES (takes current user automatically)
export const attend = async (eventId) => {
  const uid = auth.currentUser?.uid;
  const name = auth.currentUser.displayName;
  if (!uid) throw new Error("Not logged in");
  await setDoc(
    doc(db, "events", eventId, "attendees", uid),
    {
      name: name,
      status: "yes",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// CANCEL RSVP
export const unattend = async (eventId) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not logged in");
  await deleteDoc(doc(db, "events", eventId, "attendees", uid));
};

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
