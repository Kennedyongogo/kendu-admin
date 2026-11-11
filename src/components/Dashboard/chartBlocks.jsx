import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { ChartPanel, EmptyChart, ViewAllButton } from "./DashboardWidgets";
import {
  STATUS_ORDER,
  barChartBaseSx,
  dash,
  truncateLabel,
} from "./dashboardTheme";

function mapToPie(entries, colors) {
  return entries
    .map((row, index) => ({
      id: index,
      label: row.label,
      value: Number(row.value) || 0,
      color: row.color || colors[index % colors.length],
    }))
    .filter((row) => row.value > 0);
}

const PIE_COLORS = [dash.primaryGreen, dash.navy, dash.accentGold, "#0f766e", "#8a6d1c", "#b91c1c"];

export function AdmissionsStatusChart({ stats, navigate, filterLabel, filterSummary, roleLabel, index }) {
  const data = useMemo(
    () =>
      mapToPie(
        STATUS_ORDER.map((s) => ({
          label: s.label,
          value: stats?.charts?.admissions_by_status?.[s.key] || 0,
          color: s.color,
        })),
        PIE_COLORS
      ),
    [stats]
  );

  return (
    <ChartPanel
      index={index}
      title="Applications by status"
      subtitle={`${Number(stats?.school?.admissions_total || 0).toLocaleString()} applications`}
      filterLabel={filterLabel}
      filterSummary={filterSummary}
      roleLabel={roleLabel}
      exportSection="admissions_status"
      programmeId={stats?.filters?.programme_id || ""}
      actions={navigate ? <ViewAllButton onClick={() => navigate("/admissions")} /> : null}
    >
      {data.length ? (
        <>
          <PieChart
            height={240}
            hideLegend
            series={[
              {
                data,
                innerRadius: 58,
                outerRadius: 90,
                paddingAngle: 3,
                cornerRadius: 5,
              },
            ]}
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
          <Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ gap: 1, mt: 1 }}>
            {STATUS_ORDER.map((s) => (
              <Stack key={s.key} direction="row" spacing={0.7} alignItems="center">
                <Box sx={{ width: 9, height: 9, borderRadius: "3px", bgcolor: s.color }} />
                <Typography
                  sx={{
                    fontFamily: dash.fontBody,
                    fontSize: "0.76rem",
                    color: dash.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  {s.label} · {Number(stats?.charts?.admissions_by_status?.[s.key] || 0)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      ) : (
        <EmptyChart message="No admission applications yet." />
      )}
    </ChartPanel>
  );
}

function ProgrammeBar({
  title,
  subtitle,
  rows,
  color,
  empty,
  navigatePath,
  navigate,
  filterLabel,
  filterSummary,
  roleLabel,
  index,
  exportSection,
  stats,
}) {
  const dataset = useMemo(
    () =>
      (rows || []).map((row) => ({
        programme: truncateLabel(row.name || "Unknown", 20),
        count: Number(row.count) || 0,
      })),
    [rows]
  );
  const max = Math.max(1, ...dataset.map((d) => d.count), 0);

  return (
    <ChartPanel
      index={index}
      title={title}
      subtitle={subtitle}
      filterLabel={filterLabel}
      filterSummary={filterSummary}
      roleLabel={roleLabel}
      exportSection={exportSection}
      programmeId={stats?.filters?.programme_id || ""}
      actions={
        navigate && navigatePath ? <ViewAllButton onClick={() => navigate(navigatePath)} /> : null
      }
    >
      {!dataset.length ? (
        <EmptyChart message={empty} />
      ) : (
        <BarChart
          dataset={dataset}
          height={300}
          xAxis={[
            {
              dataKey: "programme",
              scaleType: "band",
              tickLabelStyle: {
                fontFamily: dash.fontBody,
                fontSize: 11,
                fontWeight: 600,
                fill: dash.textSecondary,
              },
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: Math.ceil(max * 1.15) || 1,
              tickLabelStyle: { fontFamily: dash.fontBody, fontSize: 11, fill: dash.textMuted },
            },
          ]}
          series={[{ dataKey: "count", color, valueFormatter: (v) => `${v}` }]}
          borderRadius={8}
          grid={{ horizontal: true }}
          margin={{ top: 16, bottom: 48, left: 44, right: 12 }}
          hideLegend
          sx={barChartBaseSx}
        />
      )}
    </ChartPanel>
  );
}

export function AdmissionsProgrammeChart(props) {
  return (
    <ProgrammeBar
      title="Applications by programme"
      subtitle="Where applicants want to study"
      rows={props.stats?.charts?.admissions_by_programme}
      color={dash.navy}
      empty="No programme applications yet."
      navigatePath="/admissions"
      exportSection="admissions_programme"
      {...props}
    />
  );
}

export function StudentsProgrammeChart(props) {
  return (
    <ProgrammeBar
      title="Students by programme"
      subtitle={`${Number(props.stats?.school?.students || 0).toLocaleString()} enrolled`}
      rows={props.stats?.charts?.students_by_programme}
      color={dash.primaryGreen}
      empty="No enrolled students with a programme yet."
      navigatePath="/students"
      exportSection="students_programme"
      {...props}
    />
  );
}

function SimpleStatusPie({
  title,
  subtitle,
  map,
  order,
  empty,
  filterLabel,
  filterSummary,
  roleLabel,
  index,
  navigate,
  navigatePath,
  exportSection,
  stats,
}) {
  const data = useMemo(() => {
    if (order?.length) {
      return mapToPie(
        order.map((item) => ({
          label: item.label,
          value: map?.[item.key] || 0,
          color: item.color,
        })),
        PIE_COLORS
      );
    }
    return mapToPie(
      Object.entries(map || {}).map(([key, value]) => ({
        label: String(key).replace(/_/g, " "),
        value,
      })),
      PIE_COLORS
    );
  }, [map, order]);

  return (
    <ChartPanel
      index={index}
      title={title}
      subtitle={subtitle}
      filterLabel={filterLabel}
      filterSummary={filterSummary}
      roleLabel={roleLabel}
      exportSection={exportSection}
      programmeId={stats?.filters?.programme_id || ""}
      actions={
        navigate && navigatePath ? <ViewAllButton onClick={() => navigate(navigatePath)} /> : null
      }
    >
      {data.length ? (
        <>
          <PieChart
            height={240}
            hideLegend
            series={[{ data, innerRadius: 56, outerRadius: 88, paddingAngle: 3, cornerRadius: 5 }]}
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
          <Stack direction="row" flexWrap="wrap" justifyContent="center" sx={{ gap: 1, mt: 1 }}>
            {data.map((row) => (
              <Stack key={row.label} direction="row" spacing={0.7} alignItems="center">
                <Box sx={{ width: 9, height: 9, borderRadius: "3px", bgcolor: row.color }} />
                <Typography
                  sx={{
                    fontFamily: dash.fontBody,
                    fontSize: "0.76rem",
                    color: dash.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  {row.label} · {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      ) : (
        <EmptyChart message={empty} />
      )}
    </ChartPanel>
  );
}

export function StudentsBoardingChart(props) {
  return (
    <SimpleStatusPie
      title="Boarding status"
      subtitle="Boarders vs non-boarders"
      map={props.stats?.charts?.students_by_boarding}
      order={[
        { key: "boarder", label: "Boarder", color: dash.primaryGreen },
        { key: "non_boarder", label: "Non-boarder", color: dash.navy },
        { key: "unspecified", label: "Unspecified", color: dash.accentGold },
      ]}
      empty="No boarding data yet."
      navigatePath="/students"
      exportSection="students_boarding"
      {...props}
    />
  );
}

export function StudentsGenderChart(props) {
  return (
    <SimpleStatusPie
      title="Gender mix"
      subtitle="Student demographics"
      map={props.stats?.charts?.students_by_gender}
      order={[
        { key: "male", label: "Male", color: dash.navy },
        { key: "female", label: "Female", color: dash.primaryGreen },
        { key: "unspecified", label: "Unspecified", color: dash.accentGold },
      ]}
      empty="No gender data yet."
      navigatePath="/students"
      exportSection="students_gender"
      {...props}
    />
  );
}

export function RegistrationsStatusChart(props) {
  return (
    <SimpleStatusPie
      title="Unit registrations"
      subtitle="Registration pipeline"
      map={props.stats?.charts?.registrations_by_status}
      empty="No registrations yet."
      navigatePath="/registrations"
      exportSection="registrations_status"
      {...props}
    />
  );
}

export function ExamStatusChart(props) {
  return (
    <SimpleStatusPie
      title="Exam periods"
      subtitle="By status"
      map={props.stats?.charts?.exam_periods_by_status}
      empty="No exam periods yet."
      navigatePath="/exam-timetables"
      exportSection="exam_status"
      {...props}
    />
  );
}

export function LibraryLoansChart(props) {
  return (
    <SimpleStatusPie
      title="Library loans"
      subtitle="Circulation by status"
      map={props.stats?.charts?.library_loans_by_status}
      empty="No loans recorded yet."
      navigatePath="/library"
      exportSection="library_loans"
      {...props}
    />
  );
}

export function OfficeRolesChart(props) {
  const rows = props.stats?.charts?.office_roles || [];
  const dataset = rows.map((r) => ({
    role: truncateLabel(r.label || r.role, 16),
    count: Number(r.count) || 0,
  }));
  const max = Math.max(1, ...dataset.map((d) => d.count), 0);

  return (
    <ChartPanel
      index={props.index}
      title="Office staffing"
      subtitle="Accounts by office role"
      filterLabel={props.filterLabel}
      filterSummary={props.filterSummary}
      roleLabel={props.roleLabel}
      exportSection="office_roles"
      programmeId={props.stats?.filters?.programme_id || ""}
      actions={<ViewAllButton onClick={() => props.navigate?.("/users")} />}
    >
      {!dataset.length ? (
        <EmptyChart message="No office accounts yet." />
      ) : (
        <BarChart
          dataset={dataset}
          height={300}
          xAxis={[
            {
              dataKey: "role",
              scaleType: "band",
              tickLabelStyle: {
                fontFamily: dash.fontBody,
                fontSize: 10,
                fontWeight: 600,
                fill: dash.textSecondary,
              },
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: Math.ceil(max * 1.15) || 1,
              tickLabelStyle: { fontFamily: dash.fontBody, fontSize: 11, fill: dash.textMuted },
            },
          ]}
          series={[{ dataKey: "count", color: dash.navy }]}
          borderRadius={8}
          grid={{ horizontal: true }}
          margin={{ top: 16, bottom: 56, left: 44, right: 12 }}
          hideLegend
          sx={barChartBaseSx}
        />
      )}
    </ChartPanel>
  );
}

export const CHART_RENDERERS = {
  admissions_status: AdmissionsStatusChart,
  admissions_programme: AdmissionsProgrammeChart,
  students_programme: StudentsProgrammeChart,
  students_boarding: StudentsBoardingChart,
  students_gender: StudentsGenderChart,
  registrations_status: RegistrationsStatusChart,
  exam_status: ExamStatusChart,
  library_loans: LibraryLoansChart,
  office_roles: OfficeRolesChart,
};
