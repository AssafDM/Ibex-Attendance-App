import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AddEventForm from "./AddEventForm";
import { deleteEvent, switchTeam } from "../api.fb";
import AttList from "./AttList";
import { Bell, SquarePenIcon, Trash2 } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";

function useAutoHeight(open, deps = []) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    // Freeze current height to px
    const from = el.getBoundingClientRect().height;
    setHeight(from + "px");

    // Next frame, set to target height (0 when closed, scrollHeight when open)
    requestAnimationFrame(() => {
      const to = open ? el.scrollHeight : 0;
      setHeight(to + "px");
    });
    // when expand finishes, unlock to 'auto' so content changes (typing) won't clip
    const onEnd = () => open && setHeight("auto");
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
    // re-run when content likely changes size
  }, [open, ...deps]);

  return { innerRef, height };
}

export default function AdminEventBar({
  event,
  editable = false,
  openEvent,
  setOpenEvent,
  onEventChange,
}) {
  const date = event.startsAt.toLocaleDateString();
  const time = event.startsAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = event.startsAt.toLocaleDateString("en-US", { weekday: "long" });
  const rsvpCount = event.attendeeCount ?? 0;
  const closeAllFlags = () => {
    setDeleteBox(false);
    setBell(false);
    setOpenForm(false);
  };

  const open = openEvent === event.id;
  const [deleteBox, setDeleteBox] = useState(false);
  const [bell, setBell] = useState(false);
  const [title, SetTitle] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const functions = getFunctions();
  const sendNotification = httpsCallable(functions, "sendNotification");

  // Re-sync deleteBox when row opens/closes
  useEffect(() => {
    if (!open) {
      closeAllFlags();
    }
  }, [open]);

  // Single animated container: depends on whether we show delete box or form
  const { innerRef, height } = useAutoHeight(open, [deleteBox, bell]);

  return (
    <div
      className="rounded-3xl shadow-md mb-3 bg-ibex-purple text-white p-1"
      onClick={() => {
        // when clicking the bar, we enter editable mode
        setOpenEvent(open ? null : event.id);
      }}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="text-left">
          <p className="drop-shadow text-sm font-medium">{event.title}</p>
          <p className="drop-shadow text-sm font-medium">
            {day}, {date} - {time}
          </p>
        </div>

        <div className="items-right">
          {editable && ( // send notification button
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeAllFlags();
                  setOpenEvent(event.id);

                  setBell(true);
                }}
                className="shadow bg-ibex-gold text-white rounded-full mr-2 p-2 text-xs font-bold active:bg-red-300 transition"
              >
                {<Bell />}
              </button>
              <button
                className="shadow bg-ibex-gold text-white rounded-full mr-2 p-2 text-xs font-bold active:bg-red-300 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  closeAllFlags();
                  setOpenEvent(event.id);
                  setOpenForm(true);
                }}
              >
                <SquarePenIcon />
              </button>
            </>
          )}
          <button //delete event button
            onClick={(e) => {
              e.stopPropagation();
              closeAllFlags();
              setOpenEvent(event.id);
              setDeleteBox(true);
            }}
            className="shadow bg-red-500 text-white rounded-full ml-2 p-2 text-xs font-bold active:bg-red-300 transition"
          >
            {<Trash2 />}
          </button>
        </div>
      </div>

      {/* ONE animated container for both editable + delete states */}
      <div
        className="overflow-hidden transition-[height,opacity,margin] duration-400 ease-in-out"
        style={{
          height,
          opacity: open ? 1 : 0,
          marginTop: open ? "0.5rem" : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={innerRef}>
          {editable && open && !(openForm || bell || deleteBox) && (
            <div className="rounded-4xl bg-gray-100 pb-2">
              <AttList
                namesList={event.attendeeNames}
                onEventClick={(uid) => {
                  switchTeam(event.id, uid);
                  onEventChange();
                }}
              />
            </div>
          )}
          {editable &&
            openForm &&
            open && ( //editable event form expantion
              <div className="rounded-3xl bg-gray-100 text-gray-700 p-2">
                <AddEventForm
                  event={event}
                  onCancel={(e) => {
                    e?.stopPropagation?.();
                    setOpenEvent(null);
                  }}
                  onSuccess={() => {
                    setOpenEvent(null);
                    onEventChange?.();
                  }}
                />
              </div>
            )}

          {open &&
            deleteBox && ( //delete box expantion
              <div className="rounded-3xl bg-gray-100 text-gray-700 p-3">
                <p className="mb-3">
                  Are you sure you want to delete this event?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      setOpenEvent(null);
                      setDeleteBox(false);
                    }}
                    className="w-1/2 rounded-lg border px-4 py-2"
                  >
                    NO
                  </button>
                  <button
                    type="button"
                    className="w-1/2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                    onClick={() => {
                      deleteEvent(event.id);
                      setOpenEvent(null);
                      setDeleteBox(false);
                      onEventChange();
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          {open &&
            bell && ( //send notification expantion
              <div className="rounded-3xl bg-gray-100 text-gray-700 p-3">
                <p className="mb-3">Send reminder to everyone?</p>
                <textarea
                  id="title"
                  value={title}
                  onChange={(e) => SetTitle(e.target.value)}
                  className="now-resize w-full rounded-lg border px-3 py-2"
                  rows={1}
                  placeholder="Title"
                  style={{ resize: "none", overflow: "auto" }}
                  maxLength={35}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    sendNotification({
                      title: title,
                      event: event,
                    });
                    setOpenEvent(null);
                    setBell(false);
                  }}
                  className="w-full rounded-lg border-white text-white px-4 py-2 bg-ibex-gold"
                >
                  SEND
                </button>
              </div>
            )}
          {!editable && !deleteBox && (
            //past event features only players list
            <div className="rounded-4xl bg-gray-100 pb-2">
              <AttList namesList={event.attendeeNames} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
