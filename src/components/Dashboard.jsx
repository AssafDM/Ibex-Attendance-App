import { useState, useEffect, useCallback, useMemo } from "react";
import Unmarked from "./Unmarked";
import WelcomeMessage from "./WelcomeMessage";
import Upcoming from "./Upcoming";
import ErrorBoundary from "./ErrorBoundary";
import { listEventsWithAttendance } from "../api.fb";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { Settings, ShieldUser } from "lucide-react";
import OverlayCard from "./OverlayCard";
import SettingsMenu from "./settings";
import PullToRefresh from "pulltorefreshjs";

/*temporary*/
const today = new Date();
const end = new Date();
end.setMonth(today.getMonth() + 1);

export default function Dashboard({ events, setEvents, user }) {
  const { isAdmin, loading } = useAdmin();
  const [settingsOpen, setSettingsOpen] = useState(false); //settings open flag
  const [refreshVersion, setRefreshVersion] = useState(0); //counter to manage refetching
  const navigate = useNavigate();

  //for changes in events filter and save bt attending
  const attending = useMemo(() => events.filter((e) => e.attending), [events]);
  const unattending = useMemo(
    () => events.filter((e) => !e.attending),
    [events]
  );

  const onGlobalRefresh = useCallback(() => {
    setRefreshVersion((v) => v + 1); // bump → children re-fetch
  }, []);
  const handleadmin = async () => {
    navigate("/admindash");
  };

  /** fetch event on version changes */
  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await listEventsWithAttendance(today, end);
      if (!alive) return;
      setEvents(list);
    })();
    return () => {
      alive = false;
    };
  }, [refreshVersion, today, end]);

  PullToRefresh.init({
    onRefresh() {
      onGlobalRefresh();
    },
  });

  return (
    <div className="w-full max-w-md min-h-screen flex flex-col  p-2 bg-gray-50">
      <div className="flex items-center justify-between  mt-1">
        {/* top container- welcome+buttons */}
        <ErrorBoundary>
          <WelcomeMessage user={user} />
        </ErrorBoundary>
        <div className="flex flex-col items-end gap-2">
          <Settings
            onClick={() => {
              setSettingsOpen(true);
            }}
          />
          <OverlayCard //settings window
            open={settingsOpen}
            onClose={() => {
              setSettingsOpen(false);
            }}
          >
            <SettingsMenu user={user} />
          </OverlayCard>
          {!loading && isAdmin && <ShieldUser onClick={handleadmin} />}
        </div>
      </div>

      <div className="text-center drop-shadow-xl" /* event listings section */>
        <ErrorBoundary>
          <Upcoming list={attending} onGlobalRefresh={onGlobalRefresh} />
        </ErrorBoundary>
        <ErrorBoundary>
          <Unmarked list={unattending} onGlobalRefresh={onGlobalRefresh} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
