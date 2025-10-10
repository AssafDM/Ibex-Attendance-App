import {
  motion,
  useMotionValue,
  useTransform,
  useAnimate,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
function normalizeActions(actions) {
  if (!actions) return null;
  if (Array.isArray(actions) && actions.length === 0) return null;
  return actions;
}

export default function SwipeAction({
  children,
  leftActions = null,
  rightActions = null,
}) {
  leftActions = normalizeActions(leftActions);
  rightActions = normalizeActions(rightActions);
  const x = useMotionValue(0);
  const [scope, animate] = useAnimate();
  const [isOpen, setIsOpen] = useState(false);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);

  // measure both sides dynamically
  useEffect(() => {
    const measure = () => {
      setLeftWidth(leftRef.current?.offsetWidth || 0);
      setRightWidth(rightRef.current?.offsetWidth || 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (leftRef.current) ro.observe(leftRef.current);
    if (rightRef.current) ro.observe(rightRef.current);
    return () => ro.disconnect();
  }, [leftActions, rightActions]);

  // 🎨 independent transforms for each side
  const leftOpacity = useTransform(x, [-1, 0, leftWidth], [0, 0, 1]);
  const rightOpacity = useTransform(x, [-rightWidth, 0, 1], [1, 0, 0]);
  const leftScale = useTransform(x, [-1, 0, leftWidth], [0.8, 0.8, 1]);
  const rightScale = useTransform(x, [-rightWidth, 0, 1], [1, 0.8, 0.8]);
  const [openSide, setOpenSide] = useState(null);

  useEffect(() => {
    const unsub = x.on("change", (latest) => {
      setIsOpen(Math.abs(latest) > 10);
      if (leftWidth && latest > leftWidth) x.set(leftWidth);
      if (rightWidth && latest < -rightWidth) x.set(-rightWidth);
    });
    return unsub;
  }, [x, leftWidth, rightWidth]);

  const animateTo = async (target, side = null) => {
    await animate(x, target, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
    setOpenSide(side);
  };

  const handleDragEnd = (_, info) => {
    const dist = info.offset.x;
    const curr = x.get();

    // already open right → drag right closes it
    if (openSide === "right" && dist > 0) return animateTo(0, null);
    // already open left → drag left closes it
    if (openSide === "left" && dist < 0) return animateTo(0, null);

    // otherwise normal open/close behavior
    if (rightWidth && dist < -rightWidth / 2)
      return animateTo(-rightWidth, "right");
    if (leftWidth && dist > leftWidth / 2) return animateTo(leftWidth, "left");

    animateTo(0, null);
  };

  const handleActionClick = (cb) => async (e) => {
    e.stopPropagation();
    if (typeof cb === "function") await cb();
    animateTo(0);
  };

  return (
    <div ref={scope} className="relative overflow-visible isolate z-[5]">
      {/* LEFT actions */}
      {leftActions && (
        <motion.div
          className="absolute inset-0 flex justify-start items-center  z-0"
          style={{
            opacity: leftOpacity,
            scale: leftScale,
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <div ref={leftRef} className="flex items-center gap-1 px-2">
            {Array.isArray(leftActions)
              ? leftActions.map(
                  (a, i) =>
                    a && (
                      <div key={i} onClick={handleActionClick(a.props.onClick)}>
                        {a}
                      </div>
                    )
                )
              : leftActions}
          </div>
        </motion.div>
      )}

      {/* RIGHT actions */}
      {rightActions && (
        <motion.div
          className="absolute inset-0 flex justify-end items-center z-0"
          style={{
            opacity: rightOpacity,
            scale: rightScale,
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <div ref={rightRef} className="flex items-center gap-1 px-2">
            {Array.isArray(rightActions)
              ? rightActions.map(
                  (a, i) =>
                    a && (
                      <div key={i} onClick={handleActionClick(a.props.onClick)}>
                        {a}
                      </div>
                    )
                )
              : rightActions}
          </div>
        </motion.div>
      )}

      {/* FOREGROUND CARD */}
      <motion.div
        className="relative z-10 "
        drag="x"
        dragConstraints={{
          left: rightWidth ? -rightWidth : 0,
          right: leftWidth ? leftWidth : 0,
        }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={handleActionClick(children.props.onClick)}
      >
        {children}
      </motion.div>
    </div>
  );
}
