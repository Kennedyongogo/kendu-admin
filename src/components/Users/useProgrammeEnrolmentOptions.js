import { useEffect, useState } from "react";
import { getPortalToken } from "./usersShared";

/**
 * Loads year/semester dropdown options for a programme from the API.
 * Resets when programmeId changes.
 */
export default function useProgrammeEnrolmentOptions(programmeId) {
  const [options, setOptions] = useState({
    years: [],
    semesters: [],
    semester_labels: {},
    loading: false,
  });

  useEffect(() => {
    if (!programmeId) {
      setOptions({ years: [], semesters: [], semester_labels: {}, loading: false });
      return undefined;
    }

    let active = true;
    setOptions((prev) => ({ ...prev, loading: true }));

    (async () => {
      try {
        const token = getPortalToken();
        const res = await fetch(`/api/programmes/${programmeId}/enrolment-options`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success) {
          setOptions({ years: [1], semesters: [1, 2], semester_labels: {}, loading: false });
          return;
        }
        setOptions({
          years: Array.isArray(data.data?.years) ? data.data.years : [1],
          semesters: Array.isArray(data.data?.semesters) ? data.data.semesters : [1, 2],
          semester_labels: data.data?.semester_labels || {},
          loading: false,
        });
      } catch {
        if (!active) return;
        setOptions({ years: [1], semesters: [1, 2], semester_labels: {}, loading: false });
      }
    })();

    return () => {
      active = false;
    };
  }, [programmeId]);

  return options;
}
