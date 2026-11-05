import EmailSettings from "./EmailSettings.jsx";
import { Interests, CommunityProfile } from "./Community.jsx";
import { TOPICS } from "./topics.js";
import React, { useEffect, useState, useRef, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  House,
  Compass,
  Clapperboard,
  MonitorPlay,
  LockKeyhole,
  Send,
  Plus,
  User,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Search,
  ArrowUpRight,
  ArrowLeft,
  LogOut,
  Settings,
  ShieldCheck,
  X,
  Check,
  Loader2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Flag,
  Users,
  Leaf,
} from "lucide-react";
import { api, mediaUrl } from "./api";
import "./app.css";
const Demo = lazy(() => import("./demo/Demo.jsx"));
const when = (t) =>
  new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
function Avatar({ name = "you", size = "" }) {
  return (
    <span className={`avatar ${size}`} aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState(() => location.pathname.split("/")[2] || "home"),
    [dialog, setDialog] = useState(null),
    [toast, setToast] = useState(""),
    [reload, bump] = useState(0),
    [time, setTime] = useState(Date.now());
  const notify = (message) => setToast(message);
  const refresh = () => bump((n) => n + 1);
  const me = async () => {
    try {
      const d = await api("/me");
      setUser(d.user);
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    me();
    const pop = () => setTab(location.pathname.split("/")[2] || "home");
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!user?.lock_until) return;
    const t = setInterval(() => {
      setTime(Date.now());
      if (user.lock_until < Date.now()) me();
    }, 1000);
    return () => clearInterval(t);
  }, [user?.lock_until]);
  const nav = (value) => {
    setTab(value.split("?")[0]);
    history.pushState({}, "", `/social/${value === "home" ? "" : value}`);
    window.scrollTo(0, 0);
  };
  const execute = async (fn) => {
    try {
      return await fn();
    } catch (e) {
      notify(e.message);
      if (e.status === 423) me();
      if (e.status === 401) setUser(null);
      return null;
    }
  };
  if (loading)
    return (
      <div className="loading">
        <Loader2 className="spin" />
        <span>Opening your space…</span>
      </div>
    );
  if (!user)
    return <Auth tab={tab} setUser={setUser} nav={nav} notify={notify} />;
  if (user.lock_until > time)
    return (
      <div className="focus-shield">
        <LockKeyhole size={36} />
        <span className="eyebrow">YOUR TIME IS YOURS</span>
        <h1>
          {new Date(Math.ceil((user.lock_until - time) / 1000) * 1000)
            .toISOString()
            .slice(11, 19)}
        </h1>
        <p>Your focus session is active.</p>
        <small>Access restores automatically when the timer ends.</small>
      </div>
    );
  const navigation = [
    [House, "home", "Home"],
    [Compass, "discover", "Discover"],
    [Clapperboard, "reels", "Reels"],
    [MonitorPlay, "videos", "Videos"],
    [LockKeyhole, "focus", "Deep focus"],
    [Send, "messages", "Messages"],
    [Plus, "create", "Create"],
    [User, "profile", "Profile"],
  ];
  return (
    <>
      <aside className="rail">
        <a
          href="/social/"
          className="wordmark"
          onClick={(e) => {
            e.preventDefault();
            nav("home");
          }}
        >
          social<span>●</span>
        </a>
        <span className="rail-caption">A PLACE FOR YOUR PEOPLE</span>
        <nav>
          {navigation.map(([Icon, value, label]) => (
            <button
              key={value}
              className={`${tab === value ? "active" : ""} ${value === "focus" ? "focus-nav" : ""}`}
              onClick={() =>
                ["focus", "create"].includes(value)
                  ? setDialog(value)
                  : nav(value)
              }
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
          {user.role === "admin" && (
            <button
              className={tab === "admin" ? "active" : ""}
              onClick={() => nav("admin")}
            >
              <ShieldCheck size={21} />
              Admin
            </button>
          )}
        </nav>
        <div className="rail-foot">
          <button onClick={() => nav("settings")}>
            <Settings size={18} />
            Settings & privacy
          </button>
          <button className="signed-in" onClick={() => nav("profile")}>
            <Avatar name={user.username} />
            <span>
              <b>{user.display_name}</b>
              <small>@{user.username}</small>
            </span>
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <a className="mobile-brand" href="/social/">
            social<span>●</span>
          </a>
          <span className="top-note">Good to see you here.</span>
          <div>
            <a href="/socialdemo" className="demo-link">
              Try the demo <ArrowUpRight size={13} />
            </a>
            <button aria-label="Search people" onClick={() => nav("people")}>
              <Search size={21} />
            </button>
            <button aria-label="Messages" onClick={() => nav("messages")}>
              <Send size={21} />
            </button>
            <button
              aria-label="Account settings"
              onClick={() => nav("settings")}
            >
              <Avatar name={user.username} size="small" />
            </button>
          </div>
        </header>
        <div
          className={`content-layout ${["messages", "admin", "settings"].includes(tab) ? "wide-layout" : ""} ${tab === "messages" ? "messages-layout" : ""}`}
        >
          <main className="main-content">
            {[
              "home",
              "discover",
              "reels",
              "videos",
              "profile",
              "saved",
            ].includes(tab) && (
              <Feed
                key={tab}
                setUser={setUser}
                {...{
                  tab,
                  user,
                  setUser,
                  execute,
                  notify,
                  refresh,
                  reload,
                  setDialog,
                  nav,
                }}
              />
            )}
            {tab === "people" && <People {...{ execute, notify }} />}
            {tab === "messages" && <Messages {...{ user, execute, notify }} />}
            {tab === "settings" && (
              <SettingsPage {...{ user, setUser, execute, notify, nav }} />
            )}
            {tab === "admin" && <Admin {...{ user, execute, notify }} />}
            {![
              "home",
              "discover",
              "reels",
              "videos",
              "profile",
              "saved",
              "people",
              "messages",
              "settings",
              "admin",
            ].includes(tab) && (
              <Empty
                icon={House}
                title="Let's get you home."
                action={() => nav("home")}
                label="Go to feed"
              />
            )}
          </main>
          <aside className="context-panel">
            <div className="manifesto">
              <span className="eyebrow">MADE FOR HUMAN CONNECTION</span>
              <h2>
                Your world.
                <br />
                In good company.
              </h2>
              <p>
                Photos, films, conversations.
                <br />A little more of what you love.
              </p>
              <div className="assurances">
                <span>
                  <Check size={12} /> No feed ads
                </span>
                <span>
                  <Check size={12} /> Your choice
                </span>
              </div>
            </div>
            <div className="discovery-card">
              <Leaf size={23} />
              <h3>Find your people.</h3>
              <p>
                The best feeds start with people you actually want to hear from.
              </p>
              <button onClick={() => nav("people")}>
                Explore people <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="context-links">
              <button onClick={() => nav("saved")}>
                <Bookmark size={15} /> Saved moments
              </button>
              <button onClick={() => setDialog("focus")}>
                <LockKeyhole size={15} /> Make time for yourself
              </button>
              <button onClick={() => setDialog("create")}>
                <Plus size={15} /> Share something real
              </button>
            </div>
            <p className="footnote">
              Early access · name & identity in progress
              <br />
              <a href="/social/privacy">Privacy</a> ·{" "}
              <a href="/social/terms">Community rules</a> · Beacon of Unity
            </p>
          </aside>
        </div>
      </div>
      <nav className="mobile-dock">
        {navigation
          .filter(([, v]) =>
            [
              "home",
              "discover",
              "reels",
              "focus",
              "messages",
              "create",
              "profile",
            ].includes(v),
          )
          .map(([Icon, value, label]) => (
            <button
              key={value}
              aria-label={label}
              className={`${tab === value ? "active" : ""} ${value === "focus" ? "focus-button" : ""}`}
              onClick={() =>
                ["focus", "create"].includes(value)
                  ? setDialog(value)
                  : nav(value)
              }
            >
              <Icon size={21} />
            </button>
          ))}
      </nav>
      {dialog && (
        <Modal close={() => setDialog(null)}>
          {dialog === "create" ? (
            <CreatePost
              {...{ execute, notify }}
              done={() => {
                setDialog(null);
                refresh();
                nav("profile");
              }}
            />
          ) : dialog === "focus" ? (
            <Focus
              activate={(seconds) =>
                execute(async () => {
                  const d = await api("/focus", {
                    method: "POST",
                    body: { seconds },
                  });
                  setUser({ ...user, lock_until: d.lock_until });
                  setTime(Date.now());
                  setDialog(null);
                })
              }
            />
          ) : dialog.comments ? (
            <Comments post={dialog.comments} {...{ execute }} />
          ) : dialog.share ? (
            <Share
              post={dialog.share}
              {...{ execute, notify }}
              close={() => setDialog(null)}
            />
          ) : dialog.report ? (
            <Report
              post={dialog.report}
              {...{ execute, notify }}
              done={() => {
                setDialog(null);
                refresh();
              }}
            />
          ) : null}
        </Modal>
      )}
      {toast && (
        <div className="app-toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
function Auth({ tab, setUser, nav, notify }) {
  const [mode, change] = useState(
      ["register", "forgot", "reset", "verify"].includes(tab) ? tab : "login",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.target));
    d.terms = d.terms === "on";
    if (["reset", "verify"].includes(mode))
      d.token = new URLSearchParams(location.hash.slice(1)).get("token");
    try {
      const result = await api(`/auth/${mode}`, { method: "POST", body: d });
      if (result.user) {
        setUser(result.user);
        nav("home");
      } else setMessage(result.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-image">
        <a href="/" className="beacon-return">
          <ArrowLeft size={15} /> Beacon of Unity
        </a>
        <div>
          <span className="eyebrow">LIFE LOOKS BETTER TOGETHER</span>
          <h1>
            For the moments.
            <br />
            And the people
            <br />
            behind them.
          </h1>
          <p>A space for everything you're into.</p>
        </div>
        <small>Real people. Room to be yourself.</small>
      </div>
      <section className="auth-panel">
        <a className="wordmark" href="/social/">
          social<span>●</span>
        </a>
        <div className="auth-form">
          <span className="eyebrow">YOUR PEOPLE ARE OUT THERE</span>
          <h2>
            {mode === "register"
              ? "Make yourself at home."
              : mode === "forgot"
                ? "Find your way back."
                : mode === "reset"
                  ? "A fresh start."
                  : mode === "verify"
                    ? "Confirm your email."
                    : "Welcome to your space."}
          </h2>
          <p className="muted">
            {mode === "register"
              ? "Create your account. Make it yours."
              : "Photos, videos, conversations. All yours to explore."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <>
                <Field
                  label="Your name"
                  name="display_name"
                  maxLength={60}
                  autoComplete="name"
                  required
                />
                <UsernameField />
              </>
            )}
            {!["reset", "verify"].includes(mode) && (
              <Field
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            )}
            {!["forgot", "verify"].includes(mode) && (
              <Field
                label="Password"
                type="password"
                name="password"
                minLength={12}
                maxLength={128}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                hint="At least 12 characters"
              />
            )}
            {mode === "register" && (
              <label className="check-field">
                <input type="checkbox" name="terms" required />I am 13 or older
                and accept the{" "}
                <a href="/social/terms" target="_blank">
                  community rules
                </a>{" "}
                and{" "}
                <a href="/social/privacy" target="_blank">
                  privacy notice
                </a>
                .
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="form-success" role="status">
                {message}
              </p>
            )}
            <button className="primary wide" disabled={busy}>
              {busy ? (
                <Loader2 className="spin" size={16} />
              ) : mode === "register" ? (
                "Create account"
              ) : mode === "forgot" ? (
                "Send recovery link"
              ) : mode === "reset" ? (
                "Save new password"
              ) : mode === "verify" ? (
                "Verify email"
              ) : (
                "Sign in"
              )}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <div className="auth-switch">
            <button
              onClick={() => {
                change(mode === "login" ? "register" : "login");
                setError("");
                setMessage("");
              }}
            >
              {mode === "login"
                ? "New here? Create an account"
                : "Already a member? Sign in"}
            </button>
            {mode === "login" && (
              <button
                onClick={() => {
                  change("forgot");
                  setError("");
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
          <a className="guest-link" href="/socialdemo">
            Just looking? Explore the guest demo <ArrowUpRight size={15} />
          </a>
        </div>
        <p className="footnote">
          Early access · Brand name coming soon.
          <br />A separate social project hosted by Beacon of Unity.
        </p>
      </section>
    </div>
  );
}
function UsernameField() {
  const [value, setValue] = useState("");
  const [availability, setAvailability] = useState("idle");
  const rules = [
    ["Lowercase only", !/[A-Z]/.test(value)],
    ["Start with a letter", /^[a-z]/.test(value)],
    ["3–24 characters", value.length >= 3 && value.length <= 24],
    ["Letters, numbers, dots or underscores", /^[a-z0-9._]+$/.test(value)],
  ];
  const valid = value.length > 0 && rules.every(([, ok]) => ok);
  useEffect(() => {
    if (!valid) {
      setAvailability("idle");
      return;
    }
    let cancelled = false;
    setAvailability("checking");
    const timer = setTimeout(() => {
      api("/auth/username?username=" + encodeURIComponent(value))
        .then((data) => {
          if (!cancelled)
            setAvailability(data.available ? "available" : "taken");
        })
        .catch(() => {
          if (!cancelled) setAvailability("unknown");
        });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, valid]);
  return (
    <div className="username-control">
      <label className="field">
        <span>Username</span>
        <div className="username-input-wrap">
          <input
            aria-label="Username"
            aria-describedby="username-rules username-status"
            name="username"
            value={value}
            minLength={3}
            maxLength={24}
            pattern="[a-z][a-z0-9._]{2,23}"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            onChange={(event) => {
              event.target.setCustomValidity("");
              setValue(event.target.value);
            }}
            onInvalid={(event) =>
              event.target.setCustomValidity(
                availability === "taken"
                  ? "That username is already taken. Try adding a dot, underscore or number."
                  : "Use 3–24 lowercase characters, starting with a letter. Example: anshuman_23.",
              )
            }
            onBlur={(event) => {
              if (availability === "taken")
                event.target.setCustomValidity(
                  "That username is already taken. Try another.",
                );
            }}
          />
          <span className={"username-icon " + availability} aria-hidden="true">
            {availability === "checking" ? (
              <Loader2 className="spin" size={17} />
            ) : availability === "available" ? (
              <Check size={19} />
            ) : (value && !valid) || availability === "taken" ? (
              <X size={17} />
            ) : null}
          </span>
        </div>
      </label>
      <div id="username-rules" className="username-rules">
        {rules.map(([label, ok]) => (
          <span
            key={label}
            className={!value ? "neutral" : ok ? "passes" : "fails"}
          >
            {value && ok ? (
              <Check size={12} />
            ) : value ? (
              <X size={12} />
            ) : (
              <i />
            )}
            {label}
          </span>
        ))}
      </div>
      <p
        id="username-status"
        className={"username-status " + availability}
        role="status"
        aria-live="polite"
      >
        {availability === "checking"
          ? "Checking availability…"
          : availability === "available"
            ? `@${value} is available`
            : availability === "taken"
              ? "Already taken — try adding a dot, underscore or number."
              : availability === "unknown"
                ? "We’ll check availability when you create your account."
                : value && !valid
                  ? "Follow the rules above to finish your username."
                  : "Choose a username. Example: anshuman_23"}
      </p>
    </div>
  );
}
function Field({ label, hint, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input aria-label={label} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Empty({ icon: Icon = Leaf, title, children, action, label }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={30} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && (
        <button className="primary" onClick={action}>
          {label}
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}
function Modal({ children, close }) {
  const ref = useRef(),
    previous = useRef(document.activeElement);
  useEffect(() => {
    const el = ref.current;
    el.focus();
    const key = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = el.querySelectorAll(
          "button,input,select,textarea,a[href]",
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous.current?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="app-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Social dialog"
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal" aria-label="Close" onClick={close}>
          <X />
        </button>
        {children}
      </section>
    </div>
  );
}
function Feed({
  tab,
  user,
  setUser,
  execute,
  notify,
  refresh,
  reload,
  setDialog,
  nav,
}) {
  const [posts, setPosts] = useState([]),
    [pending, setPending] = useState(true),
    [view, setView] = useState(tab === "discover" ? "discover" : "feed"),
    [cursor, setCursor] = useState(null),
    [stories, setStories] = useState([]),
    [story, setStory] = useState(-1),
    [profileKind, setProfileKind] = useState("photo");
  const kind = ["profile", "saved"].includes(tab)
    ? profileKind
    : tab === "reels"
      ? "reel"
      : tab === "videos"
        ? "video"
        : "photo";
  async function load(before) {
    setPending(true);
    const v =
      tab === "profile"
        ? "mine"
        : tab === "saved"
          ? "saved"
          : tab === "discover"
            ? "discover"
            : view;
    const d = await execute(() =>
      api(`/posts?view=${v}&kind=${kind}${before ? "&before=" + before : ""}`),
    );
    if (d) {
      setPosts((p) => (before ? [...p, ...d.posts] : d.posts));
      setCursor(d.next);
    }
    setPending(false);
  }
  useEffect(() => {
    load();

    if (tab === "home")
      execute(async () =>
        setStories((await api("/posts?kind=story&view=discover")).posts),
      );
  }, [reload, view, profileKind, user.interests?.join(",")]);
  useEffect(() => {
    if (story < 0) return;
    const timer = setTimeout(
      () => setStory((s) => (s + 1 >= stories.length ? -1 : s + 1)),
      5000,
    );
    return () => clearTimeout(timer);
  }, [story]);
  const titles = {
    home: ["YOUR WORLD, IN GOOD COMPANY", "A little more life."],
    discover: ["FOLLOW YOUR CURIOSITY", "Find your next favorite."],
    reels: ["LIFE, IN MOTION", "A moment worth watching."],
    videos: ["STORIES WITH ROOM TO BREATHE", "Stay for the whole story."],
    profile: ["YOUR LITTLE CORNER", user.display_name + "."],
    saved: ["KEEP THE GOOD ONES", "Saved for another day."],
  };
  const [eyebrow, title] = titles[tab];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
        </div>
        {tab === "home" && (
          <span className="following-pill">
            <i />
            Chronological
          </span>
        )}
      </div>
      {tab === "profile" && (
        <div className="profile-summary">
          <Avatar name={user.username} size="large" />
          <div>
            <b>@{user.username}</b>
            <p>{user.bio || "A little space to make your own."}</p>
            <button onClick={() => nav("settings")}>
              Edit profile <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      )}
      {tab === "home" && (
        <div className="real-stories">
          <button onClick={() => setDialog("create")}>
            <span className="new-story">
              <Plus size={24} />
            </span>
            <small>Your story</small>
          </button>
          {stories.map((p, i) => (
            <button key={p.id} onClick={() => setStory(i)}>
              <span className="story-circle">
                <Avatar name={p.username} />
              </span>
              <small>{p.username}</small>
            </button>
          ))}
          {!stories.length && (
            <p>Little glimpses from your people will appear here.</p>
          )}
        </div>
      )}
      {["profile", "saved"].includes(tab) && (
        <div className="feed-tabs">
          {["photo", "reel", "video", "story"].map((k) => (
            <button
              key={k}
              className={profileKind === k ? "selected" : ""}
              onClick={() => setProfileKind(k)}
            >
              {k === "photo"
                ? "Photos"
                : k === "reel"
                  ? "Reels"
                  : k === "video"
                    ? "Videos"
                    : "Stories"}
            </button>
          ))}
        </div>
      )}
      {["home", "reels", "videos"].includes(tab) && (
        <div className="feed-tabs">
          {[
            ["feed", "Following"],
            ["discover", "Everyone"],
          ].map(([v, l]) => (
            <button
              key={v}
              className={v === view ? "selected" : ""}
              onClick={() => setView(v)}
            >
              {l}
            </button>
          ))}
          <button onClick={() => load()} className="refresh-feed">
            Refresh
          </button>
        </div>
      )}
      {tab === "discover" && (
        <>
          <div className="discover-callout">
            <Search />
            <div>
              <h3>Start with a hello.</h3>
              <p>Find people and creators who share your interests.</p>
            </div>
            <button onClick={() => nav("people")}>
              <ArrowUpRight />
            </button>
          </div>
          <Interests user={user} execute={execute} onUpdate={setUser} />
          <p className="discovery-policy">
            People first. Organization posts appear here only if you follow the
            page. No products or sponsored placements.
          </p>
          <p className="section-label">MOMENTS FROM THE COMMUNITY</p>
        </>
      )}
      {pending && !posts.length ? (
        <div className="feed-loading">
          <Loader2 className="spin" />
          Loading your moments…
        </div>
      ) : !posts.length ? (
        <Empty
          icon={
            tab === "reels"
              ? Clapperboard
              : tab === "videos"
                ? MonitorPlay
                : tab === "profile"
                  ? Plus
                  : Users
          }
          title={
            tab === "profile"
              ? "Your first moment starts here."
              : tab === "saved"
                ? "Keep something you love."
                : "A new place. A fresh start."
          }
          action={() =>
            tab === "profile" ? setDialog("create") : nav("people")
          }
          label={tab === "profile" ? "Share a moment" : "Find your people"}
        >
          {tab === "profile"
            ? "Your posts appear here while the moderation team reviews them."
            : "Follow someone, share a moment, and help bring this space to life."}
        </Empty>
      ) : (
        <div className={tab === "reels" ? "live-reels" : ""}>
          {posts.map((p) => (
            <Post
              key={p.id}
              post={p}
              {...{ execute, notify, setDialog, user, refresh, nav }}
              vertical={tab === "reels"}
            />
          ))}
          {cursor ? (
            <button
              className="load-more"
              disabled={pending}
              onClick={() => load(cursor)}
            >
              Load earlier moments
            </button>
          ) : (
            <div className="caught-up">
              <Check size={20} />
              <p>That's everything for now.</p>
            </div>
          )}
        </div>
      )}
      {story >= 0 && stories[story] && (
        <div className="live-story">
          <button
            className="story-close"
            aria-label="Close story"
            onClick={() => setStory(-1)}
          >
            <X />
          </button>
          <div className="story-timer" key={story} />
          <div className="story-who">
            <Avatar name={stories[story].username} />
            {stories[story].username}
          </div>
          {stories[story].mime.startsWith("video/") ? (
            <video
              src={mediaUrl(stories[story].media_id)}
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              src={mediaUrl(stories[story].media_id)}
              alt={stories[story].caption}
            />
          )}
          <button
            className="previous-story"
            aria-label="Previous story"
            onClick={() => setStory(Math.max(0, story - 1))}
          />
          <button
            className="next-story"
            aria-label="Next story"
            onClick={() =>
              setStory(story + 1 >= stories.length ? -1 : story + 1)
            }
          />
          <p>{stories[story].caption}</p>
        </div>
      )}
    </>
  );
}
function Post({
  post: p,
  execute,
  notify,
  setDialog,
  user,
  refresh,
  vertical,
  nav,
}) {
  const [liked, setLiked] = useState(!!p.liked),
    [saved, setSaved] = useState(!!p.saved),
    [likes, setLikes] = useState(p.likes),
    [menu, setMenu] = useState(false),
    [hidden, setHidden] = useState(false),
    [busy, setBusy] = useState(false),
    [pop, setPop] = useState(false);
  const like = async (force) => {
    if (busy || (force && liked)) return;
    setBusy(true);
    const d = await execute(() =>
      api(`/posts/${p.id}/like`, { method: "POST" }),
    );
    if (d) {
      setLikes((n) => n + (d.active ? 1 : -1));
      setLiked(d.active);
    }
    setBusy(false);
  };
  return (
    <article
      className={`live-post ${hidden ? "hiding" : ""} ${vertical ? "vertical-post" : ""}`}
    >
      <div className="post-top">
        <Avatar name={p.username} />
        <div>
          <button
            className="profile-name-button"
            onClick={() => nav("people?profile=" + p.username)}
          >
            {p.username}
            {p.account_type === "organization" && (
              <span className="organization-label">Organization</span>
            )}
          </button>
          <small>
            {p.status === "pending"
              ? "Awaiting moderation"
              : when(p.created_at)}
          </small>
        </div>
        {p.status === "pending" && (
          <span className="pending-badge">Only you can see this</span>
        )}
        <div className="post-menu">
          <button aria-label="Post options" onClick={() => setMenu(!menu)}>
            <MoreHorizontal />
          </button>
          {menu && (
            <div>
              <button
                onClick={() => {
                  setDialog({ report: p });
                  setMenu(false);
                }}
              >
                <Flag size={14} />
                Report content
              </button>
              {p.user_id === user.id && (
                <button
                  onClick={() =>
                    execute(async () => {
                      await api(`/posts/${p.id}`, { method: "DELETE" });
                      setHidden(true);
                      notify("Post removed.");
                      refresh();
                    })
                  }
                >
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className="media-frame"
        onDoubleClick={() => {
          like(true);
          setPop(true);
          setTimeout(() => setPop(false), 700);
        }}
      >
        {p.mime.startsWith("video/") ? (
          <Video src={mediaUrl(p.media_id)} vertical={vertical} />
        ) : (
          <img
            loading="lazy"
            src={mediaUrl(p.media_id)}
            alt={p.caption || "Photo shared by " + p.username}
          />
        )}{" "}
        {pop && <Heart className="heart-burst" size={85} fill="white" />}
      </div>
      <div className="post-actions">
        <button
          aria-label={liked ? "Unlike" : "Like"}
          className={liked ? "liked" : ""}
          disabled={busy}
          onClick={() => like(false)}
        >
          <Heart fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          aria-label="Comments"
          onClick={() => setDialog({ comments: p })}
        >
          <MessageCircle />
        </button>
        <button
          aria-label="Share to messages"
          onClick={() => setDialog({ share: p })}
        >
          <Send />
        </button>
        <button
          className="save-action"
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() =>
            execute(async () => {
              const d = await api(`/posts/${p.id}/save`, { method: "POST" });
              setSaved(d.active);
            })
          }
        >
          <Bookmark fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="like-count">
        {likes} {likes === 1 ? "like" : "likes"}
      </p>
      <p className="live-caption">
        <b>{p.username}</b> {p.caption}
      </p>
      <button
        className="comment-count"
        onClick={() => setDialog({ comments: p })}
      >
        View comments ({p.comments})
      </button>
    </article>
  );
}
function Video({ src, vertical }) {
  const ref = useRef(),
    [muted, mute] = useState(true),
    [error, setError] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && vertical) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.7 },
    );
    o.observe(v);
    const visibility = () => {
      if (document.hidden) v.pause();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      o.disconnect();
      v.pause();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [src]);
  return (
    <>
      {error ? (
        <p className="video-error">This video couldn't load. Try refreshing.</p>
      ) : (
        <video
          ref={ref}
          src={src}
          controls
          playsInline
          muted={muted}
          loop={vertical}
          preload="metadata"
          onError={() => setError(true)}
        />
      )}
      <button
        className="mute-video"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => mute(!muted)}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </>
  );
}
function CreatePost({ execute, notify, done }) {
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [kind, setKind] = useState("photo"),
    [busy, setBusy] = useState(false),
    [phase, setPhase] = useState("");
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.target);
    await execute(async () => {
      setPhase("Uploading your media…");
      const media = await api("/uploads", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setPhase("Sending to the moderation queue…");
      await api("/posts", {
        method: "POST",
        body: {
          media_id: media.id,
          caption: form.get("caption"),
          kind,
          human_declared: form.get("human") === "on",
          topics: form.getAll("topics"),
        },
      });
      notify("Uploaded. Your post is private until approved by a moderator.");
      done();
    });
    setBusy(false);
    setPhase("");
  };
  return (
    <>
      <span className="eyebrow">A GLIMPSE OF YOUR WORLD</span>
      <h2>Share something real.</h2>
      <p className="muted">A photo, a film, a little part of your day.</p>
      <form onSubmit={submit}>
        <div className="type-picker">
          {["photo", "reel", "video", "story"].map((k) => (
            <button
              type="button"
              className={kind === k ? "selected" : ""}
              key={k}
              onClick={() => {
                setKind(k);
                setFile(null);
                setPreview("");
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <label className="upload-area">
          {file ? (
            file.type.startsWith("video/") ? (
              <video src={preview} muted controls />
            ) : (
              <img src={preview} alt="Upload preview" />
            )
          ) : (
            <>
              <Plus size={30} />
              <b>Choose your {kind}</b>
              <small>JPG, PNG, WebP, MP4 or WebM · up to 8 MB</small>
            </>
          )}
          <input
            type="file"
            required
            accept={
              kind === "photo"
                ? "image/jpeg,image/png,image/webp"
                : kind === "story"
                  ? "image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  : "video/mp4,video/webm"
            }
            onChange={(e) => {
              const f = e.target.files[0];
              if (f?.size > 8 * 1024 * 1024) {
                notify("Choose a file under 8 MB.");
                e.target.value = "";
                return;
              }
              setFile(f || null);
            }}
          />
        </label>
        <label className="field">
          <span>A few words</span>
          <textarea
            name="caption"
            maxLength={2200}
            placeholder="What's the story?"
          />
        </label>
        <fieldset className="topic-checkboxes">
          <legend>Topics · choose up to 3</legend>
          {TOPICS.map((t) => (
            <label key={t}>
              <input type="checkbox" name="topics" value={t} />
              {t}
            </label>
          ))}
        </fieldset>
        <label className="check-field">
          <input type="checkbox" name="human" required />I created this content
          without generative AI and have the right to share it.
        </label>
        <p className="fine">
          New uploads go through human moderation. We don't claim an automated
          scanner can prove authenticity. Stories expire 24 hours after upload.
        </p>
        <button className="primary wide" disabled={busy || !file}>
          {busy ? (
            <>
              <Loader2 size={16} className="spin" />
              {phase}
            </>
          ) : (
            "Submit for review"
          )}
          <ArrowUpRight size={16} />
        </button>
      </form>
    </>
  );
}
function Comments({ post, execute }) {
  const [comments, setComments] = useState([]),
    [busy, setBusy] = useState(false);
  const load = () =>
    execute(async () =>
      setComments((await api(`/posts/${post.id}/comments`)).comments),
    );
  useEffect(() => {
    load();
  }, [post.id]);
  return (
    <>
      <span className="eyebrow">LITTLE CONVERSATIONS</span>
      <h2>Leave a little kindness.</h2>
      <div className="comment-list">
        {comments.length ? (
          comments.map((c) => (
            <p key={c.id}>
              <b>{c.username}</b> {c.body}
              <small>{when(c.created_at)}</small>
            </p>
          ))
        ) : (
          <p className="muted">Be the first to say something.</p>
        )}
      </div>
      <form
        className="comment-compose"
        onSubmit={async (e) => {
          e.preventDefault();
          const el = e.currentTarget,
            body = new FormData(el).get("body");
          setBusy(true);
          const d = await execute(() =>
            api(`/posts/${post.id}/comments`, {
              method: "POST",
              body: { body },
            }),
          );
          if (d) {
            el.reset();
            load();
          }
          setBusy(false);
        }}
      >
        <input
          aria-label="Your comment"
          name="body"
          placeholder="Add your comment…"
          required
          maxLength={1000}
        />
        <button aria-label="Post comment" disabled={busy}>
          <Send size={20} />
        </button>
      </form>
    </>
  );
}
function Share({ post, execute, notify, close }) {
  const [people, setPeople] = useState([]);
  useEffect(() => {
    execute(async () => setPeople((await api("/people")).people));
  }, []);
  return (
    <>
      <h2>Pass on a moment.</h2>
      <p className="muted">Send to someone in your community.</p>
      {people.length ? (
        people.map((p) => (
          <button
            className="person-row share-person"
            key={p.id}
            onClick={() =>
              execute(async () => {
                await api("/messages", {
                  method: "POST",
                  body: {
                    recipient: p.id,
                    body: `Shared a ${post.kind} from @${post.username}: ${post.caption.slice(0, 500)}`,
                  },
                });
                notify("Sent to @" + p.username);
                close();
              })
            }
          >
            <Avatar name={p.username} />
            <b>{p.username}</b>
            <Send size={17} />
          </button>
        ))
      ) : (
        <p className="fine">Other community members will appear here.</p>
      )}
    </>
  );
}
function Report({ post, execute, notify, done }) {
  return (
    <>
      <span className="eyebrow">HELP KEEP THIS SPACE HUMAN</span>
      <h2>Report this post.</h2>
      <p className="muted">
        A moderator will review your report. The creator won't see who reported
        it.
      </p>
      <div className="report-options">
        {[
          "AI-generated content",
          "Sexual content",
          "Spam or manipulation",
          "Harassment",
        ].map((reason) => (
          <button
            key={reason}
            onClick={() =>
              execute(async () => {
                await api(`/posts/${post.id}/report`, {
                  method: "POST",
                  body: { reason },
                });
                notify("Report submitted for review.");
                done();
              })
            }
          >
            {reason}
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
    </>
  );
}
function Focus({ activate }) {
  const [seconds, setSeconds] = useState(5);
  return (
    <>
      <div className="focus-emblem">
        <LockKeyhole />
      </div>
      <span className="eyebrow">MAKE ROOM FOR YOURSELF</span>
      <h2>
        Your time.
        <br />
        Your terms.
      </h2>
      <p className="muted">
        The server pauses access to this account for your chosen duration,
        across devices and reloads.
      </p>
      <div className="focus-options">
        {[
          [5, "5 seconds", "Try it"],
          [3600, "1 hour", "Find your flow"],
          [14400, "4 hours", "Go all in"],
        ].map(([n, label, sub]) => (
          <button
            key={n}
            className={seconds === n ? "selected" : ""}
            onClick={() => setSeconds(n)}
          >
            <b>{label}</b>
            <small>{sub}</small>
          </button>
        ))}
      </div>
      <p className="fine">
        Your browser remains under your control. This locks access to the social
        account until the timer ends.
      </p>
      <button className="primary wide" onClick={() => activate(seconds)}>
        Start focus session <LockKeyhole size={16} />
      </button>
    </>
  );
}
function People({ execute, notify }) {
  const [profileName, setProfileName] = useState(
    new URLSearchParams(location.search).get("profile"),
  );
  const [query, setQuery] = useState(""),
    [people, setPeople] = useState([]);
  useEffect(() => {
    const t = setTimeout(
      () =>
        execute(async () =>
          setPeople(
            (await api("/people?q=" + encodeURIComponent(query))).people,
          ),
        ),
      250,
    );
    if (profileName)
      return (
        <CommunityProfile
          username={profileName}
          execute={execute}
          notify={notify}
          onBack={() => {
            setProfileName(null);
            history.replaceState({}, "", "/social/people");
          }}
        />
      );
    return () => clearTimeout(t);
  }, [query]);
  return (
    <>
      <span className="eyebrow">FIND YOUR CORNER OF THE WORLD</span>
      <h1>Good people to know.</h1>
      <label className="search-box">
        <Search size={18} />
        <input
          placeholder="Search by name or username"
          aria-label="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {people.map((p) => (
        <div className="person-row" key={p.id}>
          <Avatar name={p.username} />
          <div>
            <button
              className="profile-name-button"
              onClick={() => {
                setProfileName(p.username);
                history.replaceState(
                  {},
                  "",
                  "/social/people?profile=" + p.username,
                );
              }}
            >
              {p.display_name}
            </button>
            <small>
              @{p.username}
              {p.account_type === "organization" ? " · Organization" : ""}
              {p.private ? " · Private account" : ""}
            </small>
            <p>{p.bio}</p>
          </div>
          <button
            onClick={() =>
              execute(async () => {
                const d = await api(`/people/${p.id}/follow`, {
                  method: "POST",
                });
                setPeople((ps) =>
                  ps.map((x) =>
                    x.id === p.id ? { ...x, following: d.following } : x,
                  ),
                );
                if (d.requested) notify("Follow request sent.");
              })
            }
          >
            {p.following ? "Following" : "Follow"}
          </button>
        </div>
      ))}
      {!people.length && (
        <Empty icon={Users} title="There's room for more people here.">
          Invite someone to sign up at beaconofunity.com/social.
        </Empty>
      )}
    </>
  );
}
function Messages({ user, execute, notify }) {
  const [people, setPeople] = useState([]),
    [peer, setPeer] = useState(null),
    [messages, setMessages] = useState([]),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false);
  const end = useRef();
  const load = async () => {
    if (peer) {
      const d = await execute(() => api("/messages?peer=" + peer.id));
      if (d) setMessages(d.messages.reverse());
    }
  };
  useEffect(() => {
    execute(async () =>
      setPeople((await api("/people?q=" + encodeURIComponent(query))).people),
    );
  }, [query]);
  useEffect(() => {
    setMessages([]);
    load();
    const t = setInterval(() => {
      if (!document.hidden) load();
    }, 5000);
    return () => clearInterval(t);
  }, [peer?.id]);
  useEffect(
    () => end.current?.scrollIntoView({ block: "nearest" }),
    [messages.length],
  );
  return (
    <>
      <span className="eyebrow">A LITTLE CLOSER</span>
      <h1>Messages.</h1>
      <p className="muted">A conversation just between you.</p>
      <div className={`live-inbox ${peer ? "thread-open" : ""}`}>
        <section className="thread-list">
          <label className="search-box">
            <Search size={15} />
            <input
              aria-label="Find a person"
              placeholder="Find someone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {people.map((p) => (
            <button
              className={`thread-row ${p.id === peer?.id ? "selected" : ""}`}
              key={p.id}
              onClick={() => {
                setPeer(p);
                setDraft("");
              }}
            >
              <Avatar name={p.username} />
              <span>
                <b>{p.username}</b>
                <small>{p.display_name}</small>
              </span>
            </button>
          ))}
          {!people.length && (
            <p className="fine">
              No other people yet. Invite a friend to join.
            </p>
          )}
        </section>
        <section className="thread-body">
          {peer ? (
            <>
              <div className="thread-head">
                <button
                  aria-label="Back to people"
                  onClick={() => setPeer(null)}
                >
                  <ArrowLeft size={19} />
                </button>
                <Avatar name={peer.username} />
                <div>
                  <b>{peer.username}</b>
                  <small>Private conversation</small>
                </div>
                <button
                  className="block-user"
                  onClick={() => {
                    if (
                      confirm(
                        "Block this person? They will no longer be able to message you or see your posts.",
                      )
                    )
                      execute(async () => {
                        await api(`/people/${peer.id}/block`, {
                          method: "POST",
                        });
                        setPeer(null);
                        setPeople(people.filter((p) => p.id !== peer.id));
                        notify("Person blocked.");
                      });
                  }}
                >
                  Block
                </button>
              </div>
              <div className="thread-messages">
                {messages.length ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`bubble ${m.sender === user.id ? "mine" : ""}`}
                    >
                      <p>{m.body}</p>
                      <small>
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="chat-welcome">
                    <Send />
                    <p>Start with a little hello.</p>
                  </div>
                )}
                <div ref={end} />
              </div>
              <form
                className="message-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!draft.trim() || busy) return;
                  setBusy(true);
                  const d = await execute(() =>
                    api("/messages", {
                      method: "POST",
                      body: { recipient: peer.id, body: draft.trim() },
                    }),
                  );
                  if (d) {
                    setDraft("");
                    load();
                  }
                  setBusy(false);
                }}
              >
                <input
                  aria-label="Your message"
                  placeholder="Say something real…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                />
                <button
                  aria-label="Send message"
                  disabled={busy || !draft.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <Empty icon={Send} title="A little hello goes a long way.">
              Choose a person to start a private conversation.
            </Empty>
          )}
        </section>
      </div>
      <p className="fine">
        Messages are private to participants and are not end-to-end encrypted.
        Refreshes every 5 seconds while open.
      </p>
    </>
  );
}
function SettingsPage({ user, setUser, execute, notify, nav }) {
  const [requests, setRequests] = useState([]),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    execute(async () => setRequests((await api("/follow-requests")).people));
  }, []);
  return (
    <>
      <span className="eyebrow">MAKE THIS SPACE YOURS</span>
      <h1>Settings & privacy.</h1>
      <form
        className="settings-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const d = Object.fromEntries(new FormData(e.target));
          const result = await execute(() =>
            api("/profile", {
              method: "PATCH",
              body: { ...d, private: d.private === "on" },
            }),
          );
          if (result) {
            setUser(result.user);
            notify("Profile updated.");
          }
          setBusy(false);
        }}
      >
        <h3>Your profile</h3>
        <label className="field">
          <span>Profile type</span>
          <select
            name="account_type"
            defaultValue={user.account_type || "person"}
          >
            <option value="person">Person / creator</option>
            <option value="organization">Organization / company</option>
          </select>
        </label>
        <p className="fine">
          Organization pages can post and join conversations. Their posts enter
          someone's discovery feed only when that person chooses to follow them.
        </p>
        <Field
          label="Website (optional)"
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={user.website || ""}
        />

        <Field
          label="Display name"
          name="display_name"
          defaultValue={user.display_name}
          maxLength={60}
          required
        />
        <label className="field">
          <span>Bio</span>
          <textarea name="bio" defaultValue={user.bio} maxLength={240} />
        </label>
        <label className="check-field">
          <input type="checkbox" name="private" defaultChecked={user.private} />
          Private account — only approved followers can see your posts.
        </label>
        <button className="primary" disabled={busy}>
          Save changes
        </button>
      </form>
      <section className="settings-card">
        <h3>Account</h3>
        <p className="muted">
          {user.email} ·{" "}
          {user.email_verified ? "Verified email" : "Email not verified"}
        </p>
        {!user.email_verified && (
          <button
            className="text-button"
            onClick={() =>
              execute(async () => {
                const d = await api("/auth/verification", { method: "POST" });
                notify(d.message);
              })
            }
          >
            Send confirmation email <ArrowUpRight size={14} />
          </button>
        )}
        <button
          className="text-button"
          onClick={() =>
            execute(async () => {
              await api("/auth/logout", { method: "POST" });
              setUser(null);
              nav("login");
            })
          }
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>
      {requests.length > 0 && (
        <section className="settings-card">
          <h3>Follow requests</h3>
          {requests.map((p) => (
            <div className="person-row" key={p.id}>
              <b>{p.username}</b>
              <button
                onClick={() =>
                  execute(async () => {
                    await api(`/people/${p.id}/accept`, { method: "POST" });
                    setRequests(requests.filter((x) => x.id !== p.id));
                  })
                }
              >
                Accept
              </button>
            </div>
          ))}
        </section>
      )}
      <section className="settings-card danger-zone">
        <h3>Delete your account</h3>
        <p className="muted">
          Permanently removes your profile, posts, uploaded media, comments, and
          messages. This cannot be undone.
        </p>
        <button
          className="text-button"
          onClick={() => {
            const password = prompt(
              "Enter your password to permanently delete your account.",
            );
            if (
              password &&
              confirm("Permanently delete your account and data?")
            )
              execute(async () => {
                await api("/account", { method: "DELETE", body: { password } });
                setUser(null);
                nav("login");
              });
          }}
        >
          Delete account
        </button>
      </section>
      <p className="fine">
        <a href="/social/privacy">Privacy notice</a> ·{" "}
        <a href="/social/terms">Community rules</a>
      </p>
    </>
  );
}
function Admin({ user, execute, notify }) {
  const [data, setData] = useState(null);
  const load = () => execute(async () => setData(await api("/admin/overview")));
  useEffect(() => {
    if (user.role === "admin") load();
  }, []);
  if (user.role !== "admin")
    return <Empty icon={LockKeyhole} title="Administrator access required." />;
  const moderate = (target, status) =>
    execute(async () => {
      await api("/admin/moderate", {
        method: "POST",
        body: { target, status },
      });
      notify("Moderation decision saved.");
      load();
    });
  return (
    <>
      <span className="eyebrow">PRIVATE ADMIN WORKSPACE</span>
      <h1>Keep the human in social.</h1>
      <p className="muted">
        Review uploads, act on reports, and manage access. Decisions are
        recorded in the audit log.
      </p>
      {!data ? (
        <Loader2 className="spin" />
      ) : (
        <>
          <div className="admin-stats">
            <span>
              <b>{data.pending.length}</b> awaiting review
            </span>
            <span>
              <b>{data.reports.length}</b> open reports
            </span>
            <span>
              <b>{data.users.length}</b> members shown
            </span>
          </div>
          <section className="settings-card">
            <h3>Upload review queue</h3>
            <p className="fine">
              Check provenance, rights, and community rules. Approval is a
              moderation decision, not proof of human authorship.
            </p>
            {data.pending.length ? (
              data.pending.map((p) => (
                <div className="review-item" key={p.id}>
                  {p.mime.startsWith("video/") ? (
                    <video
                      controls
                      preload="metadata"
                      src={mediaUrl(p.media_id)}
                    />
                  ) : (
                    <img src={mediaUrl(p.media_id)} alt="Moderation preview" />
                  )}
                  <div>
                    <b>
                      @{p.username} · {p.kind}
                    </b>
                    <p>{p.caption}</p>
                    <button
                      className="primary"
                      onClick={() => moderate(p.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="text-button"
                      onClick={() => moderate(p.id, "removed")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">All caught up.</p>
            )}
          </section>
          <section className="settings-card">
            <h3>Community reports</h3>
            {data.reports.map((r) => (
              <div className="admin-report" key={r.id}>
                <b>
                  {r.reason} · @{r.username}
                </b>
                <p>{r.caption}</p>
                <button onClick={() => moderate(r.post_id, "removed")}>
                  Remove post
                </button>
                <button onClick={() => moderate(r.post_id, "approved")}>
                  Keep post / resolve
                </button>
              </div>
            ))}
            {!data.reports.length && <p className="muted">No open reports.</p>}
          </section>
          <section className="settings-card">
            <h3>Members</h3>
            {data.users.map((p) => (
              <div className="person-row" key={p.id}>
                <b>@{p.username}</b>
                <small>
                  {p.role} · {p.status}
                </small>
                {p.role !== "admin" && p.status === "active" && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Suspend @" +
                            p.username +
                            " and revoke their sessions?",
                        )
                      )
                        execute(async () => {
                          await api("/admin/suspend", {
                            method: "POST",
                            body: { target: p.id },
                          });
                          load();
                        });
                    }}
                  >
                    Suspend
                  </button>
                )}
              </div>
            ))}
          </section>
          <EmailSettings execute={execute} notify={notify} />
          <section className="settings-card">
            <h3>Audit log</h3>
            {data.audit.slice(0, 30).map((a) => (
              <p className="audit-entry" key={a.id}>
                {when(a.created_at)} · {a.action} · {a.target}
              </p>
            ))}
          </section>
        </>
      )}
    </>
  );
}
function Legal() {
  const terms = location.pathname.endsWith("/terms");
  return (
    <div className="legal-page">
      <a href="/social/">← Back to Social</a>
      <span className="eyebrow">BEACON OF UNITY · SOCIAL EARLY ACCESS</span>
      <h1>{terms ? "Community rules" : "Privacy notice"}</h1>
      {terms ? (
        <>
          <h2>Make room for real people.</h2>
          <p>
            Share content you own or have permission to use. Generative AI
            posts, impersonation, harassment, sexual content, illegal material,
            spam and engagement manipulation are not allowed. Report concerning
            content using the post menu.
          </p>
          <p>
            Uploads are held privately until a moderator approves them. Approval
            is a judgment call, not a guarantee of authenticity. Accounts may be
            suspended for violations. There are no in-app purchases in this
            early-access release.
          </p>
          <p>
            This early-access service is for people aged 13 and over. By
            creating an account you confirm you meet that minimum age. This is a
            self-declaration, not identity or age verification. Contact the
            operator through <a href="/contact.html">Beacon of Unity</a> for
            moderation appeals.
          </p>
        </>
      ) : (
        <>
          <h2>Your account. Your boundaries.</h2>
          <p>
            We store your email, salted password hash, profile, social
            interactions, messages and uploaded media in the app's Cloudflare
            database and private database-backed media storage. Session cookies
            are necessary for login. Short-lived, hashed network identifiers are
            used for abuse limits.
          </p>
          <p>
            Private posts can be read by the owner, approved followers, and
            authorized administrators. Direct messages are accessible to
            participants through the app. They are not end-to-end encrypted;
            infrastructure operators with database access can access stored
            data. Admin review covers uploaded posts and reports.
          </p>
          <p>
            Delete your account in Settings to remove associated records and
            media. Database-provider backups may retain prior data according to
            the provider's retention policy. Operational abuse and moderation
            audit records may remain. Password recovery and email confirmation
            use Resend when configured.
          </p>
          <p>
            The guest demo at /socialdemo uses sample content and browser-local
            storage. Google Fonts, Unsplash, Pravatar and MDN host demo assets
            and receive ordinary connection data when those assets load. The
            demo does not send your conversations to real accounts.
          </p>
          <p>
            For access, correction, export or privacy requests, contact the
            operator through <a href="/contact.html">Beacon of Unity</a>. This
            early-access notice will be updated before a wider launch.
          </p>
        </>
      )}
      <p className="fine">Updated 5 November 2026. Brand name pending.</p>
    </div>
  );
}
function Root() {
  if (location.pathname.startsWith("/socialdemo"))
    return (
      <>
        <div className="demo-banner">
          <span>GUEST DEMO · SAMPLE CONTENT</span>
          <a href="/social/">
            Open the real app <ArrowUpRight size={13} />
          </a>
        </div>
        <Suspense fallback={<div className="loading">Opening demo…</div>}>
          <Demo />
        </Suspense>
      </>
    );
  if (["/social/privacy", "/social/terms"].includes(location.pathname))
    return <Legal />;
  return <App />;
}
createRoot(document.getElementById("root")).render(<Root />);

import "./interaction-refinements.css";

import "./community.css";
