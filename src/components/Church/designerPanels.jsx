import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  NearMe as SelectIcon,
  EventSeat as SeatIcon,
  GridOn as BlockIcon,
  DeleteOutline as DeleteIcon,
  FlipToFront as FrontIcon,
  FlipToBack as BackIcon,
  AlignHorizontalCenter as AlignRowIcon,
  AlignVerticalCenter as AlignColIcon,
  ViewWeek as DistributeIcon,
  Sell as LabelIcon,
  Lock as LockIcon,
  ContentCopy as CopyIcon,
  DoNotDisturbOn as BlockSeatIcon,
  Category as PartsIcon,
  RotateRight as RotateIcon,
  LibraryAddCheck as TickIcon,
} from "@mui/icons-material";
import { PremiumDialog } from "../Users/usersUi";
import {
  fontBody,
  fontDisplay,
  ghostBtnSx,
  inputSx,
  primaryBtnSx,
  primaryGreen,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";
import { rowLetters, SERVICE_TYPES, SHAPE_STYLE, SHAPE_TYPES } from "./churchShared";

// Outlined field ~45px tall whose label rests centred like a placeholder and floats into the border on focus.
// The label offsets must match the input padding, so both are set here together.
export const floatInputSx = {
  ...inputSx,
  "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], borderRadius: "12px", fontSize: "0.88rem" },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": { py: "12.5px", px: "14px", height: "1.4375em" },
  "& .MuiInputBase-multiline": { py: "12.5px", px: "14px" },
  "& .MuiOutlinedInput-root.MuiAutocomplete-inputRoot": { py: "4px", pl: "9px" },
  "& .MuiOutlinedInput-root.MuiAutocomplete-inputRoot .MuiAutocomplete-input": { py: "8.5px" },
  "& .MuiInputLabel-root": {
    ...inputSx["& .MuiInputLabel-root"],
    fontSize: "0.88rem",
    transition: "transform 180ms cubic-bezier(0.2, 0, 0, 1), color 180ms ease, font-size 180ms ease",
    "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": { transform: "translate(14px, 12.5px) scale(1)" },
    "&.MuiInputLabel-shrink": { transform: "translate(14px, -8px) scale(0.75)" },
  },
  "& .MuiFormHelperText-root": { fontFamily: fontBody, fontSize: "0.7rem", mx: 0.5, mt: 0.5, lineHeight: 1.35 },
};

const smallInputSx = floatInputSx;

/**
 * Date/time field with a floating label. Browsers always paint "dd/mm/yyyy --:--" in empty date inputs,
 * so that text is hidden until the field is focused or filled, letting the label sit centred instead.
 */
function FloatDateField({ value, onChange, label, sx, ...rest }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || !!value;
  return (
    <TextField
      {...rest}
      type="datetime-local"
      label={label}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputLabelProps={{ shrink: raised }}
      sx={{
        ...sx,
        ...(raised
          ? null
          : {
              "& .MuiOutlinedInput-root input.MuiInputBase-input": { color: "transparent" },
              "& .MuiOutlinedInput-root input::-webkit-calendar-picker-indicator": { opacity: 0 },
            }),
      }}
    />
  );
}

export function SectionTitle({ children, sx }) {
  return (
    <Typography
      sx={{
        fontFamily: fontBody,
        fontSize: "0.64rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: textMuted,
        mb: 1,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

const floatingCardSx = {
  pointerEvents: "auto",
  bgcolor: "var(--kd-surface)",
  borderRadius: "16px",
  border: "1px solid rgba(27,94,168,0.12)",
  boxShadow: "0 18px 40px -22px rgba(20,26,58,0.45)",
};

function RailButton({ active, onClick, icon, title, shortcut }) {
  return (
    <Tooltip
      placement="right"
      disableInteractive
      title={
        <span>
          {title}
          {shortcut ? <b style={{ marginLeft: 8, opacity: 0.7 }}>{shortcut}</b> : null}
        </span>
      }
    >
      <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-label={title}
        aria-pressed={active}
        sx={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: "12px",
          color: active ? "#fff" : textSecondary,
          bgcolor: active ? primaryGreen : "transparent",
          boxShadow: active ? "0 8px 18px -10px rgba(27,94,168,0.9)" : "none",
          transition: "all 0.15s ease",
          "&:hover": { bgcolor: active ? primaryGreen : "rgba(27,94,168,0.08)", color: active ? "#fff" : primaryGreen },
          "&:focus-visible": { outline: `2px solid ${primaryGreen}`, outlineOffset: 2 },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}

function ShapeSwatch({ type }) {
  const st = SHAPE_STYLE[type];
  if (type === "label") {
    return <Box sx={{ width: 18, textAlign: "center", fontWeight: 900, fontSize: "0.85rem", fontFamily: fontDisplay }}>T</Box>;
  }
  if (type === "cross") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }} aria-hidden>
        <polygon points="6.5,1 11.5,1 11.5,5 17,5 17,9 11.5,9 11.5,17 6.5,17 6.5,9 1,9 1,5 6.5,5" fill={st.fill} stroke={st.stroke} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <Box
      sx={{
        width: 18,
        height: 14,
        borderRadius: "4px",
        bgcolor: st.fill,
        border: `2px ${st.dash ? "dashed" : "solid"} ${st.stroke}`,
        flexShrink: 0,
      }}
    />
  );
}

/** Floating tool rail that sits over the top-left of the canvas, plus the hint for the active tool. */
export function FloatingToolbar({ tool, setTool, onAddBlock, seatRow, setSeatRow }) {
  const [partsAnchor, setPartsAnchor] = useState(null);
  const activeShape = SHAPE_TYPES.find((s) => s.type === tool);
  const toggle = (t) => setTool(tool === t ? "select" : t);

  return (
    <Box sx={{ position: "absolute", left: 14, top: 14, zIndex: 6, display: "flex", alignItems: "flex-start", gap: 1.25, pointerEvents: "none" }}>
      <Stack spacing={0.5} alignItems="center" sx={{ ...floatingCardSx, p: 0.625 }}>
        <RailButton active={tool === "select"} onClick={() => setTool("select")} icon={<SelectIcon sx={{ fontSize: 20 }} />} title="Select & move" shortcut="V" />
        <RailButton active={tool === "seat"} onClick={() => toggle("seat")} icon={<SeatIcon sx={{ fontSize: 20 }} />} title={tool === "seat" ? "Single seat (click to turn off)" : "Single seat"} shortcut="S" />
        <RailButton active={false} onClick={onAddBlock} icon={<BlockIcon sx={{ fontSize: 20 }} />} title="Rows of seats" shortcut="B" />
        <RailButton active={tool === "block"} onClick={() => toggle("block")} icon={<BlockSeatIcon sx={{ fontSize: 20 }} />} title={tool === "block" ? "Block / unblock seats (click to turn off)" : "Block / unblock seats"} shortcut="K" />
        <RailButton active={tool === "pick"} onClick={() => toggle("pick")} icon={<TickIcon sx={{ fontSize: 20 }} />} title={tool === "pick" ? "Tick seats (click to turn off)" : "Tick seats to delete many"} shortcut="C" />
        <Divider flexItem sx={{ my: 0.25, borderColor: "rgba(27,94,168,0.12)" }} />
        <RailButton
          active={!!activeShape || !!partsAnchor}
          onClick={(e) => setPartsAnchor(e.currentTarget)}
          icon={activeShape ? <ShapeSwatch type={activeShape.type} /> : <PartsIcon sx={{ fontSize: 20 }} />}
          title={activeShape ? `Building part: ${activeShape.label}` : "Building parts"}
        />
      </Stack>

      {tool === "seat" ? (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ ...floatingCardSx, p: 1, pl: 1.5, maxWidth: 360 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textSecondary, lineHeight: 1.4 }}>
            Click empty space to drop a seat. Click a seat to rename or delete it.
          </Typography>
          <TextField
            label="Row"
            value={seatRow}
            onChange={(e) => setSeatRow(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
            sx={{ ...floatInputSx, width: 84, flexShrink: 0 }}
          />
        </Stack>
      ) : null}
      {tool === "block" ? (
        <Box sx={{ ...floatingCardSx, px: 1.5, py: 1.1, maxWidth: 340, bgcolor: "#fff8ee", borderColor: "rgba(180,83,9,0.25)" }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: "#92400e", lineHeight: 1.45 }}>
            Click or drag across seats to <b>block</b> them. Start on a blocked seat to <b>unblock</b>. Booked seats are skipped.
          </Typography>
        </Box>
      ) : null}
      {tool === "pick" ? (
        <Box sx={{ ...floatingCardSx, px: 1.5, py: 1.1, maxWidth: 360, bgcolor: "#fff5f5", borderColor: "rgba(185,28,28,0.22)" }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: "#991b1b", lineHeight: 1.45 }}>
            Click seats to <b>tick</b> the ones you don't need, drag across a row, or box a block from empty space. Click again to untick. Then{" "}
            <b>Delete</b>. Click the tick button again to turn it off.
          </Typography>
        </Box>
      ) : null}
      {activeShape ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ ...floatingCardSx, px: 1.5, py: 1.1, maxWidth: 340 }}>
          <ShapeSwatch type={activeShape.type} />
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textSecondary, lineHeight: 1.45 }}>
            <b style={{ color: textPrimary }}>{activeShape.label}:</b> click to place it, or drag to draw it in any direction (across or along). R rotates it afterwards. Esc to stop.
          </Typography>
        </Stack>
      ) : null}

      <Menu
        anchorEl={partsAnchor}
        open={!!partsAnchor}
        onClose={() => setPartsAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { ml: 1.25, borderRadius: "16px", p: 1, width: 300, boxShadow: "0 24px 50px -24px rgba(20,26,58,0.5)" } } }}
        MenuListProps={{ sx: { p: 0 } }}
      >
        <SectionTitle sx={{ px: 0.75, pt: 0.25 }}>Building parts</SectionTitle>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
          {SHAPE_TYPES.map((s) => (
            <Tooltip key={s.type} title={s.hint} placement="right" disableInteractive>
              <MenuItem
                selected={tool === s.type}
                onClick={() => {
                  setTool(s.type);
                  setPartsAnchor(null);
                }}
                sx={{
                  borderRadius: "10px",
                  gap: 1,
                  px: 1,
                  py: 0.9,
                  fontFamily: fontBody,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: textPrimary,
                  "&.Mui-selected": { bgcolor: "rgba(27,94,168,0.1)", color: primaryGreen },
                }}
              >
                <ShapeSwatch type={s.type} />
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.label}
                </Box>
              </MenuItem>
            </Tooltip>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}

/** Centred card over an empty canvas offering a template or copying another service's plan. */
export function EmptyPlanCard({ onTemplate, onCopyFrom }) {
  return (
    <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 4, pointerEvents: "none" }}>
      <Box sx={{ ...floatingCardSx, p: 3, maxWidth: 380, textAlign: "center" }}>
        <Box sx={{ width: 52, height: 52, mx: "auto", mb: 1.5, borderRadius: "16px", display: "grid", placeItems: "center", bgcolor: "rgba(27,94,168,0.08)", color: primaryGreen }}>
          <SeatIcon />
        </Box>
        <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.3rem", color: textPrimary }}>Blank plan</Typography>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", color: textSecondary, mt: 0.5, mb: 2, lineHeight: 1.5 }}>
          Start from a ready church layout, reuse another service's seating, or draw with the tools on the left.
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.25 }}>
          <TemplateTile label="Hall" hint="Rectangular, 216 seats" onClick={() => onTemplate("hall")}>
            <rect x="8" y="6" width="48" height="40" rx="4" />
          </TemplateTile>
          <TemplateTile label="Cross" hint="Cross-shaped, 316 seats" onClick={() => onTemplate("cross")}>
            <polygon points="23,4 41,4 41,16 60,16 60,28 41,28 41,50 23,50 23,28 4,28 4,16 23,16" strokeLinejoin="round" />
          </TemplateTile>
        </Box>
        <Button fullWidth startIcon={<CopyIcon />} onClick={onCopyFrom} sx={{ ...ghostBtnSx, fontSize: "0.84rem", border: "1px solid rgba(27,94,168,0.18)" }}>
          Copy from another service…
        </Button>
      </Box>
    </Box>
  );
}

function TemplateTile({ label, hint, onClick, children }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        border: "1.5px solid rgba(27,94,168,0.18)",
        borderRadius: "14px",
        bgcolor: "rgba(27,94,168,0.03)",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        fontFamily: fontBody,
        transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
        "&:hover": { borderColor: primaryGreen, bgcolor: "rgba(27,94,168,0.07)", transform: "translateY(-1px)" },
        "&:focus-visible": { outline: `2px solid ${primaryGreen}`, outlineOffset: 2 },
      }}
    >
      <svg width="64" height="54" viewBox="0 0 64 54" fill="#fbfaf6" stroke="#1e2858" strokeWidth="3" aria-hidden>
        {children}
      </svg>
      <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.86rem", color: textPrimary }}>{label}</Typography>
      <Typography sx={{ fontFamily: fontBody, fontSize: "0.7rem", color: textMuted }}>{hint}</Typography>
    </Box>
  );
}

export function DetailsForm({ details, setDetails, readOnly }) {
  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));
  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0, pt: 0.75 }}>
      <TextField label="Service title" value={details.title} onChange={set("title")} sx={floatInputSx} fullWidth required disabled={readOnly} placeholder="e.g. Sabbath Divine Service" />
      <Autocomplete
        freeSolo
        options={SERVICE_TYPES}
        value={details.service_type || ""}
        onInputChange={(_, v) => setDetails((d) => ({ ...d, service_type: v }))}
        disabled={readOnly}
        renderInput={(params) => <TextField {...params} label="Type of service" placeholder="Divine service, Vespers…" sx={floatInputSx} />}
      />
      <FloatDateField label="Starts" value={details.starts_at} onChange={set("starts_at")} sx={floatInputSx} fullWidth required disabled={readOnly} />
      <FloatDateField label="Ends" value={details.ends_at} onChange={set("ends_at")} sx={floatInputSx} fullWidth disabled={readOnly} />
      <FloatDateField
        label="Booking closes"
        value={details.booking_closes_at}
        onChange={set("booking_closes_at")}
        sx={floatInputSx}
        fullWidth
        disabled={readOnly}
        helperText="Leave empty to close when the service starts"
      />
      <TextField
        label="Notes for students"
        value={details.description}
        onChange={set("description")}
        fullWidth
        multiline
        rows={3}
        disabled={readOnly}
        placeholder="Speaker, dress code, arrival time…"
        sx={{
          ...floatInputSx,
          flex: 1,
          minHeight: 96,
          "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
          "& textarea": { height: "100% !important", overflow: "auto !important", lineHeight: 1.5 },
        }}
      />
    </Stack>
  );
}

function NumField({ label, value, onChange, min, max, step = 1, disabled }) {
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => setText(String(value ?? "")), [value]);
  return (
    <TextField
      size="small"
      type="number"
      label={label}
      value={text}
      disabled={disabled}
      inputProps={{ min, max, step }}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const n = Number(text);
        if (Number.isFinite(n)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
        else setText(String(value ?? ""));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      sx={smallInputSx}
      fullWidth
    />
  );
}

/** Text field that saves on blur / Enter. If onCommit returns a message, it is shown and nothing is saved. */
function TextCommit({ label, value, onCommit, disabled, error, helperText, placeholder, inputProps }) {
  const [text, setText] = useState(value ?? "");
  const [problem, setProblem] = useState("");
  useEffect(() => {
    setText(value ?? "");
    setProblem("");
  }, [value]);
  return (
    <TextField
      size="small"
      label={label}
      value={text}
      disabled={disabled}
      error={error || !!problem}
      helperText={problem || helperText}
      placeholder={placeholder}
      inputProps={inputProps}
      onChange={(e) => {
        setText(e.target.value);
        setProblem("");
      }}
      onBlur={() => {
        if (text === (value ?? "")) return;
        const msg = onCommit(text);
        if (typeof msg === "string" && msg) setProblem(msg);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      sx={smallInputSx}
      fullWidth
    />
  );
}

function StatLine({ label, value, color }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.4 }}>
      <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>{label}</Typography>
      <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", fontWeight: 800, color: color || textPrimary }}>{value}</Typography>
    </Stack>
  );
}

export function PropertiesPanel({
  layout,
  selection,
  lockedSeats,
  onCanvas,
  onUpdateShape,
  onUpdateSeat,
  onUpdateSeats,
  onRenameSeat,
  onSetBookable,
  onDelete,
  onOrder,
  onRotate,
  onAlign,
  onRelabel,
}) {
  const shapes = layout.shapes.filter((s) => selection.shapes.includes(s.id));
  const seats = layout.seats.filter((s) => selection.seats.includes(s.id));

  const sections = useMemo(() => {
    const m = new Map();
    for (const s of layout.seats) {
      const k = s.section || "No section";
      const v = m.get(k) || { total: 0, blocked: 0 };
      v.total += 1;
      if (s.bookable === false) v.blocked += 1;
      m.set(k, v);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [layout.seats]);

  if (!shapes.length && !seats.length) {
    const blocked = layout.seats.filter((s) => s.bookable === false).length;
    const tiles = [
      { label: "Seats", value: layout.seats.length, color: textPrimary, bg: "rgba(27,94,168,0.06)" },
      { label: "Bookable", value: layout.seats.length - blocked, color: "#047857", bg: "rgba(4,120,87,0.08)" },
      { label: "Blocked", value: blocked, color: blocked ? "#b45309" : textMuted, bg: "rgba(180,83,9,0.07)" },
    ];
    return (
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Box>
          <SectionTitle>Seating summary</SectionTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.75 }}>
            {tiles.map((t) => (
              <Box key={t.label} sx={{ borderRadius: "12px", bgcolor: t.bg, px: 1, py: 1, textAlign: "center" }}>
                <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.35rem", color: t.color, lineHeight: 1.1 }}>{t.value}</Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.68rem", fontWeight: 700, color: textMuted }}>{t.label}</Typography>
              </Box>
            ))}
          </Box>
          {lockedSeats.size ? <StatLine label="Already booked (locked)" value={lockedSeats.size} color="#1e2858" /> : null}
        </Box>
        <Box sx={{ flex: 1, minHeight: 72, display: "flex", flexDirection: "column" }}>
          <SectionTitle>Sections</SectionTitle>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", borderRadius: "12px", border: "1px solid rgba(27,94,168,0.1)", px: 1.25, py: 0.5 }}>
            {sections.length ? (
              sections.map(([name, v]) => <StatLine key={name} label={name} value={v.blocked ? `${v.total} (${v.blocked} blocked)` : v.total} />)
            ) : (
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textMuted, py: 1 }}>No seats yet.</Typography>
            )}
          </Box>
        </Box>
        <Box>
          <SectionTitle>Plan size</SectionTitle>
          <Stack direction="row" spacing={1} sx={{ pt: 0.75 }}>
            <NumField label="Width" value={layout.width} min={300} max={6000} step={10} onChange={(v) => onCanvas({ width: v })} />
            <NumField label="Height" value={layout.height} min={300} max={6000} step={10} onChange={(v) => onCanvas({ height: v })} />
            <NumField label="Seat" value={layout.seat_size} min={14} max={80} onChange={(v) => onCanvas({ seat_size: v })} />
          </Stack>
        </Box>
        <Box sx={{ borderRadius: "12px", bgcolor: "rgba(200,168,64,0.1)", px: 1.5, py: 1.1 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textSecondary, lineHeight: 1.55 }}>
            <b>Shortcuts</b> · drag empty space to box-select · Shift+click adds · C ticks seats to delete many · arrows nudge · R rotates a part · Delete removes · Ctrl+D duplicate · Ctrl+Z / Ctrl+Y ·
            Ctrl+scroll zooms
          </Typography>
        </Box>
      </Stack>
    );
  }

  if (shapes.length === 1 && !seats.length) {
    const s = shapes[0];
    return (
      <Stack spacing={1.5}>
        <SectionTitle>Building part</SectionTitle>
        <TextField select size="small" label="Type" value={s.type} onChange={(e) => onUpdateShape(s.id, { type: e.target.value })} sx={smallInputSx} fullWidth>
          {SHAPE_TYPES.map((t) => (
            <MenuItem key={t.type} value={t.type} sx={{ fontFamily: fontBody, fontSize: "0.85rem" }}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextCommit label="Label" value={s.label ?? ""} onCommit={(v) => onUpdateShape(s.id, { label: v.trim() || null })} />
        {s.type === "cross" ? (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textSecondary, lineHeight: 1.5, px: 1.25, py: 1, borderRadius: "10px", bgcolor: "rgba(27,94,168,0.06)" }}>
            Drag a <b style={{ color: "#1B5EA8" }}>blue grip</b> on any wall to move just that wall: make a wing longer, the nave wider or the front arm
            deeper. Doors and windows on that wall move with it. The gold corner grips resize the whole church with everything inside; hold <b>Alt</b>{" "}
            to resize only the walls. Drag the floor to move it all.
          </Typography>
        ) : null}
        {s.type === "room" ? (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textSecondary, lineHeight: 1.5, px: 1.25, py: 1, borderRadius: "10px", bgcolor: "rgba(27,94,168,0.06)" }}>
            Drag the gold handles to resize the church, or drag the floor to move it. Seats and parts inside move with it. Hold <b>Alt</b> while dragging to
            change only the walls.
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1}>
          <NumField label="X" value={s.x} onChange={(v) => onUpdateShape(s.id, { x: v })} />
          <NumField label="Y" value={s.y} onChange={(v) => onUpdateShape(s.id, { y: v })} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <NumField label="Width" value={s.w} min={4} onChange={(v) => onUpdateShape(s.id, { w: v })} />
          <NumField label="Height" value={s.h} min={4} onChange={(v) => onUpdateShape(s.id, { h: v })} />
        </Stack>
        {s.type !== "room" && s.type !== "cross" ? (
          <Button
            size="small"
            startIcon={<RotateIcon />}
            onClick={onRotate}
            sx={{ ...ghostBtnSx, color: primaryGreen, border: "1px solid rgba(27,94,168,0.2)", bgcolor: "rgba(27,94,168,0.05)" }}
          >
            Rotate 90° (R)
          </Button>
        ) : null}
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<FrontIcon />} onClick={() => onOrder("front")} sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(27,94,168,0.15)" }}>
            Front
          </Button>
          <Button size="small" startIcon={<BackIcon />} onClick={() => onOrder("back")} sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(27,94,168,0.15)" }}>
            Back
          </Button>
        </Stack>
        <Button startIcon={<DeleteIcon />} onClick={onDelete} sx={{ ...ghostBtnSx, color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)" }}>
          Delete
        </Button>
      </Stack>
    );
  }

  if (seats.length === 1 && !shapes.length) {
    const s = seats[0];
    const locked = lockedSeats.has(s.id);
    const blocked = s.bookable === false;
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <SectionTitle sx={{ mb: 0 }}>Seat {s.label}</SectionTitle>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "99px",
              fontFamily: fontBody,
              fontSize: "0.68rem",
              fontWeight: 800,
              color: locked ? "#1e2858" : blocked ? "#b45309" : "#047857",
              bgcolor: locked ? "rgba(30,40,88,0.08)" : blocked ? "rgba(180,83,9,0.1)" : "rgba(4,120,87,0.1)",
            }}
          >
            {locked ? "Booked" : blocked ? "Blocked" : "Open"}
          </Box>
        </Stack>
        {locked ? (
          <Alert icon={<LockIcon fontSize="small" />} severity="info" sx={{ borderRadius: "12px", fontFamily: fontBody, fontSize: "0.78rem" }}>
            Booked by {lockedSeats.get(s.id) || "someone"}. It can be moved or renamed, but not removed or blocked.
          </Alert>
        ) : null}
        <TextCommit
          label="Seat label"
          value={s.label}
          inputProps={{ maxLength: 20 }}
          onCommit={(v) => onRenameSeat(s.id, v)}
          helperText="Shown on tickets, e.g. C12. Tip: double-click a seat to rename it on the plan."
        />
        <TextCommit label="Section" value={s.section ?? ""} placeholder="e.g. Left wing, Gallery" onCommit={(v) => onUpdateSeat(s.id, { section: v.trim() || null })} />
        <Stack direction="row" spacing={1}>
          <NumField label="X" value={s.x} onChange={(v) => onUpdateSeat(s.id, { x: v })} />
          <NumField label="Y" value={s.y} onChange={(v) => onUpdateSeat(s.id, { y: v })} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => onSetBookable([s.id], blocked)}
            disabled={locked}
            sx={{
              ...ghostBtnSx,
              flex: 1,
              color: blocked ? "#047857" : "#b45309",
              border: `1px solid ${blocked ? "rgba(4,120,87,0.3)" : "rgba(180,83,9,0.3)"}`,
            }}
          >
            {blocked ? "Unblock seat" : "Block seat"}
          </Button>
          <Button startIcon={<DeleteIcon />} disabled={locked} onClick={onDelete} sx={{ ...ghostBtnSx, flex: 1, color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)" }}>
            Delete
          </Button>
        </Stack>
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.74rem", color: textMuted, lineHeight: 1.5 }}>
          Blocked seats stay on the plan (for ushers, guests, broken chairs…) but nobody can book them. Keyboard: X blocks/unblocks,
          Delete removes, Enter renames.
        </Typography>
      </Stack>
    );
  }

  const lockedCount = seats.filter((s) => lockedSeats.has(s.id)).length;
  return (
    <Stack spacing={1.5}>
      <SectionTitle>
        {seats.length ? `${seats.length} seat${seats.length === 1 ? "" : "s"}` : ""}
        {seats.length && shapes.length ? " + " : ""}
        {shapes.length ? `${shapes.length} part${shapes.length === 1 ? "" : "s"}` : ""} selected
      </SectionTitle>
      {seats.length ? (
        <>
          <TextCommit
            label="Set section for selection"
            value={seats.every((s) => s.section === seats[0].section) ? seats[0].section ?? "" : ""}
            placeholder="Mixed"
            onCommit={(v) => onUpdateSeats(selection.seats, { section: v.trim() || null })}
          />
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => onSetBookable(selection.seats, true)} sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(4,120,87,0.25)", color: "#047857" }}>
              Unblock
            </Button>
            <Button
              size="small"
              onClick={() => onSetBookable(selection.seats, false)}
              sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(180,83,9,0.25)", color: "#b45309" }}
            >
              Block
            </Button>
          </Stack>
          <Button size="small" startIcon={<LabelIcon />} onClick={onRelabel} sx={{ ...ghostBtnSx, border: "1px solid rgba(27,94,168,0.15)" }}>
            Relabel seats…
          </Button>
          <SectionTitle sx={{ mt: 0.5, mb: 0 }}>Arrange</SectionTitle>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Line up in one row">
              <IconButton onClick={() => onAlign("row")} sx={{ border: "1px solid rgba(27,94,168,0.15)", borderRadius: "10px", flex: 1 }}>
                <AlignRowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Line up in one column">
              <IconButton onClick={() => onAlign("col")} sx={{ border: "1px solid rgba(27,94,168,0.15)", borderRadius: "10px", flex: 1 }}>
                <AlignColIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Space evenly left to right">
              <IconButton onClick={() => onAlign("spread")} sx={{ border: "1px solid rgba(27,94,168,0.15)", borderRadius: "10px", flex: 1 }}>
                <DistributeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      ) : null}
      {lockedCount ? (
        <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textMuted }}>
          {lockedCount} booked seat{lockedCount === 1 ? " is" : "s are"} locked and will be skipped when deleting or blocking.
        </Typography>
      ) : null}
      <Button startIcon={<DeleteIcon />} onClick={onDelete} sx={{ ...ghostBtnSx, color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)" }}>
        Delete selection
      </Button>
    </Stack>
  );
}

function nextFreeRow(existingLabels) {
  const used = new Set(
    existingLabels.map((l) => (/^([A-Z]+)\d+$/i.exec(l) || [])[1]?.toUpperCase()).filter(Boolean)
  );
  for (let i = 0; i < 700; i += 1) {
    if (!used.has(rowLetters(i))) return rowLetters(i);
  }
  return "A";
}

function rowIndex(letters) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function SeatBlockDialog({ open, onClose, onAdd, layout }) {
  const size = layout.seat_size;
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      section: "",
      rows: 6,
      cols: 10,
      firstRow: nextFreeRow(layout.seats.map((s) => s.label)),
      firstNumber: 1,
      direction: "ltr",
      seatGap: Math.round(size * 0.3),
      rowGap: Math.round(size * 0.55),
      aisleEvery: 0,
      aisleWidth: size * 2,
    });
  }, [open, layout.seats, size]);

  const labels = useMemo(() => {
    if (!form || !/^[A-Z]+$/.test(form.firstRow)) return [];
    const out = [];
    const start = rowIndex(form.firstRow);
    for (let r = 0; r < form.rows; r += 1) {
      for (let c = 0; c < form.cols; c += 1) out.push(`${rowLetters(start + r)}${form.firstNumber + c}`);
    }
    return out;
  }, [form]);

  const clashes = useMemo(() => {
    const used = new Set(layout.seats.map((s) => s.label.toLowerCase()));
    return labels.filter((l) => used.has(l.toLowerCase()));
  }, [labels, layout.seats]);

  if (!form) return null;
  const set = (k, num = false) => (e) => {
    const v = num ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const total = form.rows * form.cols;
  const tooMany = layout.seats.length + total > 4000;
  const valid = form.rows >= 1 && form.cols >= 1 && form.rows <= 60 && form.cols <= 80 && /^[A-Z]+$/.test(form.firstRow) && !clashes.length && !tooMany;

  const pitch = size + Math.max(0, form.seatGap);
  const blockW = form.cols * pitch + (form.aisleEvery > 0 ? Math.floor((form.cols - 1) / form.aisleEvery) * form.aisleWidth : 0);
  const blockH = form.rows * (size + Math.max(0, form.rowGap));

  return (
    <PremiumDialog
      open={open}
      onClose={onClose}
      title="Add a block of seats"
      subtitle="Rows get letters, seats get numbers, e.g. A1, A2 … B1."
      icon={<BlockIcon />}
      maxWidth="sm"
      footer={
        <>
          <Button onClick={onClose} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onAdd({ ...form, firstNumber: Number(form.firstNumber) })} sx={primaryBtnSx}>
            Add {total} seats
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField label="Section name" value={form.section} onChange={set("section")} placeholder="e.g. Centre block, Left wing, Gallery" sx={smallInputSx} fullWidth />
        <Stack direction="row" spacing={1.5}>
          <TextField type="number" label="Rows" value={form.rows} onChange={set("rows", true)} inputProps={{ min: 1, max: 60 }} sx={smallInputSx} fullWidth />
          <TextField type="number" label="Seats per row" value={form.cols} onChange={set("cols", true)} inputProps={{ min: 1, max: 80 }} sx={smallInputSx} fullWidth />
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="First row letter"
            value={form.firstRow}
            onChange={(e) => setForm((f) => ({ ...f, firstRow: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) }))}
            sx={smallInputSx}
            fullWidth
          />
          <TextField type="number" label="First seat number" value={form.firstNumber} onChange={set("firstNumber", true)} inputProps={{ min: 0, max: 999 }} sx={smallInputSx} fullWidth />
        </Stack>
        <Box>
          <SectionTitle>Seat numbers run</SectionTitle>
          <ToggleButtonGroup exclusive size="small" value={form.direction} onChange={(_, v) => v && setForm((f) => ({ ...f, direction: v }))}>
            <ToggleButton value="ltr" sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 700, px: 2 }}>
              Left → right
            </ToggleButton>
            <ToggleButton value="rtl" sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 700, px: 2 }}>
              Right → left
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField type="number" label="Gap between seats" value={form.seatGap} onChange={set("seatGap", true)} inputProps={{ min: 0, max: 200 }} sx={smallInputSx} fullWidth />
          <TextField type="number" label="Gap between rows" value={form.rowGap} onChange={set("rowGap", true)} inputProps={{ min: 0, max: 200 }} sx={smallInputSx} fullWidth />
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            type="number"
            label="Aisle after every … seats"
            value={form.aisleEvery}
            onChange={set("aisleEvery", true)}
            helperText="0 = no aisle inside the block"
            inputProps={{ min: 0, max: 80 }}
            sx={smallInputSx}
            fullWidth
          />
          <TextField type="number" label="Aisle width" value={form.aisleWidth} onChange={set("aisleWidth", true)} inputProps={{ min: 0, max: 400 }} sx={smallInputSx} fullWidth disabled={!form.aisleEvery} />
        </Stack>
        <Box sx={{ borderRadius: "12px", bgcolor: "rgba(27,94,168,0.05)", px: 1.75, py: 1.25 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.8rem", color: textSecondary }}>
            <b style={{ color: textPrimary }}>{total} seats</b> · labels {labels[0] || "—"} to {labels[labels.length - 1] || "—"} · about {Math.round(blockW)} × {Math.round(blockH)} px on the plan
          </Typography>
        </Box>
        {clashes.length ? (
          <Alert severity="warning" sx={{ borderRadius: "12px", fontFamily: fontBody, fontSize: "0.8rem" }}>
            These labels already exist: {clashes.slice(0, 8).join(", ")}
            {clashes.length > 8 ? "…" : ""}. Choose another first row letter or seat number.
          </Alert>
        ) : null}
        {tooMany ? (
          <Alert severity="error" sx={{ borderRadius: "12px", fontFamily: fontBody, fontSize: "0.8rem" }}>
            A plan can hold at most 4000 seats.
          </Alert>
        ) : null}
      </Stack>
    </PremiumDialog>
  );
}

export function RelabelDialog({ open, onClose, onApply, count, suggestedRow }) {
  const [form, setForm] = useState({ firstRow: "A", firstNumber: 1, direction: "ltr", perRow: true });
  useEffect(() => {
    if (open) setForm((f) => ({ ...f, firstRow: suggestedRow || "A" }));
  }, [open, suggestedRow]);
  return (
    <PremiumDialog
      open={open}
      onClose={onClose}
      title="Relabel selected seats"
      subtitle={`${count} seats. Rows are detected from their position.`}
      icon={<LabelIcon />}
      footer={
        <>
          <Button onClick={onClose} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button disabled={!/^[A-Z]+$/.test(form.firstRow)} onClick={() => onApply(form)} sx={primaryBtnSx}>
            Apply labels
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="First row letter"
            value={form.firstRow}
            onChange={(e) => setForm((f) => ({ ...f, firstRow: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) }))}
            sx={smallInputSx}
            fullWidth
          />
          <TextField type="number" label="First seat number" value={form.firstNumber} onChange={(e) => setForm((f) => ({ ...f, firstNumber: Number(e.target.value) }))} sx={smallInputSx} fullWidth />
        </Stack>
        <ToggleButtonGroup exclusive size="small" value={form.direction} onChange={(_, v) => v && setForm((f) => ({ ...f, direction: v }))}>
          <ToggleButton value="ltr" sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 700, px: 2 }}>
            Left → right
          </ToggleButton>
          <ToggleButton value="rtl" sx={{ textTransform: "none", fontFamily: fontBody, fontWeight: 700, px: 2 }}>
            Right → left
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Switch checked={form.perRow} onChange={(e) => setForm((f) => ({ ...f, perRow: e.target.checked }))} />}
          label={<Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem" }}>Each row gets the next letter (A, B, C…)</Typography>}
        />
      </Stack>
    </PremiumDialog>
  );
}

export function CopyFromDialog({ open, onClose, services, onPick }) {
  return (
    <PremiumDialog open={open} onClose={onClose} title="Copy seating from a service" subtitle="The building and all seats are copied. You can still change them." icon={<CopyIcon />}>
      <Stack spacing={1} sx={{ pb: 1 }}>
        {!services.length ? (
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.85rem", color: textMuted, py: 2, textAlign: "center" }}>
            No other service has a seating plan yet.
          </Typography>
        ) : (
          services.map((s) => (
            <Box
              key={s.id}
              component="button"
              type="button"
              onClick={() => onPick(s)}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                px: 1.75,
                py: 1.25,
                borderRadius: "12px",
                border: "1px solid rgba(27,94,168,0.12)",
                "&:hover": { bgcolor: "rgba(27,94,168,0.05)", borderColor: primaryGreen },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: fontBody, fontWeight: 700, fontSize: "0.88rem", color: textPrimary }}>{s.title}</Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textMuted }}>
                  {new Date(s.starts_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: fontBody, fontWeight: 800, fontSize: "0.8rem", color: primaryGreen, flexShrink: 0 }}>
                {s.seat_count} seats
              </Typography>
            </Box>
          ))
        )}
      </Stack>
    </PremiumDialog>
  );
}
