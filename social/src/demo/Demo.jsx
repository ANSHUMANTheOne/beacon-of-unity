import { DemoDiscover } from "../Community.jsx";
import { Inbox, Reels, useInbox } from "./Social.jsx";
import React, { useState as S, useEffect as E } from "react";
import {
  House,
  Compass,
  Plus,
  LockKeyhole,
  User,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
  ArrowUpRight,
  Check,
  Leaf,
  ChevronRight,
  ArrowLeft,
  Search,
  ShieldCheck,
  Grid3X3,
  VolumeX,
  Clapperboard,
} from "lucide-react";
import "./style.css";
const photo = (id, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const pics = [
  "photo-1470770841072-f978cf4d019e",
  "photo-1441974231531-c6227db76b6e",
  "photo-1495474472287-4d71bcdd2085",
  "photo-1470252649378-9c29740c9fa8",
];
const people = [
  "alex.morgan",
  "ella.wanders",
  "james.analog",
  "sophie.studio",
  "noah.outside",
  "mia.slowdays",
];
const av = (i) =>
  photo(
    [
      "photo-1534528741775-53994a69daeb",
      "photo-1500648767791-00dcc994a43e",
      "photo-1506794778202-cad84cf45f1d",
      "photo-1524504388940-b1c1722653e1",
      "photo-1535713875002-d1d0cf377fde",
      "photo-1517841905240-472988babdf9",
    ][i % 6],
    100,
  );
const initial = [
  {
    id: 1,
    user: "ella.wanders",
    person: 0,
    place: "Dolomites, Italy",
    time: "12 min",
    img: photo(pics[0]),
    caption: "No signal. No plans. Just this. 🌿",
    likes: 128,
    comments: [
      ["james.analog", "The kind of quiet you can hear."],
      ["sophie.studio", "Adding this to my someday list 🤍"],
    ],
  },
  {
    id: 2,
    user: "james.analog",
    person: 2,
    place: "Somewhere off the beaten path",
    time: "38 min",
    img: photo(pics[1]),
    caption: "Took the long way home. Always take the long way home.",
    likes: 86,
    comments: [["noah.outside", "Worth every step."]],
  },
  {
    id: 3,
    user: "mia.slowdays",
    person: 5,
    place: "Sunday, at home",
    time: "1 hr",
    img: photo(pics[2]),
    caption: "A small ritual. A slower morning.",
    likes: 64,
    comments: [],
  },
];
const products = [
  {
    name: "The everyday tote",
    brand: "FORM & FIELD",
    price: 28,
    img: photo("photo-1553062407-98eeb64c6a62"),
    cat: "Objects",
  },
  {
    name: "A slower kind of coffee",
    brand: "SUNDAY COFFEE",
    price: 18,
    img: photo(pics[2]),
    cat: "Coffee",
  },
  {
    name: "Room for your thoughts",
    brand: "PAPER PEOPLE",
    price: 16,
    img: photo("photo-1455390582262-044cdead277a"),
    cat: "Stationery",
  },
  {
    name: "Your off-duty essential",
    brand: "COMMON GROUND",
    price: 42,
    img: photo("photo-1521572163474-6864f9cf17ab"),
    cat: "Apparel",
  },
];
export default function App() {
  const inbox = useInbox();
  const [tab, T] = S("Home"),
    [modal, M] = S(null),
    [posts, P] = S(initial),
    [story, ST] = S(-1),
    [progress, PG] = S(0),
    [seen, SE] = S([]),
    [duration, D] = S(5),
    [lock, L] = S(() => Number(localStorage.getItem("social-demo-lock") || 0)),
    [now, N] = S(Date.now()),
    [toast, TO] = S(""),
    [menu, MENU] = S(null),
    [expanded, EX] = S([]),
    [burst, B] = S(null),
    [hidden, H] = S([]),
    [saved, SV] = S([]),
    [filter, F] = S("All finds"),
    [upload, U] = S(""),
    [caption, C] = S(""),
    [scan, SC] = S(""),
    [following, FO] = S([]),
    [messages, MS] = S([
      "Hey! Found a trail for this weekend. No signal, apparently. 🌲",
    ]),
    [success, SU] = S(false);
  E(() => {
    let t = setInterval(() => N(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  E(() => {
    if (lock && now >= lock) {
      L(0);
      localStorage.removeItem("social-demo-lock");
    }
  }, [now, lock]);
  E(() => {
    if (!toast) return;
    let t = setTimeout(() => TO(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  E(() => {
    if (story < 0) return;
    SE((s) => [...new Set([...s, story])]);
    PG(0);
    let start = Date.now();
    let t = setInterval(() => {
      let p = (Date.now() - start) / 50;
      PG(p);
      if (p >= 100) {
        ST((s) => (s >= 5 ? -1 : s + 1));
      }
    }, 50);
    return () => clearInterval(t);
  }, [story]);
  E(() => {
    const f = (e) => {
      if (e.key === "Escape" && lock <= Date.now()) {
        M(null);
        ST(-1);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [lock]);
  const like = (id, force = false) =>
    P((ps) =>
      ps.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: force || !p.liked,
              likes: p.likes + (p.liked ? (force ? 0 : -1) : 1),
            }
          : p,
      ),
    );
  const open = (m) => {
    M(m);
    SU(false);
  };
  const nav = (t) => {
    T(t);
    window.scrollTo(0, 0);
  };
  if (lock > now)
    return (
      <div className="shield">
        <LockKeyhole size={38} />
        <p className="eyebrow">A LITTLE SPACE FOR REAL LIFE</p>
        <h1>
          {new Date(Math.ceil((lock - now) / 1000) * 1000)
            .toISOString()
            .slice(11, 19)}
        </h1>
        <p>Demo focus session. Your time is yours.</p>
        <small>Prototype focus session · unlocks automatically</small>
        <div className="breathe" />
      </div>
    );
  return (
    <>
      <aside className="sidebar">
        <a className="logo" onClick={() => nav("Home")}>
          social<span>Ⅱ</span>
        </a>
        <div className="side-nav">
          {[
            [House, "Home"],
            [Compass, "Discover"],
            [Clapperboard, "Reels"],
            [LockKeyhole, "Deep focus"],
            [Send, "Messages"],
            [Plus, "Create"],
            [User, "Profile"],
          ].map(([I, n]) => (
            <button
              key={n}
              className={`${tab === n ? "active" : ""} ${n === "Deep focus" ? "focus-nav" : ""}`}
              onClick={() =>
                n === "Deep focus"
                  ? open("focus")
                  : n === "Create"
                    ? open("create")
                    : nav(n)
              }
            >
              <I size={22} />
              <span>{n}</span>
              {n === "Deep focus" && <i />}
            </button>
          ))}
        </div>
        <div className="side-bottom">
          <div className="organic">
            <Leaf size={16} /> Less noise. More life.
          </div>
          <button className="account" onClick={() => nav("Profile")}>
            <img src={av(4)} />
            <span>
              <b>Alex Morgan</b>
              <small>@alex.morgan</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <div className="app">
        <header>
          <span className="mobile-logo">social Ⅱ</span>
          <span className="header-note">A little more present.</span>
          <div>
            <span className="live-dot" />
            <small>YOUR TIME. YOUR TERMS.</small>
            <button aria-label="Messages" onClick={() => nav("Messages")}>
              <Send size={21} />
            </button>
            <button
              className="notification"
              aria-label="Notifications"
              onClick={() => open("notifications")}
            >
              <Heart size={22} />
              <i />
            </button>
          </div>
        </header>
        <div className={`layout ${tab === "Messages" ? "inbox-layout" : ""}`}>
          <main>
            {tab === "Messages" && (
              <Inbox threads={inbox.threads} send={inbox.send} />
            )}
            {tab === "Reels" && (
              <Reels
                suspended={!!modal || story >= 0}
                onShare={(reel) => open({ share: reel })}
              />
            )}

            {tab === "Home" && (
              <>
                <section className="page-title">
                  <div>
                    <div className="eyebrow">YOUR PEOPLE, YOUR PACE</div>
                    <h1>
                      A little more life<span>.</span>
                    </h1>
                  </div>
                  <span className="pill">
                    <span className="live-dot" /> Following
                  </span>
                </section>
                <div className="stories">
                  {people.map((p, i) => (
                    <button key={p} onClick={() => ST(i)}>
                      <div
                        className={`story-ring ${seen.includes(i) ? "seen" : ""}`}
                      >
                        <img src={av(i)} />
                        {i === 0 && <span>+</span>}
                      </div>
                      <small>{i === 0 ? "Your story" : p}</small>
                    </button>
                  ))}
                </div>
                <div className="feed-label">
                  <span>
                    All caught up with the algorithm.
                    <br className="mobile-only" /> Now, just your people.
                  </span>
                  <span>
                    <span className="live-dot" /> CHRONOLOGICAL
                  </span>
                </div>
                {posts.map((p) => (
                  <article
                    key={p.id}
                    className={hidden.includes(p.id) ? "post removed" : "post"}
                  >
                    <div className="post-header">
                      <img src={av(p.person)} />
                      <div>
                        <b>
                          {p.user} <ShieldCheck size={13} />
                        </b>
                        <small>{p.place}</small>
                      </div>
                      <span>{p.time}</span>
                      <div className="menu-wrap">
                        <button
                          aria-label={`Options for ${p.user}`}
                          onClick={() => MENU(menu === p.id ? null : p.id)}
                        >
                          <MoreHorizontal />
                        </button>
                        {menu === p.id && (
                          <div className="dropdown">
                            <button
                              onClick={() => {
                                H([...hidden, p.id]);
                                MENU(null);
                                TO("Report received. This post is hidden.");
                              }}
                            >
                              Report AI Slop / 18+ Content
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="post-image"
                      onDoubleClick={() => {
                        like(p.id, true);
                        B(p.id);
                        setTimeout(() => B(null), 800);
                      }}
                    >
                      <img src={p.img} alt={p.place} />
                      <span className="image-badge">
                        <ShieldCheck size={12} /> HUMAN MOMENT
                      </span>
                      {burst === p.id && (
                        <Heart className="big-heart" fill="white" size={100} />
                      )}
                    </div>
                    <div className="actions">
                      <button
                        aria-label="Like post"
                        className={p.liked ? "liked" : ""}
                        onClick={() => like(p.id)}
                      >
                        <Heart fill={p.liked ? "currentColor" : "none"} />
                      </button>
                      <button
                        aria-label="Comment"
                        onClick={() => {
                          EX([...expanded, p.id]);
                          document.getElementById("comment-" + p.id)?.focus();
                        }}
                      >
                        <MessageCircle />
                      </button>
                      <button
                        aria-label="Share post"
                        onClick={() => open({ share: p })}
                      >
                        <Send />
                      </button>
                      <button
                        className={`save ${saved.includes(p.id) ? "saved" : ""}`}
                        aria-label="Save post"
                        onClick={() =>
                          SV(
                            saved.includes(p.id)
                              ? saved.filter((x) => x !== p.id)
                              : [...saved, p.id],
                          )
                        }
                      >
                        <Bookmark
                          fill={saved.includes(p.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <b className="likes">{p.likes} likes</b>
                    <p className="caption">
                      <b>{p.user}</b> {p.caption}
                    </p>
                    <button
                      className="comments-link"
                      onClick={() =>
                        EX(
                          expanded.includes(p.id)
                            ? expanded.filter((x) => x !== p.id)
                            : [...expanded, p.id],
                        )
                      }
                    >
                      {expanded.includes(p.id)
                        ? "Hide comments"
                        : `View all ${p.comments.length} comments`}
                    </button>
                    {expanded.includes(p.id) && (
                      <div className="comments">
                        {p.comments.map(([u, c], i) => (
                          <p key={i}>
                            <b>{u}</b> {c}
                          </p>
                        ))}
                      </div>
                    )}
                    <form
                      className="comment-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        let input = e.target.elements.comment;
                        if (!input.value.trim()) return;
                        P(
                          posts.map((x) =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  comments: [
                                    ...x.comments,
                                    ["alex.morgan", input.value.trim()],
                                  ],
                                }
                              : x,
                          ),
                        );
                        EX([...expanded, p.id]);
                        input.value = "";
                      }}
                    >
                      <input
                        id={"comment-" + p.id}
                        name="comment"
                        placeholder="Leave a little kindness…"
                        maxLength={500}
                      />
                      <button>Post</button>
                    </form>
                  </article>
                ))}
                <div className="end">
                  <Check />
                  <h3>You're all caught up.</h3>
                  <p>There's a whole world on the other side of this screen.</p>
                  <button className="primary" onClick={() => open("focus")}>
                    Take a pause <ArrowUpRight size={17} />
                  </button>
                </div>
              </>
            )}
            {tab === "Discover" && <DemoDiscover />}
            {tab === "Profile" && (
              <>
                <div className="profile">
                  <img src={av(4)} />
                  <div className="eyebrow">YOUR LITTLE CORNER</div>
                  <h1>
                    Alex Morgan<span>.</span>
                  </h1>
                  <p>@alex.morgan</p>
                  <p>
                    Collecting moments, not metrics. 🌱
                    <br />
                    Usually somewhere outside.
                  </p>
                  <div className="profile-stats">
                    <span>
                      <b>
                        {posts.filter((p) => p.user === "alex.morgan").length}
                      </b>{" "}
                      moments
                    </span>
                    <span>
                      <b>248</b> followers
                    </span>
                    <span>
                      <b>{182 + following.length}</b> following
                    </span>
                  </div>
                </div>
                <div className="filters">
                  {["Moments", "Saved"].map((f) => (
                    <button
                      className={filter === f ? "selected" : ""}
                      onClick={() => F(f)}
                      key={f}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="profile-grid">
                  {posts
                    .filter((p) =>
                      filter === "Saved"
                        ? saved.includes(p.id)
                        : p.user === "alex.morgan",
                    )
                    .map((p) => (
                      <img key={p.id} src={p.img} alt={p.caption} />
                    ))}
                </div>
                <div className="end">
                  <Plus />
                  <h3>Make room for a real moment.</h3>
                  <button className="primary" onClick={() => open("create")}>
                    Share a photo
                  </button>
                </div>
              </>
            )}
          </main>
          <aside className="rightbar">
            <div className="manifesto">
              <span className="eyebrow">
                <span className="live-dot" /> A DIFFERENT KIND OF SOCIAL
              </span>
              <h2>
                Connected.
                <br />
                Not consumed.
              </h2>
              <p>
                Real people. Real moments.
                <br />A feed that knows when to end.
              </p>
              <div>
                <span>
                  <Check size={13} /> No ads
                </span>
                <span>
                  <Check size={13} /> No algorithms
                </span>
              </div>
            </div>
            <div className="focus-card">
              <div className="between">
                <div className="lock-symbol">
                  <LockKeyhole size={20} />
                </div>
                <span className="tiny">MAKE SPACE</span>
              </div>
              <h3>Life happens offline.</h3>
              <p>
                Protect a little time for what
                <br />
                matters. We'll be here after.
              </p>
              <button onClick={() => open("focus")}>
                Enter deep focus <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="suggest-head">
              Good people to know <Leaf size={15} />
            </div>
            {[
              ["oliver.film", "Finding beauty in the everyday", 2],
              ["the.slow.studio", "Making things with intention", 3],
              ["leo.on.foot", "One trail at a time", 1],
            ].map(([u, b, i]) => (
              <div className="suggest" key={u}>
                <img src={av(i)} />
                <div>
                  <b>{u}</b>
                  <small>{b}</small>
                </div>
                <button
                  onClick={() =>
                    FO(
                      following.includes(u)
                        ? following.filter((x) => x !== u)
                        : [...following, u],
                    )
                  }
                >
                  {following.includes(u) ? <Check size={16} /> : "Follow"}
                </button>
              </div>
            ))}
            <div className="right-footer">
              <span>Made for humans, by humans.</span>
              <p>
                © 2026 social <span>·</span> Less, but better.
              </p>
              <div className="mini-logo">Ⅱ</div>
            </div>
          </aside>
        </div>
      </div>
      <nav className="mobile-nav">
        {[
          [House, "Home"],
          [Compass, "Discover"],
          [Clapperboard, "Reels"],
          [LockKeyhole, "Deep focus"],
          [Send, "Messages"],
          [Plus, "Create"],
          [User, "Profile"],
        ].map(([I, n]) => (
          <button
            aria-label={n}
            className={
              n === "Deep focus" ? "focus-mobile" : tab === n ? "selected" : ""
            }
            key={n}
            onClick={() =>
              n === "Deep focus"
                ? open("focus")
                : n === "Create"
                  ? open("create")
                  : nav(n)
            }
          >
            <I />
          </button>
        ))}
      </nav>
      {story >= 0 && (
        <div className="story-modal">
          <div
            className="story-content"
            style={{ backgroundImage: `url(${photo(pics[story % 4])})` }}
          >
            <div className="story-progress">
              {people.map((_, i) => (
                <div key={i}>
                  <span
                    style={{
                      width:
                        i < story
                          ? "100%"
                          : i === story
                            ? progress + "%"
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="story-top">
              <img src={av(story)} />
              <b>{people[story]}</b>
              <small>2h</small>
              <button aria-label="Close story" onClick={() => ST(-1)}>
                <X />
              </button>
            </div>
            <button
              className="story-prev"
              aria-label="Previous story"
              onClick={() => ST(Math.max(0, story - 1))}
            />
            <button
              className="story-next"
              aria-label="Next story"
              onClick={() => ST(story === 5 ? -1 : story + 1)}
            />
            <p>More of this. Less of everything else.</p>
          </div>
        </div>
      )}
      {modal && (
        <div className="overlay" onClick={() => M(null)}>
          <section
            className={`modal ${modal.product ? "checkout" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="social dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => M(null)}
            >
              <X />
            </button>
            {modal === "focus" && (
              <>
                <div className="modal-icon">
                  <LockKeyhole />
                </div>
                <div className="eyebrow">COME BACK TO YOURSELF</div>
                <h2>
                  A little less screen.
                  <br />A little more life.
                </h2>
                <p className="muted">
                  Choose your time away. Your feed will be here when you return.
                </p>
                <div className="durations">
                  {[
                    [5, "5 seconds", "Try it out"],
                    [3600, "1 hour", "Find your flow"],
                    [14400, "4 hours", "Go all in"],
                  ].map(([v, l, s]) => (
                    <button
                      className={v === duration ? "selected" : ""}
                      onClick={() => D(v)}
                      key={v}
                    >
                      <b>{l}</b>
                      <small>{s}</small>
                    </button>
                  ))}
                </div>
                <p className="fine">
                  This prototype locks the app until the timer ends, including
                  after a reload. Browser controls remain available.
                </p>
                <button
                  className="primary wide"
                  onClick={() => {
                    let until = Date.now() + duration * 1000;
                    localStorage.setItem("social-demo-lock", until);
                    L(until);
                    M(null);
                  }}
                >
                  <LockKeyhole size={17} /> Activate lock
                </button>
              </>
            )}
            {modal === "create" && (
              <>
                <div className="eyebrow">REAL IS ENOUGH</div>
                <h2>Share a moment.</h2>
                <label className="upload">
                  {upload ? (
                    <img src={upload} />
                  ) : (
                    <>
                      <Plus size={30} />
                      <b>A glimpse of your world</b>
                      <span>Choose a photo · JPG, PNG or WebP</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) {
                        TO("Please choose a photo under 10 MB.");
                        return;
                      }
                      const r = new FileReader();
                      r.onload = () => {
                        U(r.result);
                        SC("Preparing your demo upload...");
                        setTimeout(() => SC("Demo upload ready"), 1800);
                      };
                      r.readAsDataURL(file);
                    }}
                  />
                </label>
                {scan && (
                  <p className="scan">
                    <ShieldCheck size={16} />
                    {scan}
                  </p>
                )}
                <textarea
                  placeholder="What's the story behind this moment?"
                  value={caption}
                  onChange={(e) => C(e.target.value)}
                  maxLength={1000}
                />
                <p className="fine">
                  Demo only. Real uploads go through moderation in the live app.
                </p>
                <button
                  className="primary wide"
                  disabled={!upload || scan !== "Demo upload ready"}
                  onClick={() => {
                    P([
                      {
                        id: Date.now(),
                        user: "alex.morgan",
                        person: 4,
                        place: "A moment from my day",
                        time: "Just now",
                        img: upload,
                        caption,
                        likes: 0,
                        comments: [],
                      },
                      ...posts,
                    ]);
                    U("");
                    C("");
                    SC("");
                    M(null);
                    nav("Home");
                    TO("Your moment is out in the world.");
                  }}
                >
                  Share moment <ArrowUpRight size={17} />
                </button>
              </>
            )}
            {modal === "notifications" && (
              <>
                <h2>A little love.</h2>
                <p className="muted">The latest from your people.</p>
                {[
                  "ella.wanders liked your moment.",
                  "james.analog started following you.",
                  "sophie.studio saved your photo.",
                ].map((s, i) => (
                  <div className="notice" key={s}>
                    <img src={av(i)} />
                    <span>
                      {s}
                      <small>{i + 1} hours ago</small>
                    </span>
                    <Heart size={16} />
                  </div>
                ))}
              </>
            )}
            {modal === "messages" && (
              <>
                <h2>Your conversations.</h2>
                <div className="notice">
                  <img src={av(0)} />
                  <b>ella.wanders</b>
                  <span className="live-dot" />
                </div>
                <div className="chat">
                  {messages.map((s, i) => (
                    <p key={i} className={i ? "sent" : ""}>
                      {s}
                    </p>
                  ))}
                </div>
                <form
                  className="comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = e.target.message.value.trim();
                    if (v) {
                      MS([...messages, v]);
                      e.target.reset();
                    }
                  }}
                >
                  <input
                    name="message"
                    placeholder="Send a little hello…"
                    required
                  />
                  <button aria-label="Send message">
                    <Send size={19} />
                  </button>
                </form>
                <p className="fine">
                  Demo conversation · messages stay in this session.
                </p>
              </>
            )}
            {modal.share && (
              <>
                <h2>Pass on a moment.</h2>
                <p className="muted">
                  Share {modal.share.user}'s photo with your people.
                </p>
                {people.slice(1, 4).map((u, i) => (
                  <div className="notice" key={u}>
                    <img src={av(i)} />
                    <b>{u}</b>
                    <button
                      onClick={() => {
                        inbox.send(
                          u,
                          "Shared " +
                            (modal.share.src ? "a reel" : "a photo") +
                            " from @" +
                            modal.share.user +
                            ": " +
                            modal.share.caption,
                        );
                        M(null);
                        TO("Shared with " + u + " — view in Messages");
                      }}
                    >
                      Send <Send size={15} />
                    </button>
                  </div>
                ))}
              </>
            )}
            {modal.product &&
              (success ? (
                <div className="purchase-success">
                  <div className="confetti">
                    {Array.from({ length: 30 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          left: ((i * 37) % 100) + "%",
                          animationDelay: (i % 7) * 0.1 + "s",
                          background: ["#c9e99e", "#fff", "#e6ae77"][i % 3],
                        }}
                      />
                    ))}
                  </div>
                  <div className="modal-icon">
                    <Check />
                  </div>
                  <h2>A good little find.</h2>
                  <p>
                    Your demo order is confirmed.
                    <br />
                    Thanks for supporting independent makers.
                  </p>
                  <p className="fine">No payment was collected.</p>
                  <button className="primary wide" onClick={() => M(null)}>
                    Keep exploring
                  </button>
                </div>
              ) : (
                <>
                  <div className="eyebrow">
                    <LockKeyhole size={12} /> SECURE DEMO CHECKOUT
                  </div>
                  <h2>Thoughtfully chosen.</h2>
                  <div className="order-product">
                    <img src={modal.product.img} />
                    <div>
                      <small>{modal.product.brand}</small>
                      <h3>{modal.product.name}</h3>
                      <span>Quantity 1</span>
                    </div>
                    <b>${modal.product.price}</b>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      SU(true);
                    }}
                  >
                    <label className="field">
                      Email
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className="field">
                      Delivery address
                      <input
                        required
                        placeholder="Street address, city, postal code"
                      />
                    </label>
                    <div className="breakdown">
                      <p>
                        <span>Price</span>
                        <span>${modal.product.price.toFixed(2)}</span>
                      </p>
                      <p>
                        <span>0% Ad Markups</span>
                        <span>$0.00</span>
                      </p>
                      <small>
                        7% flat platform commission processed automatically
                      </small>
                      <p className="total">
                        <b>Total</b>
                        <b>${modal.product.price.toFixed(2)}</b>
                      </p>
                    </div>
                    <button className="primary wide">
                      Confirm purchase <ArrowUpRight size={17} />
                    </button>
                    <p className="fine">
                      Simulated checkout. No Stripe connection or real charge.
                    </p>
                  </form>
                </>
              ))}
          </section>
        </div>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}
