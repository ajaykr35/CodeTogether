// Do panels ke beech ka divider. Drag karke panel ka size badalte hain.
// - orientation "vertical"   = khadi patti, left-right drag
// - orientation "horizontal" = leti patti, up-down drag
// - direction: 1 agar drag ke saath size badhe, -1 agar ulta
//   (jaise right panel: left drag karne par wo bada hota hai)

function ResizeHandle({ orientation, size, onSize, direction = 1, onReset, label }) {
  const isVertical = orientation === "vertical";

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // sirf left click
    e.preventDefault();

    const handle = e.currentTarget;
    const startPos = isVertical ? e.clientX : e.clientY;
    const startSize = size;
    const bodyClass = isVertical ? "ws-resizing-x" : "ws-resizing-y";

    // Pointer capture: mouse divider se bahar bhi chala jaye to drag chalta rahe
    handle.setPointerCapture(e.pointerId);
    document.body.classList.add(bodyClass);

    const move = (event) => {
      const pos = isVertical ? event.clientX : event.clientY;
      onSize(startSize + direction * (pos - startPos));
    };

    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      document.body.classList.remove(bodyClass);
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  };

  // Keyboard se resize: arrow keys
  const handleKeyDown = (e) => {
    const keys = isVertical
      ? { ArrowLeft: -20, ArrowRight: 20 }
      : { ArrowUp: -20, ArrowDown: 20 };

    if (keys[e.key] !== undefined) {
      e.preventDefault();
      onSize(size + direction * keys[e.key]);
    }
  };

  return (
    <div
      className={isVertical ? "ws-resizer ws-resizer-v" : "ws-resizer ws-resizer-h"}
      role="separator"
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      aria-label={label}
      title="Drag to resize. Double-click to reset."
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
    />
  );
}

export default ResizeHandle;