import React from "react";
import { useNavigate } from "react-router-dom";
import { RoleTabs } from "../Users/usersUi";
import { PROGRAMME_TABS } from "./programmesShared";

/** Tab strip only — search lives in the green UsersHero via ProgrammeHeroSearch. */
export default function ProgrammesTabs({ value }) {
  const navigate = useNavigate();
  const activeTab = Math.max(
    0,
    PROGRAMME_TABS.findIndex((t) => t.value === value)
  );

  return (
    <RoleTabs
      tabs={PROGRAMME_TABS.map((t) => ({ label: t.label, value: t.value }))}
      activeTab={activeTab}
      onChange={(_e, idx) => {
        const tab = PROGRAMME_TABS[idx];
        if (tab) navigate(tab.path);
      }}
    />
  );
}
