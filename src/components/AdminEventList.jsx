import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import AdminEventBar from "./AdminEventBar";

export default function AdminEventList({
  list,
  title,
  onGlobalRefresh,
  edit = false,
}) {
  const LIMIT = 3;
  const canExpand = (list?.length ?? 0) > LIMIT;
  //handles the expanding mechanism
  const [isOpen, setIsOpen] = useState(false); // default open/closed
  const [editEvent, setEditEvent] = useState();

  const showlist = useMemo(
    () => (isOpen && list.length > LIMIT ? list : list.slice(0, LIMIT)),
    [isOpen, list]
  );

  const toggleOpen = () => {
    list.length <= LIMIT ? setIsOpen(false) : setIsOpen((o) => !o);
  };

  useEffect(() => {
    if (!canExpand && isOpen) setIsOpen(false); // force closed when <= LIMIT
  }, [canExpand]);

  return (
    <div className=" drop-shadow-lg">
      <div className="flex items-center justify-between mb-3 mt-1">
        <div>
          <h2 className="text-left mt-6 font-semibold">{title}</h2>
          {list.length == 0 && (
            <h2 className="text-sm text-left">No events to show</h2>
          )}
        </div>
        {list.length > 3 && (
          <button
            className="inline-flex mt-6 h-6 w-6 items-center justify-center"
            onClick={toggleOpen}
          >
            {isOpen ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
      {showlist.map((e) => (
        <AdminEventBar
          key={e.id}
          event={e}
          edit={edit}
          editEvent={editEvent}
          setEditEvent={setEditEvent}
          onClick={() => setEditEvent(e.id)}
          onEventChange={onGlobalRefresh}
        />
      ))}
    </div>
  );
}
