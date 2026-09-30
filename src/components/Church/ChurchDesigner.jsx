import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitIcon,
  GridOn as GridIcon,
  Save as SaveIcon,
  Send as SendIcon,
  TaskAlt as ApproveIcon,
  Block as RejectIcon,
  Visibility as VisibilityIcon,
  DoNotDisturbOn as BlockSeatIcon,
  CheckCircle as UnblockIcon,
  DeleteOutline as DeleteSeatIcon,
  Sell as LabelIcon,
  RotateRight as RotateIcon,
} from "@mui/icons-material";
import {
  fontBody,
  fontDisplay,
  ghostBtnSx,
  navy,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import { alertError, confirmAction, toastSuccess } from "../Meals/mealsShared";
import {
  churchApi,
  CROSS_WALL_LIST,
  crossFromWalls,
  crossWalls,
  emptyLayout,
  fromLocalInput,
  rowLetters,
  SeatGraphic,
  SHAPE_TYPES,
  ShapeGraphic,
  StatusChip,
  toLocalInput,
} from "./churchShared";
import {
  CopyFromDialog,
  DetailsForm,
  EmptyPlanCard,
  FloatingToolbar,
  PropertiesPanel,
  RelabelDialog,
  SeatBlockDialog,
  SectionTitle,
} from "./designerPanels";

const GRID = 10;
const CANVAS_PAD = 20;
// Leaves room for the floating tool rail so it never covers the plan when fitted.
const CANVAS_PAD_RAIL = 80;
const PANEL_WIDTH = 340;
const PANEL_GAP = 14;
// Horizontal room taken by the floating details panel, so the plan is fitted and centred beside it.
const PANEL_SPACE = PANEL_WIDTH + PANEL_GAP * 2;
const MAX_HISTORY = 80;
const DESIGN_COLORS = {
  available: { fill: "#ffffff", stroke: "#1B5EA8", text: "#0E3D73" },
  blocked: { fill: "#e5e7eb", stroke: "#9ca3af", text: "#6b7280" },
  booked: { fill: "#1e2858", stroke: "#1e2858", text: "#ffffff" },
  ticked: { fill: "#fee2e2", stroke: "#b91c1c", text: "#991b1b" },
};

let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function rowIndex(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function churchTemplate() {
  const shapes = [
    { id: uid("sh"), type: "room", x: 40, y: 40, w: 1120, h: 820, label: "Main sanctuary" },
    { id: uid("sh"), type: "stage", x: 390, y: 70, w: 420, h: 120, label: "Platform" },
    { id: uid("sh"), type: "pulpit", x: 565, y: 104, w: 70, h: 40, label: "Pulpit" },
    { id: uid("sh"), type: "altar", x: 540, y: 150, w: 120, h: 30, label: "Table" },
    { id: uid("sh"), type: "choir", x: 130, y: 80, w: 230, h: 110, label: "Choir" },
    { id: uid("sh"), type: "area", x: 840, y: 80, w: 230, h: 110, label: "Media desk" },
    { id: uid("sh"), type: "aisle", x: 565, y: 230, w: 70, h: 580, label: "Centre aisle" },
    { id: uid("sh"), type: "door", x: 530, y: 852, w: 140, h: 16, label: "Main entrance" },
    { id: uid("sh"), type: "door", x: 32, y: 440, w: 16, h: 100, label: "" },
    { id: uid("sh"), type: "door", x: 1152, y: 440, w: 16, h: 100, label: "" },
    { id: uid("sh"), type: "window", x: 200, y: 36, w: 120, h: 8, label: "" },
    { id: uid("sh"), type: "window", x: 880, y: 36, w: 120, h: 8, label: "" },
  ];
  const seats = [];
  const size = 28;
  const pitch = 36;
  for (let r = 0; r < 12; r += 1) {
    const y = 260 + r * 44;
    const row = rowLetters(r);
    for (let c = 0; c < 9; c += 1) {
      seats.push({ id: uid("s"), label: `${row}${c + 1}`, x: 230 + c * pitch + size / 2, y, section: "Left", group: null, bookable: true });
      seats.push({ id: uid("s"), label: `${row}${c + 10}`, x: 670 + c * pitch + size / 2, y, section: "Right", group: null, bookable: true });
    }
  }
  return { width: 1200, height: 900, seat_size: size, shapes, seats };
}

/**
 * Cruciform church: platform and choir in the top arm, seats in the nave and both side arms (transepts).
 * Coordinates line up with crossPoints() for a cross at x 40, y 40, 1320 × 1220.
 */
function crossChurchTemplate() {
  const shapes = [
    { id: uid("sh"), type: "cross", x: 40, y: 40, w: 1320, h: 1220, label: "Main sanctuary" },
    { id: uid("sh"), type: "stage", x: 486, y: 72, w: 428, h: 120, label: "Platform" },
    { id: uid("sh"), type: "pulpit", x: 665, y: 104, w: 70, h: 40, label: "Pulpit" },
    { id: uid("sh"), type: "altar", x: 640, y: 152, w: 120, h: 28, label: "Table" },
    { id: uid("sh"), type: "choir", x: 486, y: 204, w: 428, h: 88, label: "Choir" },
    { id: uid("sh"), type: "aisle", x: 665, y: 326, w: 70, h: 894, label: "Centre aisle" },
    { id: uid("sh"), type: "aisle", x: 452, y: 640, w: 496, h: 60, label: "Cross aisle" },
    { id: uid("sh"), type: "door", x: 630, y: 1252, w: 140, h: 16, label: "Main entrance" },
    { id: uid("sh"), type: "door", x: 32, y: 434, w: 16, h: 90, label: "" },
    { id: uid("sh"), type: "door", x: 1352, y: 434, w: 16, h: 90, label: "" },
    { id: uid("sh"), type: "window", x: 432, y: 120, w: 8, h: 110, label: "" },
    { id: uid("sh"), type: "window", x: 960, y: 120, w: 8, h: 110, label: "" },
    { id: uid("sh"), type: "window", x: 432, y: 820, w: 8, h: 120, label: "" },
    { id: uid("sh"), type: "window", x: 960, y: 820, w: 8, h: 120, label: "" },
  ];
  const seats = [];
  const size = 28;
  const pitch = 36;
  const rowPitch = 44;
  const firstY = 347;
  // Rows A–G line up with the side wings; rows H–S sit behind the cross aisle.
  const crossAisleAfter = 7;
  const backRowsY = 729;
  for (let r = 0; r < 19; r += 1) {
    const y = r < crossAisleAfter ? firstY + r * rowPitch : backRowsY + (r - crossAisleAfter) * rowPitch;
    const row = rowLetters(r);
    for (let c = 0; c < 5; c += 1) {
      seats.push({ id: uid("s"), label: `${row}${c + 1}`, x: 491 + c * pitch, y, section: "Nave left", group: null, bookable: true });
      seats.push({ id: uid("s"), label: `${row}${c + 6}`, x: 765 + c * pitch, y, section: "Nave right", group: null, bookable: true });
    }
  }
  for (let r = 0; r < 7; r += 1) {
    const y = firstY + r * rowPitch;
    const row = rowLetters(r);
    for (let c = 0; c < 9; c += 1) {
      seats.push({ id: uid("s"), label: `L${row}${c + 1}`, x: 94 + c * pitch, y, section: "Left wing", group: null, bookable: true });
      seats.push({ id: uid("s"), label: `R${row}${c + 1}`, x: 1018 + c * pitch, y, section: "Right wing", group: null, bookable: true });
    }
  }
  return { width: 1400, height: 1300, seat_size: size, shapes, seats };
}

const HALL_TYPES = new Set(["room", "cross"]);
// When a hall is resized these keep their size; only their position follows the walls.
const FIXED_SIZE_TYPES = new Set(["door", "window", "pillar", "pulpit", "label"]);
// Doors and windows sit on the wall line, slightly outside the hall's box, but still belong to it.
const WALL_REACH = 24;
const PLAN_MARGIN = 40;
const HANDLE_CURSORS = { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" };

/** Seats and building parts that are inside (or on the walls of) a hall. */
function tickSeats(sel, ids, on) {
  const set = new Set(sel.seats);
  ids.forEach((sid) => (on ? set.add(sid) : set.delete(sid)));
  return { shapes: [], seats: [...set] };
}

function hallContents(l, hall) {
  const near = (x, y) =>
    x >= hall.x - WALL_REACH && x <= hall.x + hall.w + WALL_REACH && y >= hall.y - WALL_REACH && y <= hall.y + hall.h + WALL_REACH;
  return {
    seats: l.seats.filter((s) => near(s.x, s.y)).map((s) => s.id),
    shapes: l.shapes.filter((s) => !HALL_TYPES.has(s.type) && near(s.x + s.w / 2, s.y + s.h / 2)).map((s) => s.id),
  };
}

/** Grows the plan so nothing sticks out past its right or bottom edge. */
function growPlanToFit(l) {
  const half = l.seat_size / 2;
  let right = 0;
  let bottom = 0;
  for (const s of l.shapes) {
    right = Math.max(right, s.x + s.w);
    bottom = Math.max(bottom, s.y + s.h);
  }
  for (const s of l.seats) {
    right = Math.max(right, s.x + half);
    bottom = Math.max(bottom, s.y + half);
  }
  const width = Math.min(6000, Math.max(l.width, Math.ceil((right + PLAN_MARGIN) / 10) * 10));
  const height = Math.min(6000, Math.max(l.height, Math.ceil((bottom + PLAN_MARGIN) / 10) * 10));
  return width === l.width && height === l.height ? l : { ...l, width, height };
}

/** Small floating bar above a selected building part (not the church walls): rotate and delete. */
function ShapeBar({ shape, zoom, onRotate, onDelete }) {
  const cx = (shape.x + shape.w / 2) * zoom;
  const top = shape.y * zoom - 12;
  const below = top < 50;
  const btn = { minWidth: 0, px: 1.1, py: 0.45, borderRadius: "9px", fontFamily: fontBody, fontWeight: 700, fontSize: "0.76rem", textTransform: "none" };
  return (
    <Box
      onPointerDown={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        left: cx,
        top: below ? (shape.y + shape.h) * zoom + 12 : top,
        transform: below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 5,
        display: "flex",
        gap: 0.5,
        p: 0.6,
        bgcolor: "#fff",
        borderRadius: "12px",
        border: "1px solid rgba(27,94,168,0.18)",
        boxShadow: "0 14px 34px -12px rgba(20,26,58,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      <Tooltip title="Turn it a quarter, e.g. make an aisle run across (R)">
        <Button size="small" onClick={onRotate} startIcon={<RotateIcon sx={{ fontSize: 16 }} />} sx={{ ...btn, color: primaryGreen, bgcolor: "rgba(27,94,168,0.07)" }}>
          Rotate
        </Button>
      </Tooltip>
      <Tooltip title="Delete (Del)">
        <Button size="small" onClick={onDelete} sx={{ ...btn, color: "#b91c1c", bgcolor: "rgba(185,28,28,0.07)" }}>
          <DeleteSeatIcon sx={{ fontSize: 17 }} />
        </Button>
      </Tooltip>
    </Box>
  );
}

// Walls of a cross can't get closer than this, so arms never collapse or turn inside out.
const MIN_WALL_GAP = 40;
// Doors and windows whose centre is this close to a wall line travel with that wall.
const WALL_ATTACH = 14;

/** Where a cross wall line may move to, given where the other walls are. */
function clampCrossWall(a, param, v) {
  const g = MIN_WALL_GAP;
  const limits = {
    top: [0, Math.min(a.lt, a.rt) - g],
    bottom: [Math.max(a.lb, a.rb) + g, Infinity],
    left: [0, Math.min(a.hl, a.fl) - g],
    right: [Math.max(a.hr, a.fr) + g, Infinity],
    hl: [a.left + g, a.hr - g],
    hr: [a.hl + g, a.right - g],
    fl: [a.left + g, a.fr - g],
    fr: [a.fl + g, a.right - g],
    lt: [a.top + g, a.lb - g],
    lb: [a.lt + g, a.bottom - g],
    rt: [a.top + g, a.rb - g],
    rb: [a.rt + g, a.bottom - g],
  }[param];
  return Math.min(Math.max(v, limits[0]), limits[1]);
}

/** Doors and windows sitting on one wall segment of a cross. */
function itemsOnWall(l, walls, wall) {
  const [x1, y1] = [walls[wall.from[0]], walls[wall.from[1]]];
  const [x2, y2] = [walls[wall.to[0]], walls[wall.to[1]]];
  return l.shapes.filter((s) => {
    if (s.type !== "door" && s.type !== "window") return false;
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    return wall.axis === "x"
      ? Math.abs(cx - x1) <= WALL_ATTACH && cy >= Math.min(y1, y2) - 4 && cy <= Math.max(y1, y2) + 4
      : Math.abs(cy - y1) <= WALL_ATTACH && cx >= Math.min(x1, x2) - 4 && cx <= Math.max(x1, x2) + 4;
  });
}

/** A grip in the middle of every wall of a selected cross; drag one to move just that wall. */
function CrossWallGrips({ shape, zoom }) {
  const walls = crossWalls(shape);
  const thick = 9 / zoom;
  return (
    <g>
      {CROSS_WALL_LIST.map((wall) => {
        const x1 = walls[wall.from[0]];
        const y1 = walls[wall.from[1]];
        const x2 = walls[wall.to[0]];
        const y2 = walls[wall.to[1]];
        const len = Math.min(Math.hypot(x2 - x1, y2 - y1) * 0.5, 44 / zoom);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;
        const horizontal = wall.axis === "y";
        const w = horizontal ? len : thick;
        const h = horizontal ? thick : len;
        return (
          <rect
            key={wall.id}
            data-kind="wall"
            data-id={shape.id}
            data-wall={wall.id}
            x={cx - w / 2}
            y={cy - h / 2}
            width={w}
            height={h}
            rx={thick / 2}
            fill="#1B5EA8"
            stroke="#fff"
            strokeWidth={2 / zoom}
            style={{ cursor: horizontal ? "ns-resize" : "ew-resize" }}
          >
            <title>{`${wall.name}: drag to move this wall`}</title>
          </rect>
        );
      })}
    </g>
  );
}

/** Selection box with corner and edge grips, kept the same size on screen at any zoom. */
function ResizeHandles({ shape, zoom }) {
  const hs = 11 / zoom;
  const sw = 1.5 / zoom;
  const { x, y, w, h } = shape;
  // A cross has its own grip on every wall, so its box only keeps the corner grips (resize the whole church).
  const edges = shape.type !== "cross";
  const grips = [
    ["nw", x, y],
    ["ne", x + w, y],
    ["sw", x, y + h],
    ["se", x + w, y + h],
    ...(edges && w * zoom >= 56 ? [["n", x + w / 2, y], ["s", x + w / 2, y + h]] : []),
    ...(edges && h * zoom >= 56 ? [["w", x, y + h / 2], ["e", x + w, y + h / 2]] : []),
  ];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#c8a840" strokeWidth={sw} strokeDasharray={`${6 / zoom} ${4 / zoom}`} style={{ pointerEvents: "none" }} />
      {grips.map(([dir, gx, gy]) => (
        <rect
          key={dir}
          data-kind="handle"
          data-id={shape.id}
          data-dir={dir}
          x={gx - hs / 2}
          y={gy - hs / 2}
          width={hs}
          height={hs}
          rx={2.5 / zoom}
          fill="#fff"
          stroke="#c8a840"
          strokeWidth={sw * 1.4}
          style={{ cursor: HANDLE_CURSORS[dir] }}
        />
      ))}
    </g>
  );
}

const SeatItem = memo(function SeatItem({ seat, size, selected, locked, cursor, checkMode }) {
  const blocked = !locked && seat.bookable === false;
  const ticked = checkMode && selected && !locked;
  const colors = locked ? DESIGN_COLORS.booked : ticked ? DESIGN_COLORS.ticked : blocked ? DESIGN_COLORS.blocked : DESIGN_COLORS.available;
  const r = Math.max(5, size * 0.22);
  const bx = seat.x + size / 2 - r * 0.4;
  const by = seat.y - size / 2 + r * 0.4;
  const cr = Math.max(5, size * 0.24);
  const cx = seat.x - size / 2 + cr * 0.4;
  const cy = seat.y - size / 2 + cr * 0.4;
  return (
    <g data-kind="seat" data-id={seat.id} style={{ cursor }}>
      <SeatGraphic seat={seat} size={size} colors={colors} selected={selected && !checkMode} />
      {checkMode && !locked ? (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={cx - cr}
            y={cy - cr}
            width={cr * 2}
            height={cr * 2}
            rx={cr * 0.45}
            fill={ticked ? "#b91c1c" : "#fff"}
            stroke={ticked ? "#fff" : "#94a3b8"}
            strokeWidth={1.4}
          />
          {ticked ? (
            <polyline
              points={`${cx - cr * 0.5},${cy + cr * 0.02} ${cx - cr * 0.12},${cy + cr * 0.42} ${cx + cr * 0.55},${cy - cr * 0.4}`}
              fill="none"
              stroke="#fff"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </g>
      ) : null}
      {blocked ? (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={bx} cy={by} r={r} fill="#b45309" stroke="#fff" strokeWidth={1.5} />
          <line x1={bx - r * 0.5} y1={by - r * 0.5} x2={bx + r * 0.5} y2={by + r * 0.5} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={bx + r * 0.5} y1={by - r * 0.5} x2={bx - r * 0.5} y2={by + r * 0.5} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
});

/** Floating editor above the selected seat(s): rename, block/unblock and delete without leaving the canvas. */
function QuickBar({ seats, size, zoom, lockedSeats, inputRef, onRename, onBlock, onDelete, onRelabel }) {
  const single = seats.length === 1 ? seats[0] : null;
  const [text, setText] = useState(single?.label ?? "");
  const [err, setErr] = useState("");
  useEffect(() => {
    setText(single?.label ?? "");
    setErr("");
  }, [single?.id, single?.label]);

  if (!seats.length) return null;
  const xs = seats.map((s) => s.x);
  const ys = seats.map((s) => s.y);
  const cx = ((Math.min(...xs) + Math.max(...xs)) / 2) * zoom;
  const top = (Math.min(...ys) - size / 2) * zoom - 12;
  const below = top < 60;
  const y = below ? (Math.max(...ys) + size / 2) * zoom + 12 : top;
  const lockedCount = seats.filter((s) => lockedSeats.has(s.id)).length;
  const blockedCount = seats.filter((s) => s.bookable === false).length;
  const allBlocked = blockedCount === seats.length;

  const commitLabel = () => {
    if (!single || text.trim() === single.label) {
      setErr("");
      return "";
    }
    const problem = onRename(single.id, text);
    setErr(problem || "");
    return problem;
  };

  const btn = { minWidth: 0, px: 1.1, py: 0.45, borderRadius: "9px", fontFamily: fontBody, fontWeight: 700, fontSize: "0.76rem", textTransform: "none" };

  return (
    <Box
      onPointerDown={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        left: cx,
        top: y,
        transform: below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.75,
        bgcolor: "#fff",
        borderRadius: "14px",
        border: "1px solid rgba(27,94,168,0.18)",
        boxShadow: "0 14px 34px -12px rgba(20,26,58,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      {single ? (
        <Tooltip open={!!err} title={err} placement="top" arrow>
          <Box
            component="input"
            ref={inputRef}
            value={text}
            maxLength={20}
            aria-label="Seat label"
            onChange={(e) => {
              setText(e.target.value);
              setErr("");
            }}
            onBlur={() => {
              const problem = commitLabel();
              if (problem) {
                setText(single.label);
                setErr("");
                Swal.fire({ toast: true, position: "top", icon: "warning", title: problem, showConfirmButton: false, timer: 2600 });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitLabel();
                e.currentTarget.select();
              } else if (e.key === "Escape") {
                setText(single.label);
                setErr("");
                e.currentTarget.blur();
              }
            }}
            sx={{
              width: 78,
              fontFamily: fontBody,
              fontWeight: 800,
              fontSize: "0.86rem",
              color: textPrimary,
              textAlign: "center",
              px: 1,
              py: 0.6,
              borderRadius: "9px",
              border: `1.5px solid ${err ? "#b91c1c" : "rgba(27,94,168,0.3)"}`,
              outline: "none",
              "&:focus": { borderColor: err ? "#b91c1c" : primaryGreen, boxShadow: "0 0 0 3px rgba(27,94,168,0.12)" },
            }}
          />
        </Tooltip>
      ) : (
        <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.8rem", color: textPrimary, px: 0.5 }}>
          {seats.length} seats
        </Typography>
      )}
      <Tooltip title={allBlocked ? "Open for booking again" : "Block: nobody can book it"}>
        <span>
          <Button
            size="small"
            onClick={() => onBlock(seats.map((s) => s.id), allBlocked)}
            disabled={!allBlocked && lockedCount === seats.length}
            startIcon={allBlocked ? <UnblockIcon sx={{ fontSize: 16 }} /> : <BlockSeatIcon sx={{ fontSize: 16 }} />}
            sx={{ ...btn, color: allBlocked ? "#047857" : "#b45309", bgcolor: allBlocked ? "rgba(4,120,87,0.08)" : "rgba(180,83,9,0.08)" }}
          >
            {allBlocked ? "Unblock" : "Block"}
          </Button>
        </span>
      </Tooltip>
      {!single ? (
        <Tooltip title="Give the selection new labels row by row">
          <Button size="small" onClick={onRelabel} startIcon={<LabelIcon sx={{ fontSize: 16 }} />} sx={{ ...btn, color: primaryGreen, bgcolor: "rgba(27,94,168,0.07)" }}>
            Relabel
          </Button>
        </Tooltip>
      ) : null}
      <Tooltip title={lockedCount === seats.length ? "Booked seats can't be removed" : single ? "Remove seat (Delete)" : "Remove seats (Delete)"}>
        <span>
          <IconButton size="small" onClick={onDelete} disabled={lockedCount === seats.length} sx={{ color: "#b91c1c", bgcolor: "rgba(185,28,28,0.07)", borderRadius: "9px" }}>
            <DeleteSeatIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

/** Bottom bar of the tick tool: how many seats are ticked, and one button to remove them all. */
function TickBar({ count, lockedCount, total, onAll, onClear, onDelete }) {
  const removable = count - lockedCount;
  const btn = { minWidth: 0, px: 1.4, py: 0.6, borderRadius: "10px", fontFamily: fontBody, fontWeight: 700, fontSize: "0.8rem", textTransform: "none" };
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      onPointerDown={(e) => e.stopPropagation()}
      sx={{
        pointerEvents: "auto",
        px: 1.25,
        py: 0.9,
        bgcolor: "var(--kd-surface)",
        borderRadius: "16px",
        border: "1px solid rgba(185,28,28,0.2)",
        boxShadow: "0 18px 40px -20px rgba(20,26,58,0.5)",
        whiteSpace: "nowrap",
      }}
    >
      <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.86rem", color: textPrimary, px: 0.75 }}>
        {count ? `${count} seat${count === 1 ? "" : "s"} ticked` : "No seats ticked"}
        {lockedCount ? (
          <Box component="span" sx={{ color: textMuted, fontWeight: 600, fontSize: "0.76rem" }}>
            {" "}
            · {lockedCount} booked, kept
          </Box>
        ) : null}
      </Typography>
      <Button size="small" onClick={onAll} disabled={count >= total} sx={{ ...btn, color: primaryGreen, bgcolor: "rgba(27,94,168,0.07)" }}>
        Tick all
      </Button>
      <Button size="small" onClick={onClear} disabled={!count} sx={{ ...btn, color: textSecondary, bgcolor: "rgba(100,116,139,0.08)" }}>
        Clear
      </Button>
      <Button
        size="small"
        onClick={onDelete}
        disabled={removable <= 0}
        startIcon={<DeleteSeatIcon sx={{ fontSize: 18 }} />}
        sx={{ ...btn, color: "#fff", bgcolor: "#b91c1c", "&:hover": { bgcolor: "#991b1b" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.8)", bgcolor: "rgba(185,28,28,0.35)" } }}
      >
        {removable > 0 ? `Delete ${removable} seat${removable === 1 ? "" : "s"}` : "Delete"}
      </Button>
    </Stack>
  );
}

// Doors, windows and pillars are only a few pixels thick when zoomed out, so they get a wider invisible grab area.
const THIN_TYPES = new Set(["door", "window", "pillar"]);
const THIN_GRAB = 12;

const ShapeItem = memo(function ShapeItem({ shape, selected }) {
  return (
    <g data-kind="shape" data-id={shape.id} style={{ cursor: "move" }}>
      {THIN_TYPES.has(shape.type) ? (
        <rect x={shape.x - THIN_GRAB} y={shape.y - THIN_GRAB} width={shape.w + THIN_GRAB * 2} height={shape.h + THIN_GRAB * 2} fill="transparent" />
      ) : null}
      <ShapeGraphic shape={shape} selected={selected} />
    </g>
  );
});

function detailsFrom(service) {
  if (!service) {
    return { title: "", service_type: "", description: "", starts_at: "", ends_at: "", booking_closes_at: "" };
  }
  const closes = service.booking_closes_at && service.booking_closes_at !== service.starts_at ? service.booking_closes_at : "";
  return {
    title: service.title || "",
    service_type: service.service_type || "",
    description: service.description || "",
    starts_at: toLocalInput(service.starts_at),
    ends_at: toLocalInput(service.ends_at),
    booking_closes_at: toLocalInput(closes),
  };
}

export default function ChurchDesigner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [service, setService] = useState(null);
  const [details, setDetailsRaw] = useState(detailsFrom(null));
  const [layout, setLayout] = useState(emptyLayout);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [selection, setSelection] = useState({ shapes: [], seats: [] });
  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(0.8);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const [snapOn, setSnapOn] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState("");
  const [panel, setPanel] = useState(isNew ? "details" : "properties");
  const [blockOpen, setBlockOpen] = useState(false);
  const [relabelOpen, setRelabelOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySources, setCopySources] = useState([]);
  const [lockedSeats, setLockedSeats] = useState(new Map());
  const [seatRow, setSeatRow] = useState("A");
  const [preview, setPreview] = useState(null);
  const [marquee, setMarquee] = useState(null);

  const svgRef = useRef(null);
  const scrollRef = useRef(null);
  const dragRef = useRef(null);
  const planOffsetRef = useRef({ x: 0, y: 0 });
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const setDetails = useCallback((updater) => {
    setDetailsRaw(updater);
    setDirty(true);
  }, []);

  const commit = useCallback((next, { keepHistory = false } = {}) => {
    if (!keepHistory) {
      setPast((p) => [...p.slice(-MAX_HISTORY + 1), layoutRef.current]);
      setFuture([]);
    }
    setLayout(next);
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture([layoutRef.current, ...future]);
    setLayout(past[past.length - 1]);
    setPast(past.slice(0, -1));
    setDirty(true);
  }, [past, future]);

  const redo = useCallback(() => {
    if (!future.length) return;
    setPast([...past, layoutRef.current]);
    setLayout(future[0]);
    setFuture(future.slice(1));
    setDirty(true);
  }, [past, future]);

  const fit = useCallback((l = layoutRef.current) => {
    const el = scrollRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const z = Math.min((el.clientWidth - padX) / l.width, (el.clientHeight - padY) / l.height);
    setZoom(Math.max(0.2, Math.min(2, Math.floor(z * 20) / 20)));
  }, []);

  const loadLocks = useCallback(async (svc) => {
    if (!svc || !["approved", "cancelled"].includes(svc.status) || !svc.booked_count) {
      setLockedSeats(new Map());
      return;
    }
    try {
      const res = await churchApi(`/services/${svc.id}/seat-map`);
      const m = new Map();
      for (const s of res.data.layout.seats) {
        if (s.status === "booked" || s.status === "mine") m.set(s.id, s.booking?.user_name || "");
      }
      setLockedSeats(m);
    } catch {
      setLockedSeats(new Map());
    }
  }, []);

  useEffect(() => {
    if (isNew) {
      setTimeout(() => fit(), 50);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await churchApi(`/services/${id}`);
        if (!alive) return;
        setService(res.data);
        setDetailsRaw(detailsFrom(res.data));
        const l = { ...emptyLayout(), ...res.data.layout };
        setLayout(l);
        setPast([]);
        setFuture([]);
        setDirty(false);
        loadLocks(res.data);
        setTimeout(() => fit(l), 50);
      } catch (err) {
        alertError("Could not open the service", err).then(() => navigate("/church"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isNew, fit, loadLocks, navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const readOnly = service?.status === "cancelled";
  const snap = useCallback((v) => (snapOn ? Math.round(v / GRID) * GRID : Math.round(v)), [snapOn]);

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };

  const selectedSet = useMemo(
    () => ({ shapes: new Set(selection.shapes), seats: new Set(selection.seats) }),
    [selection]
  );

  const labelInputRef = useRef(null);

  const prevToolRef = useRef(tool);
  useEffect(() => {
    if (tool === "pick") setSelection((s) => (s.shapes.length ? { ...s, shapes: [] } : s));
    else if (prevToolRef.current === "pick") setSelection({ shapes: [], seats: [] });
    prevToolRef.current = tool;
  }, [tool]);

  // Whatever gets selected on the canvas, its editor should be the visible tab.
  useEffect(() => {
    if (selection.seats.length || selection.shapes.length) setPanel("properties");
  }, [selection]);

  const focusLabel = () => {
    setTimeout(() => {
      labelInputRef.current?.focus();
      labelInputRef.current?.select();
    }, 0);
  };

  const nextNumberInRow = useCallback((row, seats) => {
    const re = new RegExp(`^${row}(\\d+)$`, "i");
    let max = 0;
    for (const s of seats) {
      const m = re.exec(s.label);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return max + 1;
  }, []);

  // ---- pointer interaction --------------------------------------------------

  const onPointerDown = (e) => {
    if (readOnly || e.button !== 0) return;
    const p = toSvg(e);
    const target = e.target.closest?.("[data-kind]");
    const l = layoutRef.current;
    try {
      svgRef.current.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort; moves still arrive while the pointer is over the plan */
    }

    if (target?.dataset.kind === "wall") {
      const shape = l.shapes.find((s) => s.id === target.dataset.id);
      const wall = CROSS_WALL_LIST.find((w) => w.id === target.dataset.wall);
      const walls = crossWalls(shape);
      dragRef.current = {
        kind: "wall",
        id: shape.id,
        wall,
        start: p,
        orig: walls,
        before: l,
        moved: false,
        attached: new Map(itemsOnWall(l, walls, wall).map((s) => [s.id, { x: s.x, y: s.y }])),
      };
      return;
    }

    if (target?.dataset.kind === "handle") {
      const shape = l.shapes.find((s) => s.id === target.dataset.id);
      const inside = HALL_TYPES.has(shape.type) && !e.altKey ? hallContents(l, shape) : { seats: [], shapes: [] };
      const seatIds = new Set(inside.seats);
      const shapeIds = new Set(inside.shapes);
      dragRef.current = {
        kind: "resize",
        dir: target.dataset.dir || "se",
        start: p,
        id: shape.id,
        orig: { x: shape.x, y: shape.y, w: shape.w, h: shape.h },
        before: l,
        moved: false,
        seats: new Map(l.seats.filter((s) => seatIds.has(s.id)).map((s) => [s.id, { x: s.x, y: s.y }])),
        shapes: new Map(l.shapes.filter((s) => shapeIds.has(s.id)).map((s) => [s.id, { x: s.x, y: s.y, w: s.w, h: s.h, type: s.type }])),
      };
      return;
    }

    const onSeat = target?.dataset.kind === "seat";

    // Tick tool: each click flips one seat, a drag flips every seat it passes, empty space boxes a block.
    if (tool === "pick") {
      const seat = onSeat ? l.seats.find((s) => s.id === target.dataset.id) : null;
      if (seat) {
        if (lockedSeats.has(seat.id)) return;
        const value = !selectedSet.seats.has(seat.id);
        setSelection((cur) => tickSeats(cur, [seat.id], value));
        dragRef.current = { kind: "pick", value, done: new Set([seat.id]) };
        return;
      }
      dragRef.current = { kind: "marquee", start: p, additive: true, base: selection, seatsOnly: true };
      setMarquee({ x: p.x, y: p.y, w: 0, h: 0 });
      return;
    }

    if (tool === "block") {
      const seat = onSeat ? l.seats.find((s) => s.id === target.dataset.id) : null;
      if (!seat) return;
      const value = seat.bookable === false;
      if (!value && lockedSeats.has(seat.id)) return;
      setPast((ps) => [...ps.slice(-MAX_HISTORY + 1), l]);
      setFuture([]);
      setLayout((cur) => ({ ...cur, seats: cur.seats.map((s) => (s.id === seat.id ? { ...s, bookable: value } : s)) }));
      setDirty(true);
      dragRef.current = { kind: "paint", value, done: new Set([seat.id]) };
      setSelection({ shapes: [], seats: [] });
      return;
    }

    // In seat mode a click on an existing seat selects it instead of stacking a new one on top.
    if (tool === "seat" && !onSeat) {
      const row = seatRow || "A";
      const label = `${row}${nextNumberInRow(row, l.seats)}`;
      const seat = { id: uid("s"), label, x: snap(p.x), y: snap(p.y), section: null, group: null, bookable: true };
      commit({ ...l, seats: [...l.seats, seat] });
      setSelection({ shapes: [], seats: [seat.id] });
      return;
    }

    if (tool !== "select" && tool !== "seat") {
      dragRef.current = { kind: "draw", start: { x: snap(p.x), y: snap(p.y) }, type: tool };
      setPreview({ x: snap(p.x), y: snap(p.y), w: 0, h: 0, type: tool });
      return;
    }

    if (target && (onSeat || (tool === "select" && target.dataset.kind === "shape"))) {
      const kind = target.dataset.kind === "seat" ? "seats" : "shapes";
      const itemId = target.dataset.id;
      let sel = selection;
      if (e.shiftKey) {
        const has = selectedSet[kind].has(itemId);
        sel = { ...selection, [kind]: has ? selection[kind].filter((x) => x !== itemId) : [...selection[kind], itemId] };
        setSelection(sel);
        if (has) return;
      } else if (!selectedSet[kind].has(itemId)) {
        sel = { shapes: [], seats: [], [kind]: [itemId] };
        setSelection(sel);
      }
      const seatIds = new Set(sel.seats);
      const shapeIds = new Set(sel.shapes);
      // Dragging a hall carries everything inside it; Alt moves the walls alone.
      if (!e.altKey) {
        for (const sh of l.shapes) {
          if (!shapeIds.has(sh.id) || !HALL_TYPES.has(sh.type)) continue;
          const inside = hallContents(l, sh);
          inside.seats.forEach((sid) => seatIds.add(sid));
          inside.shapes.forEach((sid) => shapeIds.add(sid));
        }
      }
      const half = l.seat_size / 2;
      let minX = Infinity;
      let minY = Infinity;
      for (const s of l.seats) {
        if (!seatIds.has(s.id)) continue;
        minX = Math.min(minX, s.x - half);
        minY = Math.min(minY, s.y - half);
      }
      for (const s of l.shapes) {
        if (!shapeIds.has(s.id)) continue;
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y);
      }
      dragRef.current = {
        kind: "move",
        start: p,
        before: l,
        moved: false,
        minX: Math.max(0, minX),
        minY: Math.max(0, minY),
        seats: new Map(l.seats.filter((s) => seatIds.has(s.id)).map((s) => [s.id, { x: s.x, y: s.y }])),
        shapes: new Map(l.shapes.filter((s) => shapeIds.has(s.id)).map((s) => [s.id, { x: s.x, y: s.y }])),
      };
      return;
    }

    if (tool === "seat") return;
    dragRef.current = { kind: "marquee", start: p, additive: e.shiftKey, base: selection };
    if (!e.shiftKey) setSelection({ shapes: [], seats: [] });
    setMarquee({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const p = toSvg(e);
    const l = layoutRef.current;

    if (d.kind === "paint") {
      const half = l.seat_size / 2;
      const seat = l.seats.find((s) => Math.abs(s.x - p.x) <= half && Math.abs(s.y - p.y) <= half);
      if (!seat || d.done.has(seat.id)) return;
      d.done.add(seat.id);
      if (!d.value && lockedSeats.has(seat.id)) return;
      // Functional update: fast drags fire moves before layoutRef catches up with the previous paint.
      setLayout((cur) => ({ ...cur, seats: cur.seats.map((s) => (s.id === seat.id ? { ...s, bookable: d.value } : s)) }));
      return;
    }

    if (d.kind === "pick") {
      const half = l.seat_size / 2;
      const seat = l.seats.find((s) => Math.abs(s.x - p.x) <= half && Math.abs(s.y - p.y) <= half);
      if (!seat || d.done.has(seat.id)) return;
      d.done.add(seat.id);
      if (lockedSeats.has(seat.id)) return;
      setSelection((cur) => tickSeats(cur, [seat.id], d.value));
      return;
    }

    if (d.kind === "move") {
      const dx = Math.max(snap(p.x - d.start.x), -d.minX);
      const dy = Math.max(snap(p.y - d.start.y), -d.minY);
      if (!d.moved && !dx && !dy) return;
      if (!d.moved) {
        setPast((ps) => [...ps.slice(-MAX_HISTORY + 1), d.before]);
        setFuture([]);
        d.moved = true;
      }
      setLayout(
        growPlanToFit({
          ...l,
          seats: d.seats.size
            ? l.seats.map((s) => {
                const o = d.seats.get(s.id);
                return o ? { ...s, x: o.x + dx, y: o.y + dy } : s;
              })
            : l.seats,
          shapes: d.shapes.size
            ? l.shapes.map((s) => {
                const o = d.shapes.get(s.id);
                return o ? { ...s, x: o.x + dx, y: o.y + dy } : s;
              })
            : l.shapes,
        }),
      );
      setDirty(true);
    } else if (d.kind === "wall") {
      const { wall, orig } = d;
      const delta = wall.axis === "x" ? p.x - d.start.x : p.y - d.start.y;
      const value = clampCrossWall(orig, wall.param, snap(orig[wall.param] + delta));
      const applied = Math.round(value - orig[wall.param]);
      if (!d.moved && !applied) return;
      if (!d.moved) {
        setPast((ps) => [...ps.slice(-MAX_HISTORY + 1), d.before]);
        setFuture([]);
        d.moved = true;
      }
      const geometry = crossFromWalls({ ...orig, [wall.param]: value });
      setLayout(
        growPlanToFit({
          ...l,
          shapes: l.shapes.map((s) => {
            if (s.id === d.id) return { ...s, ...geometry };
            const o = d.attached.get(s.id);
            if (!o) return s;
            return wall.axis === "x" ? { ...s, x: o.x + applied } : { ...s, y: o.y + applied };
          }),
        }),
      );
      setDirty(true);
    } else if (d.kind === "resize") {
      const { orig, dir } = d;
      const minW = 8;
      const minH = 4;
      let { x, y, w, h } = orig;
      if (dir.includes("e")) w = Math.max(minW, snap(orig.x + orig.w + p.x - d.start.x) - orig.x);
      if (dir.includes("s")) h = Math.max(minH, snap(orig.y + orig.h + p.y - d.start.y) - orig.y);
      if (dir.includes("w")) {
        x = Math.min(orig.x + orig.w - minW, Math.max(0, snap(orig.x + p.x - d.start.x)));
        w = orig.x + orig.w - x;
      }
      if (dir.includes("n")) {
        y = Math.min(orig.y + orig.h - minH, Math.max(0, snap(orig.y + p.y - d.start.y)));
        h = orig.y + orig.h - y;
      }
      if (!d.moved) {
        setPast((ps) => [...ps.slice(-MAX_HISTORY + 1), d.before]);
        setFuture([]);
        d.moved = true;
      }
      const sx = w / orig.w;
      const sy = h / orig.h;
      const mapX = (v) => x + (v - orig.x) * sx;
      const mapY = (v) => y + (v - orig.y) * sy;
      setLayout(
        growPlanToFit({
          ...l,
          shapes: l.shapes.map((s) => {
            if (s.id === d.id) return { ...s, x, y, w, h };
            const o = d.shapes.get(s.id);
            if (!o) return s;
            if (FIXED_SIZE_TYPES.has(o.type)) {
              return { ...s, x: Math.round(mapX(o.x + o.w / 2) - o.w / 2), y: Math.round(mapY(o.y + o.h / 2) - o.h / 2) };
            }
            return { ...s, x: Math.round(mapX(o.x)), y: Math.round(mapY(o.y)), w: Math.max(4, Math.round(o.w * sx)), h: Math.max(4, Math.round(o.h * sy)) };
          }),
          seats: d.seats.size
            ? l.seats.map((s) => {
                const o = d.seats.get(s.id);
                return o ? { ...s, x: Math.round(mapX(o.x)), y: Math.round(mapY(o.y)) } : s;
              })
            : l.seats,
        }),
      );
      setDirty(true);
    } else if (d.kind === "draw") {
      const x2 = snap(p.x);
      const y2 = snap(p.y);
      setPreview({
        type: d.type,
        x: Math.min(d.start.x, x2),
        y: Math.min(d.start.y, y2),
        w: Math.abs(x2 - d.start.x),
        h: Math.abs(y2 - d.start.y),
      });
    } else if (d.kind === "marquee") {
      setMarquee({
        x: Math.min(d.start.x, p.x),
        y: Math.min(d.start.y, p.y),
        w: Math.abs(p.x - d.start.x),
        h: Math.abs(p.y - d.start.y),
      });
    }
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (svgRef.current?.hasPointerCapture?.(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId);
    if (!d) return;
    const l = layoutRef.current;

    if (d.kind === "draw") {
      const meta = SHAPE_TYPES.find((t) => t.type === d.type);
      let rect = preview;
      if (!rect || rect.w < 8 || rect.h < 4) {
        rect = { x: snap(d.start.x - meta.w / 2), y: snap(d.start.y - meta.h / 2), w: meta.w, h: meta.h };
      }
      const shape = {
        id: uid("sh"),
        type: d.type,
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
        label: d.type === "door" || d.type === "window" || d.type === "pillar" ? "" : meta.label,
      };
      const shapes = d.type === "room" || d.type === "cross" ? [shape, ...l.shapes] : [...l.shapes, shape];
      commit({ ...l, shapes });
      setSelection({ shapes: [shape.id], seats: [] });
      setPreview(null);
      setTool("select");
      setPanel("properties");
    } else if (d.kind === "marquee") {
      const m = marquee;
      setMarquee(null);
      if (!m || (m.w < 3 && m.h < 3)) return;
      const inside = (x, y) => x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h;
      const seats = l.seats.filter((s) => inside(s.x, s.y) && !(d.seatsOnly && lockedSeats.has(s.id))).map((s) => s.id);
      const shapes = d.seatsOnly ? [] : l.shapes.filter((s) => inside(s.x, s.y) && inside(s.x + s.w, s.y + s.h)).map((s) => s.id);
      const base = d.additive ? d.base : { shapes: [], seats: [] };
      setSelection({
        seats: [...new Set([...base.seats, ...seats])],
        shapes: [...new Set([...base.shapes, ...shapes])],
      });
      if (seats.length || shapes.length) setPanel("properties");
    }
  };

  const onWheel = (e) => {
    if (!e.ctrlKey) return;
    setZoom((z) => Math.max(0.2, Math.min(3, +(z * (e.deltaY > 0 ? 0.9 : 1.1)).toFixed(2))));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const block = (e) => e.ctrlKey && e.preventDefault();
    el.addEventListener("wheel", block, { passive: false });
    return () => el.removeEventListener("wheel", block);
  }, [loading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setViewSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  // ---- edit operations ------------------------------------------------------

  const deleteSelection = useCallback(() => {
    const l = layoutRef.current;
    const skip = selection.seats.filter((sid) => lockedSeats.has(sid));
    const seatIds = new Set(selection.seats.filter((sid) => !lockedSeats.has(sid)));
    const shapeIds = new Set(selection.shapes);
    if (!seatIds.size && !shapeIds.size) {
      if (skip.length) Swal.fire({ icon: "info", title: "Booked seats are locked", text: "Seats that are already booked cannot be removed.", confirmButtonColor: primaryGreen });
      return;
    }
    commit({ ...l, seats: l.seats.filter((s) => !seatIds.has(s.id)), shapes: l.shapes.filter((s) => !shapeIds.has(s.id)) });
    setSelection({ shapes: [], seats: skip });
  }, [commit, lockedSeats, selection]);

  const setBookable = useCallback(
    (ids, bookable) => {
      const l = layoutRef.current;
      const set = new Set(bookable ? ids : ids.filter((sid) => !lockedSeats.has(sid)));
      if (!set.size) return;
      commit({ ...l, seats: l.seats.map((s) => (set.has(s.id) ? { ...s, bookable } : s)) });
    },
    [commit, lockedSeats]
  );

  const nudge = useCallback(
    (dx, dy) => {
      const l = layoutRef.current;
      const seatIds = new Set(selection.seats);
      const shapeIds = new Set(selection.shapes);
      if (!seatIds.size && !shapeIds.size) return;
      commit({
        ...l,
        seats: l.seats.map((s) => (seatIds.has(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s)),
        shapes: l.shapes.map((s) => (shapeIds.has(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s)),
      });
    },
    [commit, selection]
  );

  const rotateSelection = useCallback(() => {
    const l = layoutRef.current;
    const ids = new Set(selection.shapes);
    if (!l.shapes.some((s) => ids.has(s.id) && !HALL_TYPES.has(s.type))) return;
    commit(
      growPlanToFit({
        ...l,
        shapes: l.shapes.map((s) => {
          if (!ids.has(s.id) || HALL_TYPES.has(s.type)) return s;
          const cx = s.x + s.w / 2;
          const cy = s.y + s.h / 2;
          return { ...s, x: Math.max(0, Math.round(cx - s.h / 2)), y: Math.max(0, Math.round(cy - s.w / 2)), w: s.h, h: s.w };
        }),
      }),
    );
  }, [commit, selection]);

  const duplicateSelection = useCallback(() => {
    const l = layoutRef.current;
    const seats = l.seats.filter((s) => selection.seats.includes(s.id));
    const shapes = l.shapes.filter((s) => selection.shapes.includes(s.id));
    if (!seats.length && !shapes.length) return;
    const used = new Set(l.seats.map((s) => s.label.toLowerCase()));
    const usedRows = new Set(l.seats.map((s) => (/^([A-Z]+)\d+$/i.exec(s.label) || [])[1]?.toUpperCase()).filter(Boolean));
    const rowMap = new Map();
    let cursor = 0;
    const freshRow = () => {
      while (usedRows.has(rowLetters(cursor))) cursor += 1;
      const r = rowLetters(cursor);
      usedRows.add(r);
      return r;
    };
    const offset = seats.length && shapes.length === 0 ? l.seat_size + 16 : 30;
    const newSeats = seats.map((s) => {
      const m = /^([A-Z]+)(\d+)$/i.exec(s.label);
      let label;
      if (m) {
        const row = m[1].toUpperCase();
        if (!rowMap.has(row)) rowMap.set(row, freshRow());
        label = `${rowMap.get(row)}${m[2]}`;
      } else {
        let n = 2;
        do {
          label = `${s.label}-${n}`.slice(0, 20);
          n += 1;
        } while (used.has(label.toLowerCase()));
      }
      used.add(label.toLowerCase());
      return { ...s, id: uid("s"), label, y: s.y + offset * (shapes.length ? 1 : Math.max(1, new Set(seats.map((x) => x.y)).size)), x: shapes.length ? s.x + offset : s.x };
    });
    const newShapes = shapes.map((s) => ({ ...s, id: uid("sh"), x: s.x + offset, y: s.y + offset }));
    commit({ ...l, seats: [...l.seats, ...newSeats], shapes: [...l.shapes, ...newShapes] });
    setSelection({ seats: newSeats.map((s) => s.id), shapes: newShapes.map((s) => s.id) });
  }, [commit, selection]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      if (blockOpen || relabelOpen || copyOpen || readOnly) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection();
      } else if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelection({ seats: layoutRef.current.seats.map((s) => s.id), shapes: [] });
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("church-save-btn")?.click();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
      } else if (e.key === "Escape") {
        setSelection({ shapes: [], seats: [] });
        setTool("select");
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        nudge(...map[e.key]);
      } else if ((e.key === "F2" || (e.key === "Enter" && tag !== "button")) && selection.seats.length === 1 && !selection.shapes.length) {
        e.preventDefault();
        focusLabel();
      } else if (!mod && e.key.toLowerCase() === "x" && selection.seats.length) {
        const seats = layoutRef.current.seats.filter((s) => selection.seats.includes(s.id));
        setBookable(selection.seats, seats.every((s) => s.bookable === false));
      } else if (!mod && e.key.toLowerCase() === "r" && selection.shapes.length) {
        rotateSelection();
      } else if (!mod && e.key.toLowerCase() === "v") setTool("select");
      else if (!mod && e.key.toLowerCase() === "s") setTool((t) => (t === "seat" ? "select" : "seat"));
      else if (!mod && e.key.toLowerCase() === "k") setTool((t) => (t === "block" ? "select" : "block"));
      else if (!mod && e.key.toLowerCase() === "c") setTool((t) => (t === "pick" ? "select" : "pick"));
      else if (!mod && e.key.toLowerCase() === "b") setBlockOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blockOpen, relabelOpen, copyOpen, readOnly, undo, redo, duplicateSelection, deleteSelection, nudge, rotateSelection, selection, setBookable]);

  const visibleCentre = () => {
    const el = scrollRef.current;
    const l = layoutRef.current;
    if (!el || !svgRef.current) return { x: l.width / 2, y: l.height / 2 };
    const view = el.getBoundingClientRect();
    const plan = svgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(l.width, (view.left + el.clientWidth / 2 - plan.left) / zoom)),
      y: Math.max(0, Math.min(l.height, (view.top + el.clientHeight / 2 - plan.top) / zoom)),
    };
  };

  const addBlock = (f) => {
    const l = layoutRef.current;
    const size = l.seat_size;
    const pitch = size + Math.max(0, f.seatGap);
    const rowPitch = size + Math.max(0, f.rowGap);
    const aisles = f.aisleEvery > 0 ? Math.floor((f.cols - 1) / f.aisleEvery) : 0;
    const blockW = (f.cols - 1) * pitch + aisles * f.aisleWidth;
    const blockH = (f.rows - 1) * rowPitch;
    const c = visibleCentre();
    const x0 = snap(Math.max(size, Math.min(l.width - blockW - size, c.x - blockW / 2)));
    const y0 = snap(Math.max(size, Math.min(l.height - blockH - size, c.y - blockH / 2)));
    const start = rowIndex(f.firstRow);
    const seats = [];
    for (let r = 0; r < f.rows; r += 1) {
      for (let col = 0; col < f.cols; col += 1) {
        const number = f.direction === "ltr" ? f.firstNumber + col : f.firstNumber + (f.cols - 1 - col);
        const aisleShift = f.aisleEvery > 0 ? Math.floor(col / f.aisleEvery) * f.aisleWidth : 0;
        seats.push({
          id: uid("s"),
          label: `${rowLetters(start + r)}${number}`,
          x: x0 + col * pitch + aisleShift,
          y: y0 + r * rowPitch,
          section: f.section?.trim() || null,
          group: null,
          bookable: true,
        });
      }
    }
    commit({ ...l, seats: [...l.seats, ...seats] });
    setSelection({ shapes: [], seats: seats.map((s) => s.id) });
    setBlockOpen(false);
    setTool("select");
    setPanel("properties");
  };

  const relabel = (f) => {
    const l = layoutRef.current;
    const chosen = l.seats.filter((s) => selection.seats.includes(s.id));
    const tol = l.seat_size / 2;
    const sorted = [...chosen].sort((a, b) => a.y - b.y);
    const rows = [];
    for (const s of sorted) {
      const row = f.perRow ? rows.find((r) => Math.abs(r.y - s.y) <= tol) : rows[0];
      if (row) row.items.push(s);
      else rows.push({ y: s.y, items: [s] });
    }
    const start = rowIndex(f.firstRow);
    const labels = new Map();
    rows.forEach((row, i) => {
      const letters = rowLetters(start + (f.perRow ? i : 0));
      const items = [...row.items].sort((a, b) => (f.direction === "ltr" ? a.x - b.x : b.x - a.x));
      items.forEach((s, j) => labels.set(s.id, `${letters}${f.firstNumber + j}`));
    });
    const others = new Set(l.seats.filter((s) => !labels.has(s.id)).map((s) => s.label.toLowerCase()));
    const clash = [...labels.values()].filter((lab) => others.has(lab.toLowerCase()));
    if (clash.length) {
      Swal.fire({
        icon: "warning",
        title: "Labels already used",
        text: `${clash.slice(0, 8).join(", ")}${clash.length > 8 ? "…" : ""} exist elsewhere on the plan. Pick another row letter or number.`,
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    commit({ ...l, seats: l.seats.map((s) => (labels.has(s.id) ? { ...s, label: labels.get(s.id) } : s)) });
    setRelabelOpen(false);
  };

  const align = (mode) => {
    const l = layoutRef.current;
    const ids = new Set(selection.seats);
    const chosen = l.seats.filter((s) => ids.has(s.id));
    if (chosen.length < 2) return;
    let pos = new Map();
    if (mode === "row") {
      const y = snap(chosen.reduce((n, s) => n + s.y, 0) / chosen.length);
      chosen.forEach((s) => pos.set(s.id, { x: s.x, y }));
    } else if (mode === "col") {
      const x = snap(chosen.reduce((n, s) => n + s.x, 0) / chosen.length);
      chosen.forEach((s) => pos.set(s.id, { x, y: s.y }));
    } else {
      const sorted = [...chosen].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const maxX = sorted[sorted.length - 1].x;
      const step = (maxX - minX) / (sorted.length - 1);
      pos = new Map(sorted.map((s, i) => [s.id, { x: Math.round(minX + step * i), y: s.y }]));
    }
    commit({ ...l, seats: l.seats.map((s) => (pos.has(s.id) ? { ...s, ...pos.get(s.id) } : s)) });
  };

  const updateShape = (sid, patch) => {
    const l = layoutRef.current;
    commit({ ...l, shapes: l.shapes.map((s) => (s.id === sid ? { ...s, ...patch } : s)) });
  };
  const updateSeat = (sid, patch) => {
    const l = layoutRef.current;
    commit({ ...l, seats: l.seats.map((s) => (s.id === sid ? { ...s, ...patch } : s)) });
  };
  const updateSeats = (ids, patch) => {
    const set = new Set(ids);
    const l = layoutRef.current;
    commit({ ...l, seats: l.seats.map((s) => (set.has(s.id) ? { ...s, ...patch } : s)) });
  };
  /** Returns an error message, or "" when the label was saved. */
  const renameSeat = (sid, raw) => {
    const label = String(raw).trim().slice(0, 20);
    if (!label) return "A seat needs a label.";
    const clash = layoutRef.current.seats.find((s) => s.id !== sid && s.label.toLowerCase() === label.toLowerCase());
    if (clash) return `${label} is already used by another seat.`;
    updateSeat(sid, { label });
    return "";
  };
  const order = (where) => {
    const l = layoutRef.current;
    const ids = new Set(selection.shapes);
    const picked = l.shapes.filter((s) => ids.has(s.id));
    const rest = l.shapes.filter((s) => !ids.has(s.id));
    commit({ ...l, shapes: where === "front" ? [...rest, ...picked] : [...picked, ...rest] });
  };

  const applyTemplate = (kind) => {
    const t = kind === "cross" ? crossChurchTemplate() : churchTemplate();
    commit(t);
    setSelection({ shapes: [], seats: [] });
    setTimeout(() => fit(t), 30);
    toastSuccess("Template added", "Move, relabel or remove anything to match your church.");
  };

  const openCopy = async () => {
    try {
      const res = await churchApi(`/services?limit=60`);
      setCopySources(res.data.services.filter((s) => s.seat_count > 0 && s.id !== id));
      setCopyOpen(true);
    } catch (err) {
      alertError("Could not load services", err);
    }
  };

  const copyFrom = async (src) => {
    try {
      const res = await churchApi(`/services/${src.id}`);
      const l = { ...emptyLayout(), ...res.data.layout };
      commit(l);
      setCopyOpen(false);
      setTimeout(() => fit(l), 30);
      toastSuccess("Seating copied");
    } catch (err) {
      alertError("Could not copy", err);
    }
  };

  // ---- saving & workflow ----------------------------------------------------

  const validate = () => {
    if (!details.title.trim()) {
      setPanel("details");
      return "Give the service a title.";
    }
    if (!details.starts_at) {
      setPanel("details");
      return "Set when the service starts.";
    }
    const seen = new Map();
    const dups = [];
    for (const s of layout.seats) {
      const k = s.label.trim().toLowerCase();
      if (!k) dups.push(s.id);
      else if (seen.has(k)) dups.push(s.id, seen.get(k));
      else seen.set(k, s.id);
    }
    if (dups.length) {
      setSelection({ shapes: [], seats: [...new Set(dups)] });
      setPanel("properties");
      return "Some seats share the same label (now selected). Relabel them first.";
    }
    return "";
  };

  const save = async ({ silent = false } = {}) => {
    const problem = validate();
    if (problem) {
      Swal.fire({ icon: "warning", title: "Almost there", text: problem, confirmButtonColor: primaryGreen });
      return null;
    }
    setBusy("save");
    try {
      const body = {
        title: details.title,
        service_type: details.service_type,
        description: details.description,
        starts_at: fromLocalInput(details.starts_at),
        ends_at: fromLocalInput(details.ends_at),
        booking_closes_at: fromLocalInput(details.booking_closes_at),
        layout,
      };
      const res = isNew
        ? await churchApi("/services", { method: "POST", body })
        : await churchApi(`/services/${id}`, { method: "PUT", body });
      setService(res.data);
      setDirty(false);
      if (!silent) toastSuccess(isNew ? "Service created" : "Saved", isNew ? "Saved as a draft." : undefined);
      if (isNew) navigate(`/church/${res.data.id}/design`, { replace: true });
      return res.data;
    } catch (err) {
      alertError("Could not save", err);
      return null;
    } finally {
      setBusy("");
    }
  };

  const runAction = async (action) => {
    const saved = dirty || isNew ? await save({ silent: true }) : service;
    if (!saved) return;
    try {
      if (action === "submit") {
        if (!saved.bookable_seat_count) throw new Error("Add at least one bookable seat first.");
        setBusy("submit");
        const res = await churchApi(`/services/${saved.id}/submit`, { method: "POST" });
        setService((s) => ({ ...s, ...res.data }));
        toastSuccess("Submitted for approval", "You or another admin can now approve it.");
      } else if (action === "approve") {
        const ok = await confirmAction({
          title: "Approve and publish?",
          text: `${saved.bookable_seat_count} seats will open for booking in the student portal and mobile app.`,
          confirmText: "Approve",
        });
        if (!ok) return;
        setBusy("approve");
        const res = await churchApi(`/services/${saved.id}/approve`, { method: "POST", body: {} });
        setService((s) => ({ ...s, ...res.data }));
        toastSuccess("Approved", "Booking is open.");
      } else if (action === "reject") {
        const { value: note, isConfirmed } = await Swal.fire({
          title: "Return for changes",
          input: "textarea",
          inputLabel: "What needs to change?",
          showCancelButton: true,
          confirmButtonText: "Reject",
          confirmButtonColor: "#b91c1c",
          reverseButtons: true,
          inputValidator: (v) => (!v?.trim() ? "Please give a reason." : undefined),
        });
        if (!isConfirmed) return;
        setBusy("reject");
        const res = await churchApi(`/services/${saved.id}/reject`, { method: "POST", body: { note } });
        setService((s) => ({ ...s, ...res.data }));
        toastSuccess("Returned for changes");
      }
    } catch (err) {
      alertError("Action failed", err);
    } finally {
      setBusy("");
    }
  };

  const status = service?.status || "draft";
  const size = layout.seat_size;
  const seatCursor = tool === "block" ? "cell" : tool === "select" || tool === "seat" || tool === "pick" ? "pointer" : "crosshair";
  const selectedSeats = layout.seats.filter((s) => selectedSet.seats.has(s.id));
  const singleShape =
    selection.shapes.length === 1 && !selection.seats.length ? layout.shapes.find((s) => s.id === selection.shapes[0]) : null;
  const suggestedRow = useMemo(() => {
    const first = layout.seats.find((s) => selection.seats.includes(s.id));
    return (/^([A-Z]+)\d+$/i.exec(first?.label || "") || [])[1]?.toUpperCase() || "A";
  }, [layout.seats, selection.seats]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "60vh" }}>
        <CircularProgress sx={{ color: primaryGreen }} />
      </Stack>
    );
  }

  const canvasPadLeft = readOnly ? CANVAS_PAD : CANVAS_PAD_RAIL;
  let planOffsetX = Math.max(0, Math.floor((viewSize.w - canvasPadLeft - PANEL_SPACE - CANVAS_PAD - layout.width * zoom) / 2));
  let planOffsetY = Math.max(0, Math.floor((viewSize.h - CANVAS_PAD * 2 - layout.height * zoom) / 2));
  // The plan can grow mid-drag; re-centring then would slide it under the pointer, so hold its position until release.
  if (dragRef.current) ({ x: planOffsetX, y: planOffsetY } = planOffsetRef.current);
  else planOffsetRef.current = { x: planOffsetX, y: planOffsetY };
  const topBtn = { ...ghostBtnSx, border: "1px solid rgba(27,94,168,0.16)", bgcolor: "var(--kd-surface)", px: 1.75, py: 0.8 };

  return (
    <Box
      sx={{
        height: "calc(100dvh - 72px)",
        m: -3,
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--kd-page-b)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{
          px: 2,
          py: 1.1,
          borderBottom: "1px solid rgba(27,94,168,0.1)",
          bgcolor: "var(--kd-surface)",
          flexShrink: 0,
          flexWrap: "wrap",
          rowGap: 1,
        }}
      >
        <IconButton
          onClick={async () => {
            if (dirty && !(await confirmAction({ title: "Leave without saving?", text: "Your latest changes will be lost.", confirmText: "Leave", danger: true }))) return;
            navigate("/church");
          }}
          sx={{ border: "1px solid rgba(27,94,168,0.14)" }}
        >
          <BackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography noWrap sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.15rem", color: textPrimary }}>
              {details.title || (isNew ? "New church service" : "Untitled service")}
            </Typography>
            <StatusChip status={status} />
          </Stack>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: dirty ? "#b45309" : textMuted, fontWeight: 600 }}>
            {dirty ? "Unsaved changes" : isNew ? "Not saved yet" : "All changes saved"} · {layout.seats.length} seats ·{" "}
            {layout.seats.filter((s) => s.bookable !== false).length} bookable
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ bgcolor: "rgba(27,94,168,0.05)", borderRadius: "12px", px: 0.5, py: 0.25 }}>
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton size="small" onClick={undo} disabled={!past.length || readOnly}>
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton size="small" onClick={redo} disabled={!future.length || readOnly}>
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", fontWeight: 800, color: textSecondary, width: 42, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to screen">
            <IconButton size="small" onClick={() => fit()}>
              <FitIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={snapOn ? "Snap to grid: on" : "Snap to grid: off"}>
            <IconButton size="small" onClick={() => setSnapOn((v) => !v)} sx={{ color: snapOn ? primaryGreen : textMuted }}>
              <GridIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {!isNew && ["approved", "cancelled"].includes(status) ? (
            <Button startIcon={<VisibilityIcon />} onClick={() => navigate(`/church/${id}`)} sx={topBtn}>
              Monitor
            </Button>
          ) : null}
          {!readOnly ? (
            <Button id="church-save-btn" startIcon={busy === "save" ? <CircularProgress size={16} /> : <SaveIcon />} disabled={!!busy} onClick={() => save()} sx={topBtn}>
              {isNew ? "Save draft" : "Save"}
            </Button>
          ) : null}
          {["draft", "rejected"].includes(status) ? (
            <Button startIcon={busy === "submit" ? <CircularProgress size={16} /> : <SendIcon />} disabled={!!busy} onClick={() => runAction("submit")} sx={topBtn}>
              Submit
            </Button>
          ) : null}
          {status === "pending" ? (
            <Button startIcon={<RejectIcon />} disabled={!!busy} onClick={() => runAction("reject")} sx={{ ...topBtn, color: "#b91c1c" }}>
              Reject
            </Button>
          ) : null}
          {["draft", "pending"].includes(status) ? (
            <Button startIcon={busy === "approve" ? <CircularProgress size={16} /> : <ApproveIcon />} disabled={!!busy} onClick={() => runAction("approve")} sx={{ ...primaryBtnSx, py: 0.8, px: 2 }}>
              Approve
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {status === "approved" || status === "rejected" || status === "cancelled" ? (
        <Alert
          severity={status === "approved" ? "success" : status === "rejected" ? "error" : "info"}
          sx={{ borderRadius: 0, fontFamily: fontBody, fontSize: "0.8rem", py: 0.25, flexShrink: 0 }}
        >
          {status === "approved"
            ? `Live: students can book this service.${lockedSeats.size ? ` ${lockedSeats.size} booked seats are locked (dark) — they can be moved but not removed.` : ""} Changes apply as soon as you save.`
            : status === "rejected"
              ? `Returned for changes: ${service?.review_note || "no reason given"}. Edit and submit again.`
              : "This service was cancelled. The plan is read-only."}
        </Alert>
      ) : null}

      <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "flex" }}>
          {!readOnly ? (
            <FloatingToolbar tool={tool} setTool={setTool} onAddBlock={() => setBlockOpen(true)} seatRow={seatRow} setSeatRow={setSeatRow} />
          ) : null}
          {!readOnly && tool === "pick" ? (
            <Box sx={{ position: "absolute", left: 0, right: PANEL_SPACE, bottom: 18, zIndex: 6, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
              <TickBar
                count={selectedSeats.length}
                lockedCount={selectedSeats.filter((s) => lockedSeats.has(s.id)).length}
                total={layout.seats.length - lockedSeats.size}
                onAll={() => setSelection({ shapes: [], seats: layout.seats.filter((s) => !lockedSeats.has(s.id)).map((s) => s.id) })}
                onClear={() => setSelection({ shapes: [], seats: [] })}
                onDelete={deleteSelection}
              />
            </Box>
          ) : null}
          {!readOnly && !layout.seats.length && !layout.shapes.length ? (
            <Box sx={{ position: "absolute", top: 0, bottom: 0, left: 0, right: PANEL_SPACE, zIndex: 4, pointerEvents: "none" }}>
              <EmptyPlanCard onTemplate={applyTemplate} onCopyFrom={openCopy} />
            </Box>
          ) : null}

        <Box
          ref={scrollRef}
          onWheel={onWheel}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            p: `${CANVAS_PAD}px`,
            pl: `${canvasPadLeft}px`,
            pr: `${PANEL_SPACE + CANVAS_PAD}px`,
            bgcolor: "#fff",
            // Grid lines are anchored to the plan origin so they continue seamlessly past the plan edge.
            backgroundImage:
              "linear-gradient(rgba(27,94,168,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(27,94,168,0.07) 1px, transparent 1px)",
            backgroundSize: `${GRID * 5 * zoom}px ${GRID * 5 * zoom}px`,
            backgroundPosition: `${canvasPadLeft + planOffsetX}px ${CANVAS_PAD + planOffsetY}px`,
            backgroundAttachment: "local",
          }}
        >
          <Box sx={{ position: "relative", ml: `${planOffsetX}px`, mt: `${planOffsetY}px`, width: layout.width * zoom, height: layout.height * zoom, outline: "1.5px dashed rgba(27,94,168,0.22)", outlineOffset: 2, borderRadius: "6px" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              width={layout.width * zoom}
              height={layout.height * zoom}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={() => {
                if (!readOnly && selection.seats.length === 1 && !selection.shapes.length) focusLabel();
              }}
              style={{
                display: "block",
                touchAction: "none",
                userSelect: "none",
                cursor: tool === "select" ? "default" : tool === "block" ? "cell" : "crosshair",
                borderRadius: 10,
              }}
            >
              <rect x={0} y={0} width={layout.width} height={layout.height} fill="transparent" />
              {layout.shapes.map((s) => (
                <ShapeItem key={s.id} shape={s} selected={selectedSet.shapes.has(s.id)} />
              ))}
              {layout.seats.map((s) => (
                <SeatItem
                  key={s.id}
                  seat={s}
                  size={size}
                  selected={selectedSet.seats.has(s.id)}
                  locked={lockedSeats.has(s.id)}
                  cursor={seatCursor}
                  checkMode={tool === "pick"}
                />
              ))}
              {singleShape && !readOnly ? <ResizeHandles shape={singleShape} zoom={zoom} /> : null}
              {singleShape?.type === "cross" && !readOnly ? <CrossWallGrips shape={singleShape} zoom={zoom} /> : null}
              {preview ? (
                <rect x={preview.x} y={preview.y} width={preview.w} height={preview.h} fill="rgba(200,168,64,0.15)" stroke="#c8a840" strokeWidth={2} strokeDasharray="6 4" />
              ) : null}
              {marquee ? (
                <rect x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h} fill="rgba(27,94,168,0.08)" stroke={primaryGreen} strokeWidth={1.5} strokeDasharray="5 4" />
              ) : null}
            </svg>
            {!readOnly && !marquee && singleShape && !HALL_TYPES.has(singleShape.type) ? (
              <ShapeBar shape={singleShape} zoom={zoom} onRotate={rotateSelection} onDelete={deleteSelection} />
            ) : null}
            {!readOnly && !marquee && tool !== "block" && tool !== "pick" && selectedSeats.length > 0 && !selection.shapes.length ? (
              <QuickBar
                seats={selectedSeats}
                size={size}
                zoom={zoom}
                lockedSeats={lockedSeats}
                inputRef={labelInputRef}
                onRename={renameSeat}
                onBlock={(ids, open) => setBookable(ids, open)}
                onDelete={deleteSelection}
                onRelabel={() => setRelabelOpen(true)}
              />
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: PANEL_GAP,
            right: PANEL_GAP,
            bottom: PANEL_GAP,
            width: PANEL_WIDTH,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "var(--kd-surface)",
            border: "1px solid rgba(27,94,168,0.12)",
            borderRadius: "16px",
            boxShadow: "0 18px 44px -20px rgba(20,26,58,0.35)",
          }}
        >
          <Tabs
            value={panel}
            onChange={(_, v) => setPanel(v)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              borderBottom: "1px solid rgba(27,94,168,0.1)",
              "& .MuiTab-root": { textTransform: "none", fontFamily: fontBody, fontWeight: 700, minHeight: 44, fontSize: "0.86rem" },
              "& .MuiTabs-indicator": { bgcolor: primaryGreen, height: 3 },
            }}
          >
            <Tab value="details" label="Service details" />
            <Tab value="properties" label={selection.seats.length + selection.shapes.length ? `Selection (${selection.seats.length + selection.shapes.length})` : "Plan"} />
          </Tabs>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2, display: "flex", flexDirection: "column" }}>
            {panel === "details" ? (
              <>
                <SectionTitle>When & what</SectionTitle>
                <DetailsForm details={details} setDetails={setDetails} readOnly={readOnly} />
                {service?.created_by ? (
                  <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted, mt: 1.5, flexShrink: 0 }}>
                    Created by {service.created_by.full_name}
                    {service.reviewed_by ? ` · reviewed by ${service.reviewed_by.full_name}` : ""}
                  </Typography>
                ) : null}
              </>
            ) : (
              <PropertiesPanel
                layout={layout}
                selection={selection}
                lockedSeats={lockedSeats}
                onCanvas={(patch) => commit({ ...layoutRef.current, ...patch })}
                onUpdateShape={updateShape}
                onUpdateSeat={updateSeat}
                onUpdateSeats={updateSeats}
                onRenameSeat={renameSeat}
                onSetBookable={setBookable}
                onDelete={deleteSelection}
                onOrder={order}
                onRotate={rotateSelection}
                onAlign={align}
                onRelabel={() => setRelabelOpen(true)}
              />
            )}
          </Box>
          <Box sx={{ px: 2, py: 1, borderTop: "1px solid rgba(27,94,168,0.08)", bgcolor: "rgba(30,40,88,0.03)", flexShrink: 0 }}>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.7rem", color: textMuted, lineHeight: 1.45 }}>
              <b style={{ color: navy }}>Flow:</b> Save draft → Submit → Approve. The creator may approve their own service; only approved services
              appear to students.
            </Typography>
          </Box>
        </Box>
      </Box>

      <SeatBlockDialog open={blockOpen} onClose={() => setBlockOpen(false)} onAdd={addBlock} layout={layout} />
      <RelabelDialog open={relabelOpen} onClose={() => setRelabelOpen(false)} onApply={relabel} count={selection.seats.length} suggestedRow={suggestedRow} />
      <CopyFromDialog open={copyOpen} onClose={() => setCopyOpen(false)} services={copySources} onPick={copyFrom} />
    </Box>
  );
}
