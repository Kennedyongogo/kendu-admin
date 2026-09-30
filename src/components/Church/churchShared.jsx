import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { authJsonHeaders, fontBody, textMuted, textSecondary } from "../Users/usersShared";

export async function churchApi(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api/church${path}`, {
    method,
    headers: authJsonHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const SERVICE_STATUS = {
  draft: { label: "Draft", color: "#475569", soft: "rgba(71,85,105,0.12)" },
  pending: { label: "Pending approval", color: "#b45309", soft: "rgba(180,83,9,0.12)" },
  approved: { label: "Approved", color: "#047857", soft: "rgba(4,120,87,0.12)" },
  rejected: { label: "Rejected", color: "#b91c1c", soft: "rgba(185,28,28,0.1)" },
  cancelled: { label: "Cancelled", color: "#6b7280", soft: "rgba(107,114,128,0.14)" },
};

export const SERVICE_TYPES = [
  "Sabbath Divine Service",
  "Sabbath School",
  "Vespers",
  "Mid-week Prayer",
  "AY / Youth Programme",
  "Week of Prayer",
  "Communion Service",
  "Special Programme",
];

export function StatusChip({ status, size = "small", sx }) {
  const meta = SERVICE_STATUS[status] || SERVICE_STATUS.draft;
  return (
    <Chip
      size={size}
      label={meta.label}
      sx={{
        fontFamily: fontBody,
        fontWeight: 800,
        fontSize: "0.7rem",
        height: 24,
        bgcolor: meta.soft,
        color: meta.color,
        ...sx,
      }}
    />
  );
}

/** Colours for seats in the read-only map and in the legend. */
export const SEAT_COLORS = {
  available: { fill: "#ffffff", stroke: "#1B5EA8", text: "#0E3D73", label: "Available" },
  booked: { fill: "#1e2858", stroke: "#1e2858", text: "#ffffff", label: "Booked" },
  mine: { fill: "#c8a840", stroke: "#8a6d12", text: "#1e2858", label: "Your seat" },
  blocked: { fill: "#e5e7eb", stroke: "#9ca3af", text: "#6b7280", label: "Blocked" },
  present: { fill: "#059669", stroke: "#047857", text: "#ffffff", label: "Attended" },
  absent: { fill: "#dc2626", stroke: "#b91c1c", text: "#ffffff", label: "Did not attend" },
};

export const SHAPE_TYPES = [
  { type: "room", label: "Church hall", w: 900, h: 700, hint: "Outer walls of the building" },
  { type: "cross", label: "Cross-shaped hall", w: 900, h: 860, hint: "Walls of a church built like a cross" },
  { type: "stage", label: "Platform", w: 360, h: 120, hint: "Raised platform / rostrum" },
  { type: "pulpit", label: "Pulpit", w: 70, h: 50, hint: "Preaching desk" },
  { type: "altar", label: "Communion table", w: 120, h: 50, hint: "Table or altar" },
  { type: "choir", label: "Choir", w: 220, h: 110, hint: "Choir / praise team area" },
  { type: "door", label: "Door", w: 90, h: 16, hint: "Entrance or exit" },
  { type: "aisle", label: "Aisle", w: 70, h: 500, hint: "Walkway between seats" },
  { type: "pillar", label: "Pillar", w: 30, h: 30, hint: "Column that blocks view" },
  { type: "window", label: "Window", w: 110, h: 10, hint: "Window on a wall" },
  { type: "area", label: "Area", w: 200, h: 140, hint: "Media desk, ushers, etc." },
  { type: "label", label: "Text", w: 160, h: 36, hint: "Free text on the plan" },
];

export const SHAPE_STYLE = {
  room: { fill: "#fbfaf6", stroke: "#1e2858", strokeWidth: 6, rx: 14, text: "#94a3b8", textSize: 14 },
  cross: { fill: "#fbfaf6", stroke: "#1e2858", strokeWidth: 6, rx: 0, text: "#94a3b8", textSize: 14 },
  stage: { fill: "rgba(200,168,64,0.22)", stroke: "#b8962e", strokeWidth: 2, rx: 12, text: "#7a5f10", textSize: 16 },
  pulpit: { fill: "#1e2858", stroke: "#1e2858", strokeWidth: 1, rx: 8, text: "#ffffff", textSize: 11 },
  altar: { fill: "rgba(109,40,217,0.14)", stroke: "#6d28d9", strokeWidth: 2, rx: 6, text: "#5b21b6", textSize: 12 },
  choir: { fill: "rgba(13,148,136,0.12)", stroke: "#0d9488", strokeWidth: 2, rx: 12, text: "#0f766e", textSize: 14 },
  door: { fill: "#b45309", stroke: "#92400e", strokeWidth: 1, rx: 3, text: "#92400e", textSize: 11, labelOutside: true },
  aisle: { fill: "rgba(148,163,184,0.1)", stroke: "#94a3b8", strokeWidth: 1.5, rx: 4, dash: "8 6", text: "#94a3b8", textSize: 12 },
  pillar: { fill: "#64748b", stroke: "#475569", strokeWidth: 1, rx: 4, text: "#ffffff", textSize: 9 },
  window: { fill: "#bfdbfe", stroke: "#3b82f6", strokeWidth: 1, rx: 2, text: "#1d4ed8", textSize: 10, labelOutside: true },
  area: { fill: "rgba(27,94,168,0.06)", stroke: "#1B5EA8", strokeWidth: 1.5, rx: 10, dash: "6 5", text: "#1B5EA8", textSize: 13 },
  label: { fill: "none", stroke: "none", strokeWidth: 0, rx: 0, text: "#1e2858", textSize: 18 },
};

export function emptyLayout() {
  return { width: 1200, height: 900, seat_size: 28, shapes: [], seats: [] };
}

export function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatServiceWhen(value, { withYear = true } = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function rowLetters(index) {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export function seatStatusFor(seat) {
  if (seat.status === "booked" || seat.status === "mine") {
    if (seat.booking?.attendance === "present") return "present";
    if (seat.booking?.attendance === "absent") return "absent";
  }
  return seat.status || (seat.bookable === false ? "blocked" : "available");
}

/**
 * Wall positions of a cross-shaped hall, as fractions of its box. hl/hr: side walls of the front (platform) arm,
 * fl/fr: side walls of the nave, lt/lb and rt/rb: front and back walls of the left and right wings.
 * The box itself gives the front wall, back wall and the two wing end walls.
 * Keep in sync with the student portal and the mobile app, which draw the same outline.
 */
export const CROSS_DEFAULTS = { hl: 0.3, hr: 0.7, fl: 0.3, fr: 0.7, lt: 0.22, lb: 0.5, rt: 0.22, rb: 0.5 };

/** Absolute position of every wall line of a cross. */
export function crossWalls(shape) {
  const f = { ...CROSS_DEFAULTS, ...(shape.cross || {}) };
  const { x, y, w, h } = shape;
  return {
    left: x,
    right: x + w,
    top: y,
    bottom: y + h,
    hl: x + f.hl * w,
    hr: x + f.hr * w,
    fl: x + f.fl * w,
    fr: x + f.fr * w,
    lt: y + f.lt * h,
    lb: y + f.lb * h,
    rt: y + f.rt * h,
    rb: y + f.rb * h,
  };
}

/** Box and wall fractions for a cross from absolute wall lines (inverse of crossWalls). */
export function crossFromWalls(a) {
  const w = a.right - a.left;
  const h = a.bottom - a.top;
  const fx = (v) => Math.round(((v - a.left) / w) * 1e6) / 1e6;
  const fy = (v) => Math.round(((v - a.top) / h) * 1e6) / 1e6;
  return {
    x: a.left,
    y: a.top,
    w,
    h,
    cross: { hl: fx(a.hl), hr: fx(a.hr), fl: fx(a.fl), fr: fx(a.fr), lt: fy(a.lt), lb: fy(a.lb), rt: fy(a.rt), rb: fy(a.rb) },
  };
}

/** The 12 walls of a cross, clockwise from the front wall. `param` is the wall line that moves when it is dragged. */
export const CROSS_WALL_LIST = [
  { id: "top", param: "top", axis: "y", from: ["hl", "top"], to: ["hr", "top"], name: "Front wall" },
  { id: "headR", param: "hr", axis: "x", from: ["hr", "top"], to: ["hr", "rt"], name: "Front arm, right wall" },
  { id: "rightTop", param: "rt", axis: "y", from: ["hr", "rt"], to: ["right", "rt"], name: "Right wing, front wall" },
  { id: "right", param: "right", axis: "x", from: ["right", "rt"], to: ["right", "rb"], name: "Right wing, end wall" },
  { id: "rightBottom", param: "rb", axis: "y", from: ["fr", "rb"], to: ["right", "rb"], name: "Right wing, back wall" },
  { id: "footR", param: "fr", axis: "x", from: ["fr", "rb"], to: ["fr", "bottom"], name: "Nave, right wall" },
  { id: "bottom", param: "bottom", axis: "y", from: ["fl", "bottom"], to: ["fr", "bottom"], name: "Back wall" },
  { id: "footL", param: "fl", axis: "x", from: ["fl", "lb"], to: ["fl", "bottom"], name: "Nave, left wall" },
  { id: "leftBottom", param: "lb", axis: "y", from: ["left", "lb"], to: ["fl", "lb"], name: "Left wing, back wall" },
  { id: "left", param: "left", axis: "x", from: ["left", "lt"], to: ["left", "lb"], name: "Left wing, end wall" },
  { id: "leftTop", param: "lt", axis: "y", from: ["left", "lt"], to: ["hl", "lt"], name: "Left wing, front wall" },
  { id: "headL", param: "hl", axis: "x", from: ["hl", "top"], to: ["hl", "lt"], name: "Front arm, left wall" },
];

/** Corner points of a cross-shaped hall, clockwise from the front-left corner. */
export function crossPoints(shape) {
  const a = crossWalls(shape);
  return [
    [a.hl, a.top],
    [a.hr, a.top],
    [a.hr, a.rt],
    [a.right, a.rt],
    [a.right, a.rb],
    [a.fr, a.rb],
    [a.fr, a.bottom],
    [a.fl, a.bottom],
    [a.fl, a.lb],
    [a.left, a.lb],
    [a.left, a.lt],
    [a.hl, a.lt],
  ];
}

function CrossGraphic({ shape, selected }) {
  const st = SHAPE_STYLE.cross;
  const label = shape.label ?? "";
  const walls = crossWalls(shape);
  return (
    <g>
      <polygon
        points={crossPoints(shape).map((p) => p.join(",")).join(" ")}
        fill={st.fill}
        stroke={selected ? "#c8a840" : st.stroke}
        strokeWidth={st.strokeWidth}
        strokeLinejoin="round"
      />
      {label ? (
        <text
          x={(walls.hl + walls.hr) / 2}
          y={shape.y + st.textSize * 0.9 + 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={700}
          fontSize={st.textSize}
          fill={st.text}
          letterSpacing={4}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {String(label).toUpperCase()}
        </text>
      ) : null}
    </g>
  );
}

export function ShapeGraphic({ shape, selected = false }) {
  if (shape.type === "cross") return <CrossGraphic shape={shape} selected={selected} />;
  const st = SHAPE_STYLE[shape.type] || SHAPE_STYLE.area;
  const cx = shape.x + shape.w / 2;
  const cy = shape.y + shape.h / 2;
  const label = shape.label ?? (shape.type === "label" ? "Text" : "");
  const outside = st.labelOutside;
  const vertical = shape.h > shape.w * 2.2 && shape.type !== "label";
  // Big areas usually contain other things (pulpit on the platform, seats in the hall), so their label sits on the top edge.
  const topLabel = !outside && !vertical && ["room", "stage", "choir", "area"].includes(shape.type) && shape.h >= st.textSize * 4;
  const labelY = outside ? shape.y + shape.h + st.textSize + 2 : topLabel ? shape.y + st.textSize * 0.9 + 6 : cy;
  const isRoom = shape.type === "room" && topLabel;
  const labelX = isRoom ? shape.x + 20 : cx;
  return (
    <g>
      {shape.type !== "label" ? (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={Math.min(st.rx, shape.w / 2, shape.h / 2)}
          fill={st.fill}
          stroke={selected ? "#c8a840" : st.stroke}
          strokeWidth={selected ? Math.max(st.strokeWidth, 3) : st.strokeWidth}
          strokeDasharray={st.dash}
        />
      ) : selected ? (
        <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill="none" stroke="#c8a840" strokeWidth={2} strokeDasharray="5 4" />
      ) : null}
      {label ? (
        <text
          x={labelX}
          y={labelY}
          textAnchor={isRoom ? "start" : "middle"}
          dominantBaseline={outside ? "auto" : "central"}
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={shape.type === "label" ? 800 : 700}
          fontSize={st.textSize}
          fill={st.text}
          letterSpacing={shape.type === "room" ? 4 : 0.5}
          transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
          style={{ pointerEvents: "none", userSelect: "none", textTransform: "uppercase" }}
        >
          {shape.type === "room" ? String(label).toUpperCase() : label}
        </text>
      ) : null}
    </g>
  );
}

/** A chair drawn around its centre point: seat cushion plus a backrest facing the platform (up). */
export function SeatGraphic({ seat, size, colors, selected = false, highlight = false, showLabel = true }) {
  const half = size / 2;
  const x = seat.x - half;
  const y = seat.y - half;
  const back = Math.max(3, size * 0.16);
  const strokeW = selected || highlight ? 2.6 : 1.4;
  const stroke = selected ? "#c8a840" : highlight ? "#f59e0b" : colors.stroke;
  const fontSize = Math.max(7, Math.min(size * 0.36, 13));
  return (
    <g>
      {highlight ? (
        <circle cx={seat.x} cy={seat.y} r={size * 0.95} fill="rgba(245,158,11,0.2)" stroke="none">
          <animate attributeName="r" values={`${size * 0.7};${size};${size * 0.7}`} dur="1.6s" repeatCount="indefinite" />
        </circle>
      ) : null}
      <rect
        x={x + size * 0.06}
        y={y}
        width={size * 0.88}
        height={back}
        rx={back / 2}
        fill={colors.stroke}
        opacity={0.85}
      />
      <rect
        x={x}
        y={y + back + 1.5}
        width={size}
        height={size - back - 1.5}
        rx={Math.max(3, size * 0.2)}
        fill={colors.fill}
        stroke={stroke}
        strokeWidth={strokeW}
      />
      {showLabel && size >= 18 ? (
        <text
          x={seat.x}
          y={y + back + 1.5 + (size - back - 1.5) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Plus Jakarta Sans", system-ui, sans-serif'
          fontWeight={800}
          fontSize={fontSize}
          fill={colors.text}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {seat.label}
        </text>
      ) : null}
    </g>
  );
}

/**
 * Read-only seat map with status colours. Used by the booking monitor.
 */
export function SeatMapSvg({ layout, onSeatClick, selectedSeatId, highlightSeatId, zoom = 1, colorFor }) {
  if (!layout) return null;
  const size = layout.seat_size || 28;
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width * zoom}
      height={layout.height * zoom}
      style={{ display: "block", background: "#f8fafc", borderRadius: 12 }}
    >
      {(layout.shapes || []).map((shape) => (
        <ShapeGraphic key={shape.id} shape={shape} />
      ))}
      {(layout.seats || []).map((seat) => {
        const status = colorFor ? colorFor(seat) : seatStatusFor(seat);
        const colors = SEAT_COLORS[status] || SEAT_COLORS.available;
        return (
          <g
            key={seat.id}
            onClick={onSeatClick ? () => onSeatClick(seat) : undefined}
            style={{ cursor: onSeatClick ? "pointer" : "default" }}
          >
            <title>
              {seat.label}
              {seat.section ? ` · ${seat.section}` : ""}
              {seat.booking?.user_name ? ` · ${seat.booking.user_name}` : ""}
            </title>
            <SeatGraphic
              seat={seat}
              size={size}
              colors={colors}
              selected={selectedSeatId === seat.id}
              highlight={highlightSeatId === seat.id}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function SeatLegend({ keys = ["available", "booked", "present", "absent", "blocked"], sx }) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={sx}>
      {keys.map((k) => {
        const c = SEAT_COLORS[k];
        return (
          <Stack key={k} direction="row" spacing={0.75} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "5px",
                bgcolor: c.fill,
                border: `2px solid ${c.stroke}`,
              }}
            />
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", fontWeight: 700, color: textSecondary }}>
              {c.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export function CapacityBar({ booked = 0, total = 0, height = 8 }) {
  const pct = total ? Math.min(100, Math.round((booked / total) * 100)) : 0;
  const color = pct >= 90 ? "#dc2626" : pct >= 65 ? "#d97706" : "#1B5EA8";
  return (
    <Box>
      <Box sx={{ height, borderRadius: height, bgcolor: "rgba(27,94,168,0.1)", overflow: "hidden" }}>
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: height,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: "width 0.5s ease",
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.6 }}>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 700, color: textSecondary }}>
          {booked} of {total} seats booked
        </Typography>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", fontWeight: 800, color: textMuted }}>
          {pct}%
        </Typography>
      </Stack>
    </Box>
  );
}
