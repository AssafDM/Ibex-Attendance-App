import { useEffect, useRef, useState } from "react";
import { createEvent, updateEvent } from "../api.fb";
/**
 * form to add an event
 *
 * @returns jsx element
 */
export default function AddEventForm({ onSuccess, onCancel, event = null }) {
  const titleRef = useRef(null);
  const onSubmit = !!event ? updateEvent : createEvent;
  let d = new Date();
  d.setHours(20, 15, 0, 0);
  if (event) d = event.startsAt;
  d = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [title, setTitle] = useState(event ? event.title : "Evening Practice");
  const [when, setWhen] = useState(d); // value from <input type="datetime-local">

  const [location, setLocation] = useState("Sportek");
  const [notes, setNotes] = useState(event ? event.notes : "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // focus first field on mount
    const t = setTimeout(() => titleRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!title.trim()) return setErr("Title is required");
    if (!when) return setErr("Date & time are required");
    const patch = {
      title: title.trim(),
      startsAt: new Date(when),
      location: location.trim(),
      notes: notes.trim(),
    };

    let res;
    if (!!event) {
      const eventId = event.id;
      res = { eventId, patch };
    } else {
      res = patch;
    }

    try {
      setSaving(true);
      await onSubmit(res);
      setSaving(false);
      onSuccess?.(); // parent can close modal + refresh list
    } catch (e2) {
      setSaving(false);
      setErr(e2?.message || "Failed to create event");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {err && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      <div>
        <label htmlFor="Title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          ref={titleRef}
          id="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Evening Practice"
          required
        />
      </div>

      <div className="w-full ">
        <label htmlFor="Time" className="block text-sm font-medium mb-1">
          Date & Time
        </label>
        <input
          id="Time"
          type="datetime-local"
          step="900"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full  rounded-lg border px-3 py-2 appearance-none [-webkit-appearance:none] "
          required
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Location (optional)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Ganei Yehoshua Pitch B"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          rows={3}
          placeholder="Bring scrum caps; focus on backline plays."
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/2 rounded-lg border px-4 py-2"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-1/2 rounded-lg bg-ibex-purple px-4 py-2 font-semibold text-white active:bg-ibex-purple-dark disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Saving…" : "Confirm"}
        </button>
      </div>
    </form>
  );
}
