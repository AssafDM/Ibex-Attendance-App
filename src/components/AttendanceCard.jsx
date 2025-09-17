import { useState } from "react";
import { attend, unattend } from "../api.fb";
import AttList from "./AttList";
import { CirclePlus, CircleX } from "lucide-react";

export default function AttendanceCard({
  event,
  isAttending = false,
  onGlobalRefresh,
}) {
  const date = event.startsAt.toLocaleDateString();
  const time = event.startsAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = event.startsAt.toLocaleDateString("en-US", { weekday: "long" });
  const rsvpCount = event.attendeeCount ?? 0;

  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen((o) => !o);
    if (!open) setDetailsOrPlayers(true);
  };
  const [detailsOrPlayers, setDetailsOrPlayers] = useState(true);
  const handlePlayers = () => {
    setDetailsOrPlayers(false);
  };
  const handleDetails = () => {
    setDetailsOrPlayers(true);
  };

  return (
    <div
      className="rounded-3xl shadow-md mb-3 bg-ibex-purple text-white" // shadow on stable wrapper
    >
      <div
        className="p-3 pb-2 flex items-center justify-between cursor-pointer"
        onClick={toggle}
      >
        <div className="text-left">
          <p className="drop-shadow font-semibold">{event.title}</p>
          <p className="drop-shadow text-sm font-medium">
            {day}, {date} - {time}
          </p>
          <p className="drop-shadow text-xs opacity-80">
            {rsvpCount} ibex have confirmed their attendance
          </p>
        </div>

        {isAttending ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await unattend(event.id);
              await onGlobalRefresh?.();
            }}
            className="shadow bg-red-400 text-white rounded-full p-2 text-xs font-bold active:bg-red-300 transition"
          >
            <CircleX size={30} />
          </button>
        ) : (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await attend(event.id);
              await onGlobalRefresh?.();
            }}
            className="shadow bg-yellow-400 text-white rounded-full p-2 items-center active:bg-yellow-300 transition"
          >
            <CirclePlus size={30} />
          </button>
        )}
      </div>

      {/* Animate only this inner container */}
      <div
        className={`p-1 overflow-hidden transition-[max-height,opacity,margin] origin-top duration-400 ease-in-out 
                    will-change-[max-height,opacity]
                    ${
                      open
                        ? "max-h-200 opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0"
                    }`}
      >
        <div
          className={`
    overflow-hidden
    transition-[max-height,padding,margin] origin-top duration-500 ease-in-out
    ${
      open
        ? "max-h-[600px] opacity-100 mt-2 py-2 px-2"
        : "max-h-0 opacity-100 mt-0 py-0 px-2"
    }  /* keep px so width doesn't jump */
    rounded-3xl bg-gray-100 text-gray-700 text-left
  `}
        >
          <p className="flex items-center justify-center">
            <button
              onClick={handleDetails}
              className={
                !detailsOrPlayers
                  ? "w-1/2 mx-auto rounded-2xl bg-ibex-purple text-gray-50 px-10 py-1 text-sm font-semibold"
                  : "w-1/2 mx-auto rounded-2xl bg-ibex-purple-dark text-gray-50 px-10 py-1 text-sm font-semibold"
              }
            >
              Details
            </button>
            <button
              onClick={handlePlayers}
              className={
                detailsOrPlayers
                  ? "w-1/2 mx-auto rounded-2xl bg-ibex-purple text-gray-50 px-10 py-1 text-sm font-semibold"
                  : "w-1/2 mx-auto rounded-2xl bg-ibex-purple-dark text-gray-50 px-10 py-1 text-sm font-semibold"
              }
            >
              Players
            </button>{" "}
          </p>
          {detailsOrPlayers && (
            <p className="rounded-3xl bg-ibex-purple-light text-sm  whitespace-pre-line mt-2 py-2 pl-4">
              {event.notes && (
                <>
                  <span className="font-medium">Details:</span>
                  <br />
                  {event.notes}
                  <br />
                </>
              )}
              <span className="font-medium">Location:</span> {event.location}
            </p>
          )}
          {!detailsOrPlayers && (
            <div>
              {" "}
              <AttList namesList={event.attendeeNames} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
