import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  accentGold,
  authJsonHeaders,
  fontBody,
  fontDisplay,
  getInitials,
  inputSx,
  navy,
  pageShellSx,
  primaryDark,
  primaryGreen,
  profileImageSrc,
  textMuted,
  textPrimary,
  textSecondary,
  warmCream,
} from "../Users/usersShared";
import { FormSection, UsersHero, fadeUp } from "../Users/usersUi";

const VISIBLE = 10;

const ROLE_ACCENT = {
  student: primaryGreen,
  staff: navy,
  admin: accentGold,
};

function keepSelectedVisible(slice, selected, matches) {
  if (
    selected &&
    !slice.some((row) => row.id === selected.id) &&
    matches.some((row) => row.id === selected.id)
  ) {
    return [selected, ...slice.slice(0, VISIBLE - 1)];
  }
  return slice;
}

function BookCard({ book, selected, onSelect, index }) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={Math.min(index, 6) * 0.5}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(book)}
      sx={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "var(--kd-surface)",
        border: selected ? `2px solid ${primaryGreen}` : "1px solid rgba(0,96,80,0.12)",
        boxShadow: selected
          ? "0 18px 40px -14px rgba(0,96,80,0.45)"
          : "0 10px 28px -18px rgba(20,26,58,0.16)",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 44px -16px rgba(0,96,80,0.38)",
          borderColor: primaryGreen,
        },
      }}
    >
      <Box
        sx={{
          height: 48,
          background: selected
            ? `linear-gradient(135deg, ${primaryGreen} 0%, ${primaryDark} 100%)`
            : `linear-gradient(135deg, ${warmCream} 0%, rgba(0,96,80,0.1) 100%)`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: selected ? "none" : "2px solid rgba(0,96,80,0.3)",
          bgcolor: selected ? "#fff" : "var(--kd-surface)",
        }}
      >
        {selected ? <CheckCircleRoundedIcon sx={{ fontSize: 24, color: primaryGreen }} /> : null}
      </Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          mx: 1.5,
          mt: -3,
          display: "grid",
          placeItems: "center",
          bgcolor: selected ? primaryGreen : "rgba(0,96,80,0.1)",
          color: selected ? "#fff" : primaryGreen,
          border: "3px solid var(--kd-surface)",
          boxShadow: "0 8px 20px rgba(20,26,58,0.16)",
          position: "relative",
        }}
      >
        <MenuBookRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            color: textPrimary,
            fontSize: "0.92rem",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.3em",
          }}
        >
          {book.title}
        </Typography>
        <Typography noWrap sx={{ mt: 0.6, fontFamily: fontBody, color: textSecondary, fontSize: "0.76rem", fontWeight: 600 }}>
          {book.author || "Author not set"}
        </Typography>
        <Box sx={{ mt: 1.1, pt: 1, borderTop: "1px dashed rgba(0,96,80,0.15)" }}>
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
            <Inventory2RoundedIcon sx={{ fontSize: 15, color: selected ? primaryGreen : accentGold, flexShrink: 0 }} />
            <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textSecondary, fontSize: "0.74rem" }}>
              {book.available} available · {book.quantity} copies
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.45, minWidth: 0 }}>
            <SchoolRoundedIcon sx={{ fontSize: 15, color: textMuted, flexShrink: 0 }} />
            <Typography noWrap sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.7rem", fontWeight: 600 }}>
              {book.programme_name || "General"}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function BorrowerCard({ user, selected, onSelect, index }) {
  const accent = ROLE_ACCENT[user.role] || primaryGreen;
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={Math.min(index, 6) * 0.5}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(user)}
      sx={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: "var(--kd-surface)",
        border: selected ? `2px solid ${primaryGreen}` : "1px solid rgba(0,96,80,0.12)",
        boxShadow: selected
          ? "0 18px 40px -14px rgba(0,96,80,0.45)"
          : "0 10px 28px -18px rgba(20,26,58,0.16)",
        cursor: "pointer",
        textAlign: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 44px -16px rgba(0,96,80,0.38)",
          borderColor: primaryGreen,
        },
      }}
    >
      <Box
        sx={{
          height: 54,
          background: selected
            ? `linear-gradient(135deg, ${primaryGreen} 0%, ${primaryDark} 100%)`
            : `linear-gradient(135deg, ${warmCream} 0%, rgba(0,96,80,0.1) 100%)`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: selected ? "none" : "2px solid rgba(0,96,80,0.3)",
          bgcolor: selected ? "#fff" : "var(--kd-surface)",
        }}
      >
        {selected ? <CheckCircleRoundedIcon sx={{ fontSize: 24, color: primaryGreen }} /> : null}
      </Box>
      <Avatar
        src={profileImageSrc(user)}
        alt={user.full_name}
        sx={{
          width: 60,
          height: 60,
          mx: "auto",
          mt: -3.75,
          fontFamily: fontDisplay,
          fontWeight: 700,
          fontSize: "1.15rem",
          bgcolor: selected ? primaryGreen : accent,
          color: selected ? "#fff" : navy,
          border: "3px solid var(--kd-surface)",
          boxShadow: "0 8px 20px rgba(20,26,58,0.2)",
          position: "relative",
        }}
      >
        {getInitials(user.full_name)}
      </Avatar>
      <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
        <Typography
          noWrap
          sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "0.92rem" }}
        >
          {user.full_name}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.7,
            px: 1.2,
            py: 0.35,
            maxWidth: "100%",
            borderRadius: "999px",
            bgcolor: selected ? "rgba(0,96,80,0.1)" : warmCream,
            border: "1px solid rgba(0,96,80,0.14)",
          }}
        >
          <BadgeRoundedIcon sx={{ fontSize: 14, color: selected ? primaryGreen : textMuted, flexShrink: 0 }} />
          <Typography
            noWrap
            sx={{
              fontFamily: fontBody,
              fontWeight: 700,
              fontSize: "0.72rem",
              color: selected ? primaryGreen : textSecondary,
              textTransform: "capitalize",
            }}
          >
            {user.role}
            {user.admission_number ? ` · ${user.admission_number}` : ""}
          </Typography>
        </Box>
        {user.email ? (
          <Typography noWrap sx={{ mt: 1, fontFamily: fontBody, color: textMuted, fontSize: "0.7rem", fontWeight: 600 }}>
            {user.email}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function PickerSection({
  title,
  subtitle,
  search,
  onSearch,
  searchPlaceholder,
  visible,
  matches,
  emptyIcon,
  emptyTitle,
  emptyHint,
  moreLabel,
  children,
}) {
  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      custom={0}
      initial="hidden"
      animate="visible"
      sx={{
        bgcolor: "var(--kd-surface)",
        border: "1px solid rgba(0,96,80,0.1)",
        borderRadius: "20px",
        boxShadow: "0 12px 36px -16px rgba(20,26,58,0.12)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ md: "center" }}
        spacing={1.5}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(0,96,80,0.08)", bgcolor: warmCream }}
      >
        <Box>
          <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary, fontSize: "1.08rem" }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.74rem" }}>{subtitle}</Typography>
        </Box>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ ...inputSx, width: { xs: "100%", md: 340 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: textMuted }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box sx={{ p: 2 }}>
        {visible.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 1.75,
            }}
          >
            {children}
          </Box>
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
            {emptyIcon}
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, color: textPrimary }}>{emptyTitle}</Typography>
            <Typography sx={{ fontFamily: fontBody, color: textMuted, fontSize: "0.85rem" }}>{emptyHint}</Typography>
          </Stack>
        )}

        {matches.length > visible.length ? (
          <Typography
            sx={{
              mt: 1.75,
              textAlign: "center",
              fontFamily: fontBody,
              color: textMuted,
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            {matches.length - visible.length} more {moreLabel} — refine your search to find them
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function IssueBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const goBack = () => navigate("/library");

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...authJsonHeaders(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }, []);

  const loadBooks = useCallback(async () => {
    const data = await api("/api/library/books?is_active=true&limit=100");
    setBooks((data.data || []).filter((b) => Number(b.available) > 0));
  }, [api]);

  const loadBorrowers = useCallback(
    async (search = "") => {
      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("search", search.trim());
      const data = await api(`/api/library/borrowers?${params}`);
      setBorrowers(data.data || []);
    },
    [api]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await Promise.all([loadBooks(), loadBorrowers()]);
      } catch (err) {
        if (active) setError(err.message || "Failed to load issue form");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadBooks, loadBorrowers]);

  useEffect(() => {
    if (loading) return;
    const t = window.setTimeout(() => {
      loadBorrowers(borrowerSearch).catch((err) => setError(err.message));
    }, 280);
    return () => window.clearTimeout(t);
  }, [borrowerSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const bookMatches = useMemo(() => {
    const q = bookSearch.trim().toLowerCase();
    if (!q) return books;
    return books.filter((book) =>
      [book.title, book.author, book.isbn, book.programme_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [books, bookSearch]);

  const visibleBooks = useMemo(
    () => keepSelectedVisible(bookMatches.slice(0, VISIBLE), selectedBook, bookMatches),
    [bookMatches, selectedBook]
  );

  const visibleBorrowers = useMemo(
    () => keepSelectedVisible(borrowers.slice(0, VISIBLE), selectedBorrower, borrowers),
    [borrowers, selectedBorrower]
  );

  const issueBook = async () => {
    if (!selectedBook) {
      Swal.fire({
        icon: "warning",
        title: "Select a book",
        text: "Choose the book to issue.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }
    if (!selectedBorrower) {
      Swal.fire({
        icon: "warning",
        title: "Select a borrower",
        text: "Choose the student, staff, or admin receiving the book.",
        confirmButtonColor: primaryGreen,
      });
      return;
    }

    setSaving(true);
    try {
      await api("/api/library/loans", {
        method: "POST",
        body: JSON.stringify({
          book_id: selectedBook.id,
          borrower_id: selectedBorrower.id,
          notes: notes.trim() || null,
        }),
      });
      await Swal.fire({
        icon: "success",
        title: "Book issued",
        text: `${selectedBook.title} issued to ${selectedBorrower.full_name}.`,
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/library", { replace: true });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not issue book",
        text: err.message,
        confirmButtonColor: primaryGreen,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <BrandPageLoader message="Loading books & borrowers…" />;

  return (
    <Box sx={pageShellSx}>
      <UsersHero
        title="Issue book"
        subtitle="Select a book and a borrower, then confirm the loan"
        icon={<SwapHorizRoundedIcon sx={{ fontSize: 28, color: "#fff" }} />}
        actions={
          <Tooltip title="Back to library">
            <IconButton
              onClick={goBack}
              type="button"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.22)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "14px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2.5}>
        <PickerSection
          title="Choose a book"
          subtitle={
            selectedBook
              ? `Selected: ${selectedBook.title}`
              : `Showing ${visibleBooks.length} of ${bookMatches.length} available books — search to narrow down`
          }
          search={bookSearch}
          onSearch={setBookSearch}
          searchPlaceholder="Search title, author, ISBN or programme"
          visible={visibleBooks}
          matches={bookMatches}
          emptyIcon={<MenuBookRoundedIcon sx={{ fontSize: 46, color: "rgba(0,96,80,0.25)" }} />}
          emptyTitle="No available books match"
          emptyHint="Try another title, or add copies in the catalogue first."
          moreLabel="books"
        >
          {visibleBooks.map((book, index) => (
            <BookCard
              key={book.id}
              book={book}
              index={index}
              selected={selectedBook?.id === book.id}
              onSelect={(value) => setSelectedBook((old) => (old?.id === value.id ? null : value))}
            />
          ))}
        </PickerSection>

        <PickerSection
          title="Choose a borrower"
          subtitle={
            selectedBorrower
              ? `Selected: ${selectedBorrower.full_name} · ${selectedBorrower.role}`
              : `Showing ${visibleBorrowers.length} of ${borrowers.length} users — search to narrow down`
          }
          search={borrowerSearch}
          onSearch={setBorrowerSearch}
          searchPlaceholder="Search name, admission no, email or role"
          visible={visibleBorrowers}
          matches={borrowers}
          emptyIcon={<PersonSearchRoundedIcon sx={{ fontSize: 46, color: "rgba(0,96,80,0.25)" }} />}
          emptyTitle="No borrowers match"
          emptyHint="Try the person's name, admission number, or email."
          moreLabel="users"
        >
          {visibleBorrowers.map((user, index) => (
            <BorrowerCard
              key={user.id}
              user={user}
              index={index}
              selected={selectedBorrower?.id === user.id}
              onSelect={(value) => setSelectedBorrower((old) => (old?.id === value.id ? null : value))}
            />
          ))}
        </PickerSection>

        <Box component={motion.div} variants={fadeUp} custom={1} initial="hidden" animate="visible">
          <FormSection title="Loan details">
            <Stack spacing={2}>
              {selectedBook && selectedBorrower ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ sm: "center" }}
                  sx={{
                    p: 1.5,
                    borderRadius: "14px",
                    bgcolor: "rgba(0,96,80,0.05)",
                    border: "1px dashed rgba(0,96,80,0.3)",
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary, fontSize: "0.9rem" }}>
                      {selectedBook.title}
                    </Typography>
                    <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.76rem", fontWeight: 600 }}>
                      to {selectedBorrower.full_name} ({selectedBorrower.role})
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Alert severity="info" icon={<SwapHorizRoundedIcon />} sx={{ borderRadius: "14px", fontFamily: fontBody }}>
                  Select one book and one borrower above to issue the loan.
                </Alert>
              )}

              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={inputSx}
                placeholder="Any condition notes or remarks for this issue"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="flex-end">
                <Button
                  onClick={goBack}
                  sx={{ textTransform: "none", fontWeight: 700, color: textSecondary }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  disabled={saving || !selectedBook || !selectedBorrower}
                  onClick={issueBook}
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SwapHorizRoundedIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    bgcolor: primaryGreen,
                    borderRadius: "12px",
                    px: 2.5,
                    "&:hover": { bgcolor: primaryDark },
                  }}
                >
                  {saving ? "Issuing…" : "Issue book"}
                </Button>
              </Stack>
            </Stack>
          </FormSection>
        </Box>
      </Stack>
    </Box>
  );
}
