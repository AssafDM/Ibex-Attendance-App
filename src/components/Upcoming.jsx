import AttendanceCard from "./AttendanceCard";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";

export default function Upcoming({ list, onGlobalRefresh }) {
  const LIMIT = 3;

  const canExpand = (list?.length ?? 0) > LIMIT;
  //handles the expanding mechanism
  const [isOpen, setIsOpen] = useState(false); // default open/closed

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
    <div className="bg-transparent">
      <div className="flex items-center justify-between  mt-1 bg-transparent">
        <div className="pl-3 text-left mt-3 ">
          <span className="font-semibold">Upcoming events:</span>
          {list.length == 0 && (
            <span className=" text-sm ">
              <br />
              No events to show
            </span>
          )}
        </div>
        {list.length > 3 ? (
          <button
            className="inline-flex mt-6 h-6 w-6 items-center justify-center"
            onClick={toggleOpen}
          >
            {isOpen ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
          </button>
        ) : (
          <></>
        )}
      </div>

      {showlist.map((e) => (
        <AttendanceCard
          key={e.id}
          event={e}
          isAttending={true}
          onGlobalRefresh={onGlobalRefresh}
        />
      ))}
    </div>
  );
}
