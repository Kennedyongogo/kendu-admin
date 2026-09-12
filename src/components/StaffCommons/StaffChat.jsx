import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItemButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import BrandPageLoader from "../Util/BrandPageLoader";
import {
  authJsonHeaders,
  fontBody,
  fontDisplay,
  getInitials,
  getPortalToken,
  getPortalUser,
  navy,
  primaryGreen,
  profileImageSrc,
  textMuted,
  textPrimary,
  textSecondary,
} from "../Users/usersShared";

const POLL_MS = 4000;

function TypingDots() {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        ml: 0.35,
        verticalAlign: "middle",
        "@keyframes kdTypingBounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: 0.35 },
          "30%": { transform: "translateY(-3px)", opacity: 1 },
        },
        "& > span": {
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: "currentColor",
          display: "inline-block",
          animation: "kdTypingBounce 1.2s infinite ease-in-out",
        },
        "& > span:nth-of-type(2)": { animationDelay: "0.15s" },
        "& > span:nth-of-type(3)": { animationDelay: "0.3s" },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
}

function formatTypingLabel(users, isGroup) {
  if (!users?.length) return "";
  if (!isGroup) return "typing";
  if (users.length === 1) return `${users[0].full_name} is typing`;
  if (users.length === 2) {
    return `${users[0].full_name} and ${users[1].full_name} are typing`;
  }
  return `${users[0].full_name} and ${users.length - 1} others are typing`;
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatMessageTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function previewText(chat) {
  const msg = chat?.latest_message;
  if (!msg) return "No messages yet";
  if (msg.body) return msg.body;
  if (msg.attachments?.length) {
    return msg.attachments.length === 1 ? "📎 Attachment" : `📎 ${msg.attachments.length} attachments`;
  }
  return "No messages yet";
}

function isImage(mime) {
  return /^image\//i.test(mime || "");
}

function isVideo(mime) {
  return /^video\//i.test(mime || "");
}

function authHeaders(token, json = true) {
  const resolved = token || getPortalToken();
  const headers = { Accept: "application/json", Authorization: `Bearer ${resolved}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export default function StaffChat() {
  const me = getPortalUser();
  const token = getPortalToken();
  const myId = me?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chats, setChats] = useState([]);
  const [listSearch, setListSearch] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allStaff, setAllStaff] = useState(false);
  const [creating, setCreating] = useState(false);
  /** Contact selected for a new DM — not listed until first message is sent */
  const [pendingPeer, setPendingPeer] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const lastTypingSentRef = useRef(0);
  const typingStopTimerRef = useRef(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const socketRef = useRef(null);
  const myIdRef = useRef(myId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  const activeChat = useMemo(() => {
    if (pendingPeer) {
      return {
        id: null,
        type: "direct",
        name: pendingPeer.full_name,
        peer: pendingPeer,
        members: [pendingPeer],
        member_count: 2,
        latest_message: null,
        unread_count: 0,
      };
    }
    return chats.find((c) => c.id === activeChatId) || null;
  }, [chats, activeChatId, pendingPeer]);

  const filteredChats = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        previewText(c).toLowerCase().includes(q)
    );
  }, [chats, listSearch]);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/staff-chat/chats", { headers: authJsonHeaders(token) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load chats");
      setChats(data.chats || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadMessages = useCallback(
    async (chatId, { silent } = {}) => {
      if (!chatId) return;
      if (!silent) setMessagesLoading(true);
      try {
        const res = await fetch(`/api/staff-chat/chats/${chatId}/messages?limit=80`, {
          headers: authJsonHeaders(token),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to load messages");
        setMessages(data.messages || []);
        await fetch(`/api/staff-chat/chats/${chatId}/read`, {
          method: "POST",
          headers: authJsonHeaders(token),
        });
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, unread_count: 0 } : c))
        );
      } catch (err) {
        if (!silent) setError(err.message || "Failed to load messages");
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [token]
  );

  const loadContacts = useCallback(
    async (search = "") => {
      setContactsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        const res = await fetch(`/api/staff-chat/contacts?${params}`, {
          headers: authJsonHeaders(token),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to load contacts");
        setContacts(data.contacts || []);
      } catch (err) {
        setError(err.message || "Failed to load contacts");
      } finally {
        setContactsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  /** Realtime socket — messages + typing with no polling delay */
  useEffect(() => {
    if (!token) return undefined;

    const socket = io({
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 800,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      const chatId = activeChatIdRef.current;
      if (chatId) socket.emit("chat:join", { chat_id: chatId });
    });

    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("chat:message", ({ chat_id: chatId, message }) => {
      if (!message?.id) return;
      if (activeChatIdRef.current === chatId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setTypingUsers((prev) => prev.filter((u) => u.id !== message.author?.id));
        fetch(`/api/staff-chat/chats/${chatId}/read`, {
          method: "POST",
          headers: authJsonHeaders(token),
        }).catch(() => {});
      }
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chatId);
        if (idx === -1) {
          loadChats();
          return prev;
        }
        const next = [...prev];
        const isActive = activeChatIdRef.current === chatId;
        const isMine = message.author?.id === myIdRef.current;
        next[idx] = {
          ...next[idx],
          latest_message: message,
          updated_at: message.created_at,
          unread_count: isActive || isMine ? 0 : (next[idx].unread_count || 0) + 1,
        };
        next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return next;
      });
    });

    socket.on("chat:inbox", ({ chat_id: chatId, message }) => {
      if (!message?.id) return;
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chatId);
        if (idx === -1) {
          loadChats();
          return prev;
        }
        if (prev[idx].latest_message?.id === message.id) return prev;
        const next = [...prev];
        const isActive = activeChatIdRef.current === chatId;
        const isMine = message.author?.id === myIdRef.current;
        next[idx] = {
          ...next[idx],
          latest_message: message,
          updated_at: message.created_at,
          unread_count: isActive || isMine ? 0 : (next[idx].unread_count || 0) + 1,
        };
        next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return next;
      });
    });

    socket.on("chat:typing", ({ chat_id: chatId, typing }) => {
      if (activeChatIdRef.current !== chatId) return;
      const others = (typing || []).filter((u) => u.id !== myIdRef.current);
      setTypingUsers(others);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [token, loadChats]);

  /** Fallback poll only if socket is down */
  useEffect(() => {
    if (socketConnected) return undefined;
    const id = setInterval(() => {
      loadChats();
      if (activeChatIdRef.current) {
        loadMessages(activeChatIdRef.current, { silent: true });
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [socketConnected, loadChats, loadMessages]);

  useEffect(() => {
    if (!activeChatId) {
      setTypingUsers([]);
      return undefined;
    }
    loadMessages(activeChatId);
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("chat:join", { chat_id: activeChatId });
    }
    return () => {
      if (socket?.connected) {
        socket.emit("chat:leave", { chat_id: activeChatId });
        socket.emit("chat:typing_stop", { chat_id: activeChatId });
      }
    };
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId, typingUsers]);

  const signalTyping = useCallback(() => {
    if (!activeChatId) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 900) return;
    lastTypingSentRef.current = now;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("chat:typing", { chat_id: activeChatId });
    } else {
      fetch(`/api/staff-chat/chats/${activeChatId}/typing`, {
        method: "POST",
        headers: authJsonHeaders(token),
      }).catch(() => {});
    }

    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("chat:typing_stop", { chat_id: activeChatId });
    }, 2800);
  }, [activeChatId, token]);

  const openChat = (chatId) => {
    setPendingPeer(null);
    setTypingUsers([]);
    setActiveChatId(chatId);
    setMobileShowThread(true);
    setDraft("");
    setPendingFiles([]);
  };

  const startDirect = (contact) => {
    const existing = chats.find(
      (c) => c.type === "direct" && c.peer?.id === contact.id
    );
    setNewChatOpen(false);
    setDraft("");
    setPendingFiles([]);
    setMessages([]);
    setTypingUsers([]);
    setMobileShowThread(true);
    if (existing) {
      setPendingPeer(null);
      setActiveChatId(existing.id);
      return;
    }
    setActiveChatId(null);
    setPendingPeer(contact);
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError("Enter a group name");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/staff-chat/chats/group", {
        method: "POST",
        headers: authJsonHeaders(token),
        body: JSON.stringify({
          name: groupName.trim(),
          member_ids: allStaff ? [] : selectedMembers,
          all_staff: allStaff,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create group");
      setNewGroupOpen(false);
      setGroupName("");
      setSelectedMembers([]);
      setAllStaff(false);
      await loadChats();
      openChat(data.chat.id);
    } catch (err) {
      setError(err.message || "Could not create group");
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (sending) return;
    const text = draft.trim();
    if (!text && !pendingFiles.length) return;
    if (!activeChatId && !pendingPeer) return;

    setSending(true);
    try {
      let chatId = activeChatId;
      if (!chatId && pendingPeer) {
        const openRes = await fetch("/api/staff-chat/chats/direct", {
          method: "POST",
          headers: authJsonHeaders(token),
          body: JSON.stringify({ user_id: pendingPeer.id }),
        });
        const openData = await openRes.json().catch(() => ({}));
        if (!openRes.ok) throw new Error(openData.error || "Could not open chat");
        chatId = openData.chat.id;
        setActiveChatId(chatId);
        setPendingPeer(null);
      }

      const form = new FormData();
      if (text) form.append("body", text);
      pendingFiles.forEach((file) => form.append("files", file));

      const res = await fetch(`/api/staff-chat/chats/${chatId}/messages`, {
        method: "POST",
        headers: authHeaders(token, false),
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setDraft("");
      setPendingFiles([]);
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      socketRef.current?.emit("chat:typing_stop", { chat_id: chatId });
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      await loadChats();
    } catch (err) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) return <BrandPageLoader label="Opening chat…" />;

  const chatPanel = (
    <Box
      sx={{
        width: { xs: "100%", md: 360 },
        flexShrink: 0,
        display: { xs: mobileShowThread ? "none" : "flex", md: "flex" },
        flexDirection: "column",
        borderRight: { md: "1px solid rgba(15,23,42,0.08)" },
        bgcolor: "#fff",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid rgba(15,23,42,0.08)",
          background: `linear-gradient(135deg, ${primaryGreen} 0%, ${navy} 100%)`,
          color: "#fff",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.2rem" }}>
              Chat
            </Typography>
            <Typography sx={{ fontFamily: fontBody, fontSize: "0.72rem", opacity: 0.8 }}>
              Private and group messages
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              title="New chat"
              onClick={() => {
                setContactSearch("");
                setNewChatOpen(true);
                loadContacts();
              }}
            >
              <AddCommentRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              title="New group"
              onClick={() => {
                setContactSearch("");
                setGroupName("");
                setSelectedMembers([]);
                setAllStaff(false);
                setNewGroupOpen(true);
                loadContacts();
              }}
            >
              <GroupsRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
        <TextField
          size="small"
          fullWidth
          placeholder="Search chats"
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
          sx={{
            mt: 1.5,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              borderRadius: "10px",
              fontFamily: fontBody,
              fontSize: "0.86rem",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
              "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.4)" },
            },
            "& input::placeholder": { color: "rgba(255,255,255,0.7)", opacity: 1 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: "rgba(255,255,255,0.75)", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <ChatRoundedIcon sx={{ fontSize: 36, color: textMuted, mb: 1 }} />
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, fontSize: "0.9rem" }}>
              No chats yet. Start a private chat or create a group.
            </Typography>
          </Box>
        ) : (
          filteredChats.map((chat) => {
            const selected = chat.id === activeChatId;
            const avatarSrc =
              chat.type === "direct" ? profileImageSrc(chat.peer?.profile_image) : null;
            return (
              <ListItemButton
                key={chat.id}
                selected={selected}
                onClick={() => openChat(chat.id)}
                sx={{
                  px: 2,
                  py: 1.35,
                  gap: 1.25,
                  borderBottom: "1px solid rgba(15,23,42,0.05)",
                  "&.Mui-selected": { bgcolor: "rgba(27,94,168,0.08)" },
                }}
              >
                <Avatar
                  src={avatarSrc || undefined}
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: chat.type === "group" ? navy : primaryGreen,
                    fontFamily: fontBody,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {chat.type === "group" ? (
                    <GroupsRoundedIcon fontSize="small" />
                  ) : (
                    getInitials(chat.name)
                  )}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: fontBody,
                        fontWeight: chat.unread_count ? 800 : 600,
                        fontSize: "0.92rem",
                        color: textPrimary,
                      }}
                    >
                      {chat.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: fontBody,
                        fontSize: "0.68rem",
                        color: chat.unread_count ? primaryGreen : textMuted,
                        flexShrink: 0,
                      }}
                    >
                      {formatTime(chat.updated_at)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: fontBody,
                        fontSize: "0.78rem",
                        color: textSecondary,
                        fontWeight: chat.unread_count ? 600 : 400,
                      }}
                    >
                      {previewText(chat)}
                    </Typography>
                    {chat.unread_count > 0 && (
                      <Chip
                        size="small"
                        label={chat.unread_count > 99 ? "99+" : chat.unread_count}
                        sx={{
                          height: 20,
                          minWidth: 20,
                          bgcolor: primaryGreen,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </ListItemButton>
            );
          })
        )}
      </Box>
    </Box>
  );

  const threadPanel = (
    <Box
      sx={{
        flex: 1,
        display: { xs: mobileShowThread ? "flex" : "none", md: "flex" },
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        bgcolor: "#e8eef5",
        backgroundImage:
          "radial-gradient(rgba(27,94,168,0.06) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      {!activeChat ? (
        <Box
          sx={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            px: 3,
            textAlign: "center",
            bgcolor: "#f7f9fc",
          }}
        >
          <Box>
            <ChatRoundedIcon sx={{ fontSize: 56, color: primaryGreen, mb: 1.5, opacity: 0.85 }} />
            <Typography sx={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "1.4rem", color: textPrimary }}>
              Staff Chat
            </Typography>
            <Typography sx={{ fontFamily: fontBody, color: textSecondary, mt: 0.75, maxWidth: 320, mx: "auto" }}>
              Pick a chat or start a private conversation. Create a group when you need everyone in one thread.
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              px: 1.5,
              py: 1.15,
              bgcolor: "#fff",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <IconButton
              sx={{ display: { md: "none" } }}
              onClick={() => {
                setMobileShowThread(false);
                setPendingPeer(null);
                setActiveChatId(null);
                setMessages([]);
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <Avatar
              src={
                activeChat.type === "direct"
                  ? profileImageSrc(activeChat.peer?.profile_image) || undefined
                  : undefined
              }
              sx={{
                width: 40,
                height: 40,
                bgcolor: activeChat.type === "group" ? navy : primaryGreen,
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {activeChat.type === "group" ? (
                <GroupsRoundedIcon fontSize="small" />
              ) : (
                getInitials(activeChat.name)
              )}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontFamily: fontBody, fontWeight: 700, color: textPrimary }}>
                {activeChat.name}
              </Typography>
              <Typography noWrap sx={{ fontFamily: fontBody, fontSize: "0.72rem", color: textMuted }}>
                {activeChat.type === "group"
                  ? `${activeChat.member_count || activeChat.members?.length || 0} members`
                  : activeChat.peer?.position || activeChat.peer?.role || "Direct message"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 1.25, sm: 2.5 }, py: 2, minHeight: 0 }}>
            {messagesLoading ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                <CircularProgress size={28} sx={{ color: primaryGreen }} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: fontBody,
                  color: textMuted,
                  mt: 6,
                  fontSize: "0.9rem",
                }}
              >
                Say hello — send the first message.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {messages.map((msg) => {
                  const mine = msg.author?.id === myId;
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: "flex",
                        justifyContent: mine ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: { xs: "88%", sm: "70%" },
                          px: 1.35,
                          py: 0.85,
                          borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          bgcolor: mine ? "#d7e8fb" : "#fff",
                          boxShadow: "0 1px 1px rgba(15,23,42,0.06)",
                        }}
                      >
                        {!mine && activeChat.type === "group" && (
                          <Typography
                            sx={{
                              fontFamily: fontBody,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: primaryGreen,
                              mb: 0.25,
                            }}
                          >
                            {msg.author?.full_name || "Staff"}
                          </Typography>
                        )}
                        {msg.attachments?.length > 0 && (
                          <Stack spacing={0.75} sx={{ mb: msg.body ? 0.75 : 0 }}>
                            {msg.attachments.map((att) =>
                              isImage(att.mime_type) ? (
                                <Box
                                  key={att.id}
                                  component="a"
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  sx={{ display: "block", borderRadius: "10px", overflow: "hidden" }}
                                >
                                  <Box
                                    component="img"
                                    src={att.url}
                                    alt={att.original_name}
                                    sx={{
                                      display: "block",
                                      maxWidth: "100%",
                                      maxHeight: 260,
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                              ) : isVideo(att.mime_type) ? (
                                <Box
                                  key={att.id}
                                  component="video"
                                  src={att.url}
                                  controls
                                  sx={{
                                    width: "100%",
                                    maxHeight: 260,
                                    borderRadius: "10px",
                                    bgcolor: "#000",
                                  }}
                                />
                              ) : (
                                <Button
                                  key={att.id}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  startIcon={<InsertDriveFileRoundedIcon />}
                                  sx={{
                                    justifyContent: "flex-start",
                                    textTransform: "none",
                                    fontFamily: fontBody,
                                    color: textPrimary,
                                    bgcolor: "rgba(15,23,42,0.04)",
                                    borderRadius: "10px",
                                    px: 1.25,
                                  }}
                                >
                                  <Typography noWrap sx={{ fontSize: "0.82rem", maxWidth: 180 }}>
                                    {att.original_name}
                                  </Typography>
                                </Button>
                              )
                            )}
                          </Stack>
                        )}
                        {msg.body ? (
                          <Typography
                            sx={{
                              fontFamily: fontBody,
                              fontSize: "0.9rem",
                              color: textPrimary,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.body}
                          </Typography>
                        ) : null}
                        <Typography
                          sx={{
                            fontFamily: fontBody,
                            fontSize: "0.62rem",
                            color: textMuted,
                            textAlign: "right",
                            mt: 0.35,
                          }}
                        >
                          {formatMessageTime(msg.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Stack>
            )}
          </Box>

          {typingUsers.length > 0 && (
            <Box
              sx={{
                px: 2.5,
                py: 0.6,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: "transparent",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.25,
                  py: 0.55,
                  borderRadius: "14px 14px 14px 4px",
                  bgcolor: "#fff",
                  boxShadow: "0 1px 1px rgba(15,23,42,0.06)",
                  color: textSecondary,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: fontBody,
                    fontSize: "0.78rem",
                    fontStyle: "italic",
                    color: textSecondary,
                  }}
                >
                  {formatTypingLabel(typingUsers, activeChat?.type === "group")}
                </Typography>
                <TypingDots />
              </Box>
            </Box>
          )}

          {pendingFiles.length > 0 && (
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: "#fff",
                borderTop: "1px solid rgba(15,23,42,0.06)",
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {pendingFiles.map((file, idx) => (
                <Chip
                  key={`${file.name}-${idx}`}
                  label={file.name}
                  onDelete={() =>
                    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                  deleteIcon={<CloseRoundedIcon />}
                  sx={{ fontFamily: fontBody, maxWidth: 220 }}
                />
              ))}
            </Box>
          )}

          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              bgcolor: "#fff",
              borderTop: "1px solid rgba(15,23,42,0.08)",
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) setPendingFiles((prev) => [...prev, ...files].slice(0, 8));
                e.target.value = "";
              }}
            />
            <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: textSecondary }}>
              <AttachFileRoundedIcon />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (e.target.value.trim()) signalTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                } else if (e.key !== "Enter") {
                  signalTyping();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "22px",
                  bgcolor: "#f3f5f8",
                  fontFamily: fontBody,
                  fontSize: "0.92rem",
                  "& fieldset": { borderColor: "transparent" },
                },
              }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={sending || (!draft.trim() && !pendingFiles.length)}
              sx={{
                bgcolor: primaryGreen,
                color: "#fff",
                width: 44,
                height: 44,
                "&:hover": { bgcolor: navy },
                "&.Mui-disabled": { bgcolor: "rgba(27,94,168,0.35)", color: "#fff" },
              }}
            >
              {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        height: { xs: "calc(100vh - 64px)", md: "calc(100vh - 72px)" },
        display: "flex",
        flexDirection: "column",
        m: { xs: -2, sm: -3 },
        width: { xs: "calc(100% + 32px)", sm: "calc(100% + 48px)" },
      }}
    >
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ flex: 1, display: "flex", minHeight: 0, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
        {chatPanel}
        {threadPanel}
      </Box>

      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: fontDisplay, fontWeight: 700 }}>New chat</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search staff"
            value={contactSearch}
            onChange={(e) => {
              setContactSearch(e.target.value);
              loadContacts(e.target.value);
            }}
            sx={{ mb: 1.5, mt: 0.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {contactsLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack sx={{ maxHeight: 360, overflowY: "auto" }}>
              {contacts.map((c) => (
                <ListItemButton
                  key={c.id}
                  disabled={creating}
                  onClick={() => startDirect(c)}
                  sx={{ gap: 1.25, borderRadius: "10px" }}
                >
                  <Avatar
                    src={profileImageSrc(c.profile_image) || undefined}
                    sx={{ bgcolor: primaryGreen, width: 40, height: 40, fontSize: "0.85rem" }}
                  >
                    {getInitials(c.full_name)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontFamily: fontBody, fontWeight: 600 }}>{c.full_name}</Typography>
                    <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                      {c.position || c.role}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
              {!contacts.length && (
                <Typography sx={{ p: 2, color: textMuted, fontFamily: fontBody, textAlign: "center" }}>
                  No staff found
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newGroupOpen} onClose={() => setNewGroupOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: fontDisplay, fontWeight: 700 }}>New group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 1.5, mt: 0.5 }}
          />
          <ListItemButton
            onClick={() => setAllStaff((v) => !v)}
            sx={{ borderRadius: "10px", mb: 1, border: "1px solid rgba(15,23,42,0.08)" }}
          >
            <Checkbox checked={allStaff} />
            <Box>
              <Typography sx={{ fontFamily: fontBody, fontWeight: 700 }}>All staff</Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: "0.75rem", color: textMuted }}>
                Everyone (admin + staff) joins this group
              </Typography>
            </Box>
          </ListItemButton>
          {!allStaff && (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Search staff to add"
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  loadContacts(e.target.value);
                }}
                sx={{ mb: 1 }}
              />
              {contactsLoading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack sx={{ maxHeight: 280, overflowY: "auto" }}>
                  {contacts.map((c) => (
                    <ListItemButton
                      key={c.id}
                      onClick={() => toggleMember(c.id)}
                      sx={{ gap: 1, borderRadius: "10px" }}
                    >
                      <Checkbox checked={selectedMembers.includes(c.id)} />
                      <Avatar
                        src={profileImageSrc(c.profile_image) || undefined}
                        sx={{ bgcolor: navy, width: 36, height: 36, fontSize: "0.8rem" }}
                      >
                        {getInitials(c.full_name)}
                      </Avatar>
                      <Typography sx={{ fontFamily: fontBody }}>{c.full_name}</Typography>
                    </ListItemButton>
                  ))}
                </Stack>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewGroupOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={creating || !groupName.trim() || (!allStaff && !selectedMembers.length)}
            onClick={createGroup}
            sx={{ textTransform: "none", bgcolor: primaryGreen, "&:hover": { bgcolor: navy } }}
          >
            {creating ? "Creating…" : "Create group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
