// Floating video window: screen par kahin bhi move karo, size badlo, minimise karo.
// Abhi sirf aapka apna video dikhta hai. Phase 8 mein teammates ke videos bhi yahin aayenge.

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_W = 180; // sabse chhota width
const MAX_W = 560; // sabse bada width
const DEFAULT_W = 220;
const STEP = 40; // + aur - button se kitna badhe
const HEADER_H = 34; // header ki height (px)
const MARGIN = 16;
const KEY_STEP = 20; // arrow key se kitna hile

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
const videoHeight = (width) => Math.round((width * 9) / 16); // 16:9 shape

function VideoWindow({ stream }) {
  const videoRef = useRef(null);
  const [pos, setPos] = useState(null); // { x, y } (null = abhi jagah tay nahi hui)
  const [width, setWidth] = useState(DEFAULT_W);
  const [minimized, setMinimized] = useState(false);

  const totalHeight = (w, isMin) => HEADER_H + (isMin ? 0 : videoHeight(w));

  // Default jagah: neeche-left (screen ke kinare se thoda andar)
  const placeDefault = () => {
    const w = DEFAULT_W;
    setWidth(w);
    setMinimized(false);
    setPos({
      x: MARGIN,
      y: Math.max(0, window.innerHeight - totalHeight(w, false) - 48),
    });
  };

  // Pehli baar camera on hone par jagah tay karo (screen par dikhne se pehle)
  useLayoutEffect(() => {
    if (stream && pos === null) placeDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  // Video stream ko <video> se jodna
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  // Window ko hamesha screen ke andar rakhna (size ya browser badalne par)
  useEffect(() => {
    if (pos === null) return undefined;

    const keepInside = () => {
      const w = clamp(width, MIN_W, Math.min(MAX_W, window.innerWidth - 8));
      if (w !== width) setWidth(w);
      setPos((p) =>
        p && {
          x: clamp(p.x, 0, window.innerWidth - w),
          y: clamp(p.y, 0, window.innerHeight - totalHeight(w, minimized)),
        }
      );
    };

    keepInside();
    window.addEventListener("resize", keepInside);
    return () => window.removeEventListener("resize", keepInside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, minimized, pos === null]);

  // Camera off hai to kuch nahi dikhana (position yaad rehti hai)
  if (!stream) return null;

  // ---------- Header se drag karke move karna ----------
  const handleDragStart = (e) => {
    if (e.target.closest("button")) return; // buttons par drag shuru nahi karna
    e.preventDefault();

    const header = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...pos };
    const w = width;
    const isMin = minimized;

    header.setPointerCapture(e.pointerId);

    const move = (event) => {
      setPos({
        x: clamp(start.x + event.clientX - startX, 0, window.innerWidth - w),
        y: clamp(start.y + event.clientY - startY, 0, window.innerHeight - totalHeight(w, isMin)),
      });
    };
    const stop = () => {
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerup", stop);
      header.removeEventListener("pointercancel", stop);
    };

    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", stop);
    header.addEventListener("pointercancel", stop);
  };

  // Header par arrow keys se move karna
  const handleHeaderKey = (e) => {
    const moves = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    if (!moves[e.key]) return;

    e.preventDefault();
    const [dx, dy] = moves[e.key];
    setPos((p) => ({
      x: clamp(p.x + dx, 0, window.innerWidth - width),
      y: clamp(p.y + dy, 0, window.innerHeight - totalHeight(width, minimized)),
    }));
  };

  // ---------- Corner se drag karke size badalna ----------
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const startX = e.clientX;
    const startW = width;
    const at = { ...pos };

    handle.setPointerCapture(e.pointerId);

    const move = (event) => {
      // Width itni hi ho ki window screen ke bahar na jaye (width aur height dono ke hisaab se)
      const maxByWidth = window.innerWidth - at.x;
      const maxByHeight = ((window.innerHeight - at.y - HEADER_H) * 16) / 9;
      const max = Math.min(MAX_W, maxByWidth, maxByHeight);
      setWidth(clamp(startW + event.clientX - startX, MIN_W, max));
    };
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  };

  // + aur - buttons
  const changeSize = (delta) => {
    const maxByHeight = ((window.innerHeight - pos.y - HEADER_H) * 16) / 9;
    const max = Math.min(MAX_W, window.innerWidth - pos.x, maxByHeight);
    setWidth((w) => clamp(w + delta, MIN_W, max));
  };

  return (
    <div
      className="vw"
      style={{ left: pos ? pos.x : 0, top: pos ? pos.y : 0, width }}
      role="dialog"
      aria-label="Your video"
    >
      <div
        className="vw-header"
        onPointerDown={handleDragStart}
        onDoubleClick={placeDefault}
        onKeyDown={handleHeaderKey}
        tabIndex={0}
        title="Drag to move. Double-click to reset."
      >
        <span className="vw-title">You</span>
        <div className="vw-buttons">
          <button type="button" onClick={() => changeSize(-STEP)} aria-label="Make video smaller" title="Smaller">
            &minus;
          </button>
          <button type="button" onClick={() => changeSize(STEP)} aria-label="Make video bigger" title="Bigger">
            +
          </button>
          <button
            type="button"
            onClick={() => setMinimized(!minimized)}
            aria-label={minimized ? "Show video" : "Minimise video"}
            title={minimized ? "Show video" : "Minimise"}
          >
            {minimized ? "\u25A1" : "_"}
          </button>
        </div>
      </div>

      {/* Minimise par chhupta hai, par video chalta rehta hai */}
      <div className={minimized ? "vw-body hidden" : "vw-body"} style={{ height: videoHeight(width) }}>
        <video ref={videoRef} autoPlay muted playsInline />
        <div
          className="vw-resize"
          onPointerDown={handleResizeStart}
          role="presentation"
          title="Drag to resize"
        />
      </div>
    </div>
  );
}

export default VideoWindow;