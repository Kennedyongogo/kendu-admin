import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { RoleTabs } from "../Users/usersUi";
import { PROGRAMME_TABS, inputSx, textMuted } from "./programmesShared";

export default function ProgrammesTabs({
  value,
  search = "",
  onSearchChange,
  searchPlaceholder = "Search…",
}) {
  const navigate = useNavigate();
  const activeTab = Math.max(
    0,
    PROGRAMME_TABS.findIndex((t) => t.value === value)
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        mb: 2.5,
        width: "100%",
      }}
    >
      <Box sx={{ minWidth: 0, "& > *": { mb: "0 !important" } }}>
        <RoleTabs
          tabs={PROGRAMME_TABS.map((t) => ({ label: t.label, value: t.value }))}
          activeTab={activeTab}
          onChange={(_e, idx) => {
            const tab = PROGRAMME_TABS[idx];
            if (tab) navigate(tab.path);
          }}
        />
      </Box>

      {typeof onSearchChange === "function" ? (
        <TextField
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          sx={{
            ...inputSx,
            width: { xs: "100%", md: 300 },
            ml: { md: "auto" },
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              ...inputSx["& .MuiOutlinedInput-root"],
              bgcolor: "#fff",
              height: 44,
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
      ) : null}
    </Box>
  );
}
