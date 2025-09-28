import { useState, useEffect, useCallback } from "react";
import WelcomeMessage from "./WelcomeMessage";
import OverlayCard from "./OverlayCard";
import AddEventForm from "./AddEventForm";
import AdminEventList from "./AdminEventList";
import { listEventsWithAttendance } from "../api.fb";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * admin controls dashboard
 * @returns
 */
export default function AdminDash({ user }) {
  const [eventsOrPlayers, setEventsOrPlayers] = useState(true);
  const [eventsVersion, setEventsVersion] = useState(0);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [editEvent, setEditEvent] = useState();
  const [pastEvents, setPastEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);

  const onEventChange = useCallback(() => {
    setEventsVersion((v) => v + 1); // bump -> children re-fetch
  }, []);
  const handlePlayers = () => {
    setEventsOrPlayers(false);
  };
  const handleEvents = () => {
    setEventsOrPlayers(true);
  };
  const navigate = useNavigate();
  const handleBackwards = async () => {
    navigate("/"); // redirect
  };

  const fetchData = async () => {
    const now = new Date();
    let list = await listEventsWithAttendance(undefined, now);
    setPastEvents(list.reverse());
    list = await listEventsWithAttendance(now);
    setFutureEvents(list);
  };
  useEffect(() => {
    fetchData();
  }, [eventsVersion]);

  return (
    //PAGE----------//
    <div className="w-full max-w-md min-h-screen flex flex-col  p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3 mt-1">
        <h1 className="text-xl  text-ibex-purple drop-shadow-lg">Admin</h1>
        <Home onClick={handleBackwards} />
      </div>
      <div className="flex items-center justify-center mb-3 mt-1">
        <button
          onClick={handleEvents}
          className={
            !eventsOrPlayers
              ? "w-1/2 mx-auto rounded-2xl bg-ibex-purple text-gray-50 px-10 py-1 text-sm font-semibold"
              : "w-1/2 mx-auto rounded-2xl bg-ibex-purple-dark text-gray-50 px-10 py-1 text-sm font-semibold"
          }
        >
          events
        </button>
        <button
          onClick={handlePlayers}
          className={
            eventsOrPlayers
              ? "w-1/2 mx-auto rounded-2xl bg-ibex-purple text-gray-50 px-10 py-1 text-sm font-semibold"
              : "w-1/2 mx-auto rounded-2xl bg-ibex-purple-dark text-gray-50 px-10 py-1 text-sm font-semibold"
          }
        >
          players
        </button>
      </div>
      {eventsOrPlayers && (
        <div>
          <button
            onClick={() => setNewEventOpen(true)}
            className="w-full mx-auto rounded-2xl bg-ibex-gold text-gray-50 px-10 py-1 text-sm font-semibold active:bg-yellow-300"
          >
            new event
          </button>
          <OverlayCard
            open={newEventOpen || !!editEvent}
            onClose={() => {
              setNewEventOpen(false);
              setEditEvent(null);
            }}
            title="Create New Event"
          >
            <AddEventForm
              event={editEvent}
              onCancel={() => {
                setNewEventOpen(false);
                setEditEvent(null);
              }}
              onSuccess={() => {
                setNewEventOpen(false);
                setEditEvent(null);
                onEventChange?.(); // if you have a refresh mechanism
              }}
            />
          </OverlayCard>

          <AdminEventList
            edit={true}
            list={futureEvents}
            title="Future Events"
            onGlobalRefresh={onEventChange}
            setEditEvent={setEditEvent}
          />
          <AdminEventList
            list={pastEvents}
            title="Past Events"
            onGlobalRefresh={onEventChange}
          />
        </div>
      )}
      {!eventsOrPlayers && <div>Players</div>}
    </div>
  );
}
