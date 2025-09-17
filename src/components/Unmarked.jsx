import AttendanceCard from "./AttendanceCard";

export default function Unmarked({ list, onGlobalRefresh }) {
  const unattendedCount = list.length;

  return (
    <div className=" text-left bg-transparent">
      <div className="pl-3 text-left mt-3 ">
        <p className="font-semibold">
          There {unattendedCount == 1 ? "is" : "are"} {unattendedCount} unmarked
          {unattendedCount == 1 ? " practice" : " practices"}
        </p>
        <span className="text-sm">in the upcoming month</span>
      </div>

      {list.map((e) => (
        <AttendanceCard
          key={e.id}
          event={e}
          isAttending={false}
          onGlobalRefresh={onGlobalRefresh}
        />
      ))}
    </div>
  );
}
