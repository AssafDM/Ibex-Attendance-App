import React from "react";
/**
 * lays out attending names in masonry style
 * @param {*} namesList - list of display name
 * @returns
 */
export default function AttList({ namesList }) {
  let count = 0;
  const on = namesList.length > 0;
  return (
    <>
      {on && (
        <div className="justify-center pt-2 flex flex-wrap gap-1 bg-transparent ">
          {namesList.map((p) => (
            <div
              className=" bg-ibex-gold rounded-2xl text-white font-medium text-sm w-max py-1 px-2"
              key={count++}
            >
              {p}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
