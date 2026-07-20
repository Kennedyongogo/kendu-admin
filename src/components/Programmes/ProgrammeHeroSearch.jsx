import React from "react";
import { Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { inputSx, navy } from "./programmesShared";

/** Search field styled for the green UsersHero, meant to sit beside the create button. */
export default function ProgrammeHeroSearch({
  value,
  onChange,
  placeholder = "Search…",
  children,
}) {
  // Always use dark ink on this field: the hero is green in both themes,
  // and theme text tokens flip to light in dark mode (unreadable on white glass).
  const ink = navy;
  const inkMuted = "rgba(30, 40, 88, 0.55)";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.25}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      <TextField
        size="small"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        sx={{
          ...inputSx,
          width: { xs: "100%", sm: 260 },
          flexShrink: 0,
          "& .MuiOutlinedInput-root": {
            ...inputSx["& .MuiOutlinedInput-root"],
            bgcolor: "rgba(255,255,255,0.96)",
            height: 42,
            color: ink,
            "& fieldset": { borderColor: "rgba(255,255,255,0.55)" },
            "&:hover fieldset": { borderColor: "#fff" },
            "&.Mui-focused fieldset": {
              borderColor: "#fff",
              boxShadow: "0 0 0 3px rgba(255,255,255,0.18)",
            },
          },
          "& .MuiInputBase-input": {
            color: `${ink} !important`,
            WebkitTextFillColor: ink,
            "&::placeholder": {
              color: inkMuted,
              opacity: 1,
              WebkitTextFillColor: inkMuted,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: inkMuted, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />
      {children}
    </Stack>
  );
}
