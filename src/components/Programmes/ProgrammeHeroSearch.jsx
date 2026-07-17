import React from "react";
import { Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { inputSx, textMuted, textPrimary } from "./programmesShared";

/** Search field styled for the green UsersHero, meant to sit beside the create button. */
export default function ProgrammeHeroSearch({
  value,
  onChange,
  placeholder = "Search…",
  children,
}) {
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
            bgcolor: "rgba(255,255,255,0.95)",
            height: 42,
            "& fieldset": { borderColor: "rgba(255,255,255,0.55)" },
            "&:hover fieldset": { borderColor: "#fff" },
            "&.Mui-focused fieldset": { borderColor: "#fff" },
          },
          "& .MuiInputBase-input": {
            color: textPrimary,
            "&::placeholder": { color: textMuted, opacity: 1 },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: textMuted, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />
      {children}
    </Stack>
  );
}
