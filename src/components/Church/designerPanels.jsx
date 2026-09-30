import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
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
  AutoAwesome as TemplateIcon,
  ContentCopy as CopyIcon,
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

const smallInputSx = {
  ...inputSx,
  "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], borderRadius: "10px", fontSize: "0.85rem" },
  "& .MuiInputBase-input": { ...inputSx["& .MuiInputBase-input"], py: 1 },
};

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

function ToolButton({ active, onClick, icon, label, hint }) {
  return (
    <Tooltip title={hint || ""} placement="right" disableInteractive>
      <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
          all: "unset",
          boxSizing: "border-box",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.1,
          py: 0.8,
          borderRadius: "10px",
          fontFamily: fontBody,
          fontSize: "0.8rem",
          fontWeight: 700,
          color: active ? "#fff" : textPrimary,
          bgcolor: active ? primaryGreen : "transparent",
          border: `1px solid ${active ? primaryGreen : "transparent"}`,
          transition: "all 0.15s ease",
          "&:hover": { bgcolor: active ? primaryGreen : "rgba(27,94,168,0.08)" },
        }}
      >
        {icon}
        <span>{label}</span>
      </Box>
    </Tooltip>
  );
}

function ShapeSwatch({ type }) {
  const st = SHAPE_STYLE[type];
  if (type === "label") {
    return <Box sx={{ width: 18, textAlign: "center", fontWeight: 900, fontSize: "0.85rem", fontFamily: fontDisplay }}>T</Box>;
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

export function Toolbox({ tool, setTool, onAddBlock, onTemplate, onCopyFrom, seatRow, setSeatRow, isEmpty }) {
  return (
    <Stack spacing={2}>
      <Box>
        <SectionTitle>Tools</SectionTitle>
        <Stack spacing={0.4}>
          <ToolButton active={tool === "select"} onClick={() => setTool("select")} icon={<SelectIcon sx={{ fontSize: 18 }} />} label="Select & move" hint="Click, shift-click or drag a box to select. Keyboard: V" />
          <ToolButton active={tool === "seat"} onClick={() => setTool("seat")} icon={<SeatIcon sx={{ fontSize: 18 }} />} label="Single seat" hint="Click on the plan to drop seats one by one. Keyboard: S" />
          <ToolButton active={false} onClick={onAddBlock} icon={<BlockIcon sx={{ fontSize: 18 }} />} label="Block of seats" hint="Add rows × seats at once with automatic labels. Keyboard: B" />
        </Stack>
        {tool === "seat" ? (
          <TextField
            size="small"
            label="Row for new seats"
            value={seatRow}
            onChange={(e) => setSeatRow(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
            helperText="Seats get the next number in this row."
            sx={{ ...smallInputSx, mt: 1.25 }}
            fullWidth
          />
        ) : null}
      </Box>

      <Box>
        <SectionTitle>Building parts</SectionTitle>
        <Stack spacing={0.4}>
          {SHAPE_TYPES.map((s) => (
            <ToolButton
              key={s.type}
              active={tool === s.type}
              onClick={() => setTool(s.type)}
              icon={<ShapeSwatch type={s.type} />}
              label={s.label}
              hint={`${s.hint}. Click or drag on the plan to place it.`}
            />
          ))}
        </Stack>
      </Box>

      {isEmpty ? (
        <Box sx={{ borderRadius: "14px", border: "1px dashed rgba(27,94,168,0.3)", p: 1.5, bgcolor: "rgba(27,94,168,0.04)" }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.78rem", color: textSecondary, mb: 1 }}>
            Blank plan. Start from a ready church layout or reuse another service's seating.
          </Typography>
          <Stack spacing={0.75}>
            <Button size="small" startIcon={<TemplateIcon />} onClick={onTemplate} sx={{ ...primaryBtnSx, py: 0.75, px: 1.5, fontSize: "0.8rem" }}>
              Use church template
            </Button>
            <Button size="small" startIcon={<CopyIcon />} onClick={onCopyFrom} sx={{ ...ghostBtnSx, fontSize: "0.8rem", border: "1px solid rgba(27,94,168,0.18)" }}>
              Copy from a service
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}

export function DetailsForm({ details, setDetails, readOnly }) {
  const set = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));
  return (
    <Stack spacing={1.75}>
      <TextField label="Service title" value={details.title} onChange={set("title")} sx={smallInputSx} fullWidth required disabled={readOnly} placeholder="e.g. Sabbath Divine Service" />
      <Autocomplete
        freeSolo
        options={SERVICE_TYPES}
        value={details.service_type || ""}
        onInputChange={(_, v) => setDetails((d) => ({ ...d, service_type: v }))}
        disabled={readOnly}
        renderInput={(params) => <TextField {...params} label="Type of service" sx={smallInputSx} />}
      />
      <TextField type="datetime-local" label="Starts" value={details.starts_at} onChange={set("starts_at")} sx={smallInputSx} fullWidth required disabled={readOnly} InputLabelProps={{ shrink: true }} />
      <TextField type="datetime-local" label="Ends" value={details.ends_at} onChange={set("ends_at")} sx={smallInputSx} fullWidth disabled={readOnly} InputLabelProps={{ shrink: true }} />
      <TextField
        type="datetime-local"
        label="Booking closes"
        value={details.booking_closes_at}
        onChange={set("booking_closes_at")}
        sx={smallInputSx}
        fullWidth
        disabled={readOnly}
        helperText="Empty = closes when the service starts"
        InputLabelProps={{ shrink: true }}
      />
      <TextField label="Notes for students" value={details.description} onChange={set("description")} sx={smallInputSx} fullWidth multiline minRows={3} disabled={readOnly} placeholder="Speaker, dress code, arrival time…" />
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

function TextCommit({ label, value, onCommit, disabled, error, helperText, placeholder }) {
  const [text, setText] = useState(value ?? "");
  useEffect(() => setText(value ?? ""), [value]);
  return (
    <TextField
      size="small"
      label={label}
      value={text}
      disabled={disabled}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => text !== (value ?? "") && onCommit(text)}
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
  onDelete,
  onOrder,
  onAlign,
  onRelabel,
}) {
  const shapes = layout.shapes.filter((s) => selection.shapes.includes(s.id));
  const seats = layout.seats.filter((s) => selection.seats.includes(s.id));
  const labelTaken = (label, id) =>
    layout.seats.some((s) => s.id !== id && s.label.toLowerCase() === String(label).trim().toLowerCase());

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
    return (
      <Stack spacing={2}>
        <Box>
          <SectionTitle>Seating summary</SectionTitle>
          <StatLine label="Seats on the plan" value={layout.seats.length} />
          <StatLine label="Bookable" value={layout.seats.length - blocked} color="#047857" />
          <StatLine label="Reserved (not bookable)" value={blocked} color={blocked ? "#b45309" : undefined} />
          {lockedSeats.size ? <StatLine label="Already booked" value={lockedSeats.size} color="#1e2858" /> : null}
        </Box>
        {sections.length ? (
          <Box>
            <SectionTitle>Sections</SectionTitle>
            {sections.map(([name, v]) => (
              <StatLine key={name} label={name} value={v.blocked ? `${v.total} (${v.blocked} reserved)` : v.total} />
            ))}
          </Box>
        ) : null}
        <Divider />
        <Box>
          <SectionTitle>Plan size</SectionTitle>
          <Stack direction="row" spacing={1}>
            <NumField label="Width" value={layout.width} min={300} max={6000} step={10} onChange={(v) => onCanvas({ width: v })} />
            <NumField label="Height" value={layout.height} min={300} max={6000} step={10} onChange={(v) => onCanvas({ height: v })} />
          </Stack>
          <Box sx={{ mt: 1.25 }}>
            <NumField label="Seat size" value={layout.seat_size} min={14} max={80} onChange={(v) => onCanvas({ seat_size: v })} />
          </Box>
        </Box>
        <Box sx={{ borderRadius: "12px", bgcolor: "rgba(200,168,64,0.1)", p: 1.5 }}>
          <Typography sx={{ fontFamily: fontBody, fontSize: "0.76rem", color: textSecondary, lineHeight: 1.55 }}>
            <b>Shortcuts</b>
            <br />
            Drag on empty space to box-select · Shift+click to add
            <br />
            Arrows nudge (Shift = 10 px) · Delete removes
            <br />
            Ctrl+D duplicate · Ctrl+Z undo · Ctrl+Y redo
            <br />
            Ctrl+scroll to zoom
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
        <Stack direction="row" spacing={1}>
          <NumField label="X" value={s.x} onChange={(v) => onUpdateShape(s.id, { x: v })} />
          <NumField label="Y" value={s.y} onChange={(v) => onUpdateShape(s.id, { y: v })} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <NumField label="Width" value={s.w} min={4} onChange={(v) => onUpdateShape(s.id, { w: v })} />
          <NumField label="Height" value={s.h} min={4} onChange={(v) => onUpdateShape(s.id, { h: v })} />
        </Stack>
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
    return (
      <Stack spacing={1.5}>
        <SectionTitle>Seat</SectionTitle>
        {locked ? (
          <Alert icon={<LockIcon fontSize="small" />} severity="info" sx={{ borderRadius: "12px", fontFamily: fontBody, fontSize: "0.78rem" }}>
            Booked by {lockedSeats.get(s.id) || "someone"}. It can be moved or renamed, but not removed or reserved.
          </Alert>
        ) : null}
        <TextCommit
          label="Seat label"
          value={s.label}
          onCommit={(v) => {
            const label = v.trim().slice(0, 20);
            if (label && !labelTaken(label, s.id)) onUpdateSeat(s.id, { label });
          }}
          helperText="Shown to students, e.g. C12"
        />
        <TextCommit label="Section" value={s.section ?? ""} placeholder="e.g. Left wing, Gallery" onCommit={(v) => onUpdateSeat(s.id, { section: v.trim() || null })} />
        <Stack direction="row" spacing={1}>
          <NumField label="X" value={s.x} onChange={(v) => onUpdateSeat(s.id, { x: v })} />
          <NumField label="Y" value={s.y} onChange={(v) => onUpdateSeat(s.id, { y: v })} />
        </Stack>
        <FormControlLabel
          control={<Switch checked={s.bookable !== false} disabled={locked} onChange={(e) => onUpdateSeat(s.id, { bookable: e.target.checked })} />}
          label={
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.84rem", fontWeight: 600 }}>
              {s.bookable !== false ? "Open for booking" : "Reserved (not bookable)"}
            </Typography>
          }
        />
        <Button startIcon={<DeleteIcon />} disabled={locked} onClick={onDelete} sx={{ ...ghostBtnSx, color: "#b91c1c", border: "1px solid rgba(185,28,28,0.2)" }}>
          Delete seat
        </Button>
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
            <Button size="small" onClick={() => onUpdateSeats(selection.seats, { bookable: true })} sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(4,120,87,0.25)", color: "#047857" }}>
              Open
            </Button>
            <Button
              size="small"
              onClick={() => onUpdateSeats(selection.seats.filter((id) => !lockedSeats.has(id)), { bookable: false })}
              sx={{ ...ghostBtnSx, flex: 1, border: "1px solid rgba(180,83,9,0.25)", color: "#b45309" }}
            >
              Reserve
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
          {lockedCount} booked seat{lockedCount === 1 ? " is" : "s are"} locked and will be skipped when deleting or reserving.
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
