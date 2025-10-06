// src/api.mock.js
// Mock replacement for api.fb.js – uses Vercel /api endpoints & mock/db.json
// Works inside the demo branch (no Firebase imports needed)

const MAX_NAMES = 50;
const API = "/api";
const UID = "u1";

/* --------------------- Helpers --------------------- */
async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/* --------------------- Event listing --------------------- */
/** Mimics listEventsWithAttendance()  */
export const listEventsWithAttendance = async (from, to, max = 200) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from.toISOString());
  if (to) params.set("to", to.toISOString());

  const events = await jsonFetch(`${API}/events?${params}`);

  // Attach computed attendance data (count, names, etc.)
  return events.slice(0, max).map((e) => {
    const yes = e.attendees?.filter((a) => a.status === "yes") ?? [];
    const uid = UID;
    const attending = yes.some((a) => a.uid === uid);
    const attendeeNames = yes.slice(0, MAX_NAMES);
    return {
      ...e,
      startsAt: new Date(e.startsAt),
      endsAt: e.endsAt ? new Date(e.endsAt) : null,
      attendeeCount: yes.length,
      attending,
      attendeeNames,
    };
  });
};

/* --------------------- Attendance --------------------- */
export async function attend(eventId) {
  const user = await fetch(`/api/users?uid=${UID}`).then((r) => r.json());
  if (!user.uid) throw new Error("Not logged in");

  // pickBalancedTeam mock: alternate teams for realism
  const myTeam = Math.random() < 0.5 ? "gold" : "purple";

  await jsonFetch(`${API}/attendees`, {
    method: "POST",
    body: JSON.stringify({
      eventId,
      uid: user.uid,
      name: user.displayName,
      status: "yes",
      team: myTeam,
    }),
  });
}

export async function unattend(eventId) {
  const user = await fetch(`/api/users?uid=${UID}`).then((r) => r.json());
  if (!user.uid) throw new Error("Not logged in");

  await jsonFetch(`${API}/attendees`, {
    method: "POST",
    body: JSON.stringify({
      eventId,
      uid: user.uid,
      name: user.displayName,
      status: "no",
    }),
  });
}

export const countAttendees = async (eventId) => {
  const list = await jsonFetch(`${API}/attendees?eventId=${eventId}`);
  return list.length;
};

/* --------------------- Event management --------------------- */
export const createEvent = async ({
  title,
  startsAt = new Date(),
  endsAt = new Date(),
  location = "",
  notes = "",
}) => {
  if (!title || !startsAt) throw new Error("title and startsAt are required");
  const newEvent = await jsonFetch(`${API}/events`, {
    method: "POST",
    body: JSON.stringify({
      title,
      startsAt,
      endsAt,
      location,
      notes,
    }),
  });
  return newEvent.id;
};

export const updateEvent = async ({ eventId, patch }) => {
  await jsonFetch(`${API}/events`, {
    method: "PATCH",
    body: JSON.stringify({ eventId, patch }),
  });
};

export const deleteEvent = async (eventId) => {
  await jsonFetch(`${API}/events`, {
    method: "DELETE",
    body: JSON.stringify({ eventId }),
  });
};

/* --------------------- Teams --------------------- */
export const switchTeam = async (eventId, uid) => {
  const attendees = await jsonFetch(`${API}/attendees?eventId=${eventId}`);
  const me = attendees.find((a) => a.uid === uid);
  if (!me) return null;
  const newTeam = me.team === "gold" ? "purple" : "gold";
  await jsonFetch(`${API}/attendees`, {
    method: "POST",
    body: JSON.stringify({
      eventId,
      uid,
      name: me.name,
      status: "yes",
      team: newTeam,
    }),
  });
};

/* --------------------- Users --------------------- */
export async function updateUser(newData) {
  const user = await fetch(`/api/users?uid=${UID}`).then((r) => r.json());
  if (!user.uid) throw new Error("No user logged in");

  const updated = await jsonFetch(`${API}/users`, {
    method: "PATCH",
    body: JSON.stringify({
      uid: user.uid,
      displayName: newData?.displayName ?? user.displayName,
    }),
  });

  return updated;
}
