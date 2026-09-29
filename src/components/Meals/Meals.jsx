import React from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  Insights as InsightsIcon,
  Schedule as ScheduleIcon,
  HowToReg as HowToRegIcon,
  ListAlt as ListAltIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { fadeUp } from "../Users/usersUi";
import { accentGold, fontBody, fontDisplay, navy, primaryDark, primaryGreen } from "../Users/usersShared";
import MealsDashboard from "./MealsDashboard";
import MealTimes from "./MealTimes";
import ManualMarking from "./ManualMarking";
import ServingLog from "./ServingLog";
import CardDownloads from "./CardDownloads";

const TABS = [
  { value: "dashboard", label: "Dashboard", icon: InsightsIcon, Component: MealsDashboard },
  { value: "times", label: "Meal times", icon: ScheduleIcon, Component: MealTimes },
  { value: "mark", label: "Manual marking", icon: HowToRegIcon, Component: ManualMarking },
  { value: "log", label: "Serving log", icon: ListAltIcon, Component: ServingLog },
  { value: "downloads", label: "Card downloads", icon: DownloadIcon, Component: CardDownloads },
];

export default function Meals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.find((t) => t.value === searchParams.get("tab")) || TABS[0];
  const Active = tab.Component;

  const selectTab = (value) => {
    setSearchParams(value === TABS[0].value ? {} : { tab: value }, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 72px)",
        mx: { xs: -1.5, sm: -2, md: -3 },
        mt: { xs: -1, sm: -1.5 },
        mb: { xs: -1.5, sm: -2, md: -3 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--kd-page-b)",
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55 }}
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 1.5, sm: 1.75 },
          background: `linear-gradient(125deg, ${navy} 0%, ${primaryDark} 42%, ${primaryGreen} 100%)`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(200,168,64,0.16)",
            pointerEvents: "none",
          }}
        />
        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              flexShrink: 0,
            }}
          >
            <RestaurantIcon sx={{ color: accentGold, fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.62rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.2,
              }}
            >
              Student services
            </Typography>
            <Typography
              sx={{
                fontFamily: fontDisplay,
                fontWeight: 700,
                fontSize: { xs: "1.35rem", sm: "1.5rem" },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Meals
            </Typography>
            <Typography
              sx={{
                fontFamily: fontBody,
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.35,
                mt: 0.2,
                display: { xs: "none", sm: "block" },
              }}
            >
              Meal times, cafeteria servings and meal card downloads. Cards are scanned in the catering app.
            </Typography>
          </Box>
        </Stack>

        <Tabs
          value={tab.value}
          onChange={(_, v) => selectTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 1.25,
            position: "relative",
            zIndex: 1,
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              minHeight: 38,
              color: "rgba(255,255,255,0.62)",
              px: 1.5,
              fontSize: "0.88rem",
            },
            "& .Mui-selected": { color: "#fff !important" },
            "& .MuiTabs-indicator": { bgcolor: accentGold, height: 3, borderRadius: 2 },
            "& .MuiTabs-scrollButtons": { color: "#fff" },
          }}
        >
          {TABS.map(({ value, label, icon: Icon }) => (
            <Tab key={value} value={value} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" label={label} />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3 },
          background: `
            radial-gradient(ellipse 80% 50% at 100% 0%, rgba(27,94,168,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(200,168,64,0.08) 0%, transparent 50%),
            var(--kd-page-b)
          `,
        }}
      >
        <AnimatePresence mode="wait">
          <Box
            key={tab.value}
            component={motion.div}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            sx={{ maxWidth: 1280, mx: "auto", width: "100%" }}
          >
            <Active />
          </Box>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
