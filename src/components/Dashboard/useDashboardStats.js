import { useCallback, useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "../../lib/cachedFetch";
import { authJsonHeaders, getPortalToken } from "../Users/usersShared";
import { buildFilterSummary } from "./dashboardTheme";

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [programmeId, setProgrammeId] = useState("");

  const loadStats = useCallback(async () => {
    const token = getPortalToken();
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (programmeId) params.set("programme_id", programmeId);
      const { ok, data } = await cachedFetchJson(`/api/dashboard/stats?${params}`, {
        headers: authJsonHeaders(token),
      });
      if (!ok || !data.success) {
        throw new Error(data.message || "Could not load dashboard stats.");
      }
      setStats(data.data);
    } catch (err) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [programmeId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const programmeName = useMemo(() => {
    if (!programmeId) return "";
    return (
      stats?.filter_options?.programmes?.find((p) => p.id === programmeId)?.name || ""
    );
  }, [programmeId, stats]);

  const departmentNames = useMemo(
    () => (stats?.filter_options?.departments || []).map((d) => d.name),
    [stats]
  );

  const filterMeta = useMemo(
    () => ({
      programmeName,
      departmentNames,
    }),
    [programmeName, departmentNames]
  );

  const filterSummary = useMemo(() => buildFilterSummary(filterMeta), [filterMeta]);
  const filterLabel = programmeName || (departmentNames.length ? departmentNames.join(", ") : "");

  return {
    loading,
    error,
    setError,
    stats,
    programmeId,
    setProgrammeId,
    filterMeta,
    filterSummary,
    filterLabel,
    reload: loadStats,
  };
}
