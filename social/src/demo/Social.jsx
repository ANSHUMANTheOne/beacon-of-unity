import "./social.css";
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  ArrowLeft,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  X,
} from "lucide-react";
const contacts = [
  "ella.wanders",
  "james.analog",
  "sophie.studio",
  "noah.outside",
  "mia.slowdays",
];
const avatar = (i) =>
  `https://images.unsplash.com/${['photo-1534528741775-53994a69daeb','photo-1500648767791-00dcc994a43e','photo-1524504388940-b1c1722653e1','photo-1506794778202-cad84cf45f1d','photo-1517841905240-472988babdf9'][i % 5]}?auto=format&fit=crop&w=100&q=80`;
const seed = Object.fromEntries(
  contacts.map((n, i) => [
    n,
    [
      {
        text: [
          "Hey! Found a trail for this weekend. No signal, apparently. 🌲",
          "Finally got the film back. Want to see the photos?",
          "Coffee and a little creative catch-up this week?",
          "Sunrise hike on Saturday?",
          "This reminded me of you. A slower kind of Sunday.",
        ][i],
        mine: false,
        time: "10:24",
      },
    ],
  ]),
);
export function useInbox() {
  const [threads, setThreads] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pause-inbox")) || seed;
    } catch {
      return seed;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("pause-inbox", JSON.stringify(threads));
    } catch {}
  }, [threads]);
  const send = (who, text) =>
    setThreads((t) => ({
      ...t,
      [who]: [
        ...(t[who] || []),
        {
          text,
          mine: true,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    }));
  return { threads, send };
}
export function Inbox({ threads, send }) {
  const [selected, select] = useState(null),
    [query, setQuery] = useState(""),
    [draft, setDraft] = useState("");
  const end = useRef();
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [selected, threads]);
  return (
    <>
      <div className="eyebrow">A LITTLE CLOSER</div>
      <h1>
        Messages<span>.</span>
      </h1>
      <p className="muted">Good conversations don't need an audience.</p>
      <div className={`inbox ${selected ? "conversation-open" : ""}`}>
        <section className="inbox-list">
          <div className="between">
            <b>Your people</b>
            <button
              aria-label="New conversation"
              onClick={() => {
                select(null);
                document.getElementById("people-search").focus();
              }}
            >
              <Plus size={19} />
            </button>
          </div>
          <label className="inbox-search">
            <Search size={16} />
            <input
              id="people-search"
              placeholder="Find a friend…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {contacts
            .filter((n) => n.includes(query.toLowerCase()))
            .map((n, i) => (
              <button
                className={`thread ${n === selected ? "chosen" : ""}`}
                key={n}
                onClick={() => {
                  select(n);
                  setDraft("");
                }}
              >
                <img src={avatar(contacts.indexOf(n))} alt="" />
                <span>
                  <b>{n}</b>
                  <small>
                    {threads[n]?.at(-1)?.mine ? "You: " : ""}
                    {threads[n]?.at(-1)?.text}
                  </small>
                </span>
              </button>
            ))}
          {!contacts.some((n) => n.includes(query.toLowerCase())) && (
            <p className="fine">No matching people. Try another name.</p>
          )}
        </section>
        <section className="conversation">
          {selected ? (
            <>
              <div className="conversation-head">
                <button aria-label="Back to inbox" onClick={() => select(null)}>
                  <ArrowLeft size={20} />
                </button>
                <img src={avatar(contacts.indexOf(selected))} alt="" />
                <div>
                  <b>{selected}</b>
                  <small>Demo conversation</small>
                </div>
              </div>
              <div className="message-history">
                <div className="chat-date">TODAY</div>
                {threads[selected]?.map((m, i) => (
                  <div className={`message ${m.mine ? "mine" : ""}`} key={i}>
                    <p>{m.text}</p>
                    <small>
                      {m.time}
                      {m.mine && <Check size={11} />}
                    </small>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form
                className="message-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) {
                    send(selected, draft.trim());
                    setDraft("");
                  }
                }}
              >
                <input
                  aria-label="Message"
                  placeholder="Say something real…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                />
                <button aria-label="Send message" disabled={!draft.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="inbox-empty">
              <Send size={38} />
              <h3>A little hello goes a long way.</h3>
              <p>Choose a friend to start talking.</p>
            </div>
          )}
        </section>
      </div>
      <p className="fine">
        Prototype inbox · messages are saved on this device, not delivered to
        other people.
      </p>
    </>
  );
}
const reels = [
  {
    user: "ella.wanders",
    caption: "A tiny moment in the garden. 🌿",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    likes: 218,
  },
];
function Reel({ reel, index, onShare, suspended }) {
  const video = useRef(),
    card = useRef();
  const [muted, mute] = useState(true),
    [paused, pause] = useState(true),
    [liked, like] = useState(false),
    [saved, save] = useState(false),
    [comments, setComments] = useState(["This is the pause I needed today."]),
    [showComments, show] = useState(false),
    [error, fail] = useState(false);
  useEffect(() => {
    const v = video.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !suspended) {
          v.play()
            .then(() => pause(false))
            .catch(() => pause(true));
        } else {
          v.pause();
          pause(true);
        }
      },
      { threshold: 0.65 },
    );
    observer.observe(card.current);
    const onVisibility = () => {
      if (document.hidden) {
        v.pause();
        pause(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      v.pause();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [suspended]);
  const toggle = () => {
    if (video.current.paused)
      video.current
        .play()
        .then(() => pause(false))
        .catch(() => fail(true));
    else {
      video.current.pause();
      pause(true);
    }
  };
  return (
    <article className="reel" ref={card}>
      <video
        ref={video}
        src={reel.src}
        loop
        playsInline
        muted={muted}
        preload="metadata"
        onError={() => fail(true)}
        onClick={toggle}
        onDoubleClick={() => like(true)}
        aria-label={reel.caption}
      />
      <div className="reel-shade" />
      <div className="reel-top">
        <span>REAL LIFE, IN MOTION</span>
        <button
          aria-label={muted ? "Unmute reel" : "Mute reel"}
          onClick={() => mute(!muted)}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      </div>
      {error ? (
        <div className="reel-error">
          <p>This video couldn't load.</p>
          <button
            onClick={() => {
              fail(false);
              video.current.load();
              video.current.play().catch(() => fail(true));
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <button
          className="reel-play"
          aria-label={paused ? "Play reel" : "Pause reel"}
          onClick={toggle}
        >
          {paused ? <Play size={34} /> : <Pause size={22} />}
        </button>
      )}
      <div className="reel-info">
        <b>@{reel.user}</b>
        <p>{reel.caption}</p>
        <small>Original audio · {reel.user}</small>
      </div>
      <div className="reel-actions">
        <button
          aria-label="Like reel"
          className={liked ? "liked" : ""}
          onClick={() => like(!liked)}
        >
          <Heart fill={liked ? "currentColor" : "none"} />
          <small>{reel.likes + Number(liked)}</small>
        </button>
        <button aria-label="Reel comments" onClick={() => show(true)}>
          <MessageCircle />
          <small>{comments.length}</small>
        </button>
        <button aria-label="Share reel" onClick={() => onShare(reel)}>
          <Send />
          <small>Share</small>
        </button>
        <button aria-label="Save reel" onClick={() => save(!saved)}>
          <Bookmark fill={saved ? "currentColor" : "none"} />
          <small>{saved ? "Saved" : "Save"}</small>
        </button>
      </div>
      {showComments && (
        <div className="reel-comments">
          <div className="between">
            <h3>Little conversations</h3>
            <button aria-label="Close comments" onClick={() => show(false)}>
              <X />
            </button>
          </div>
          <div>
            {comments.map((c, i) => (
              <p key={i}>
                <b>{i ? "You" : "sophie.studio"}</b> {c}
              </p>
            ))}
          </div>
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              const t = e.target.comment.value.trim();
              if (t) {
                setComments([...comments, t]);
                e.target.reset();
              }
            }}
          >
            <input
              name="comment"
              aria-label="Reel comment"
              placeholder="Leave a little kindness…"
              required
              maxLength={500}
            />
            <button>Post</button>
          </form>
        </div>
      )}
    </article>
  );
}
export function Reels({ onShare, suspended }) {
  const [clips, setClips] = useState(reels);
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  return (
    <>
      <div className="eyebrow">SMALL MOMENTS, FULL SCREEN</div>
      <h1>
        Reels<span>.</span>
      </h1>
      <p className="muted">From your people. In their own time.</p>
      <label className="reel-upload">
        + Add your video
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => {
            const f = e.target.files[0];
            if (!f) return;
            const src = URL.createObjectURL(f);
            urls.current.push(src);
            setClips((c) => [
              { user: "alex.morgan", caption: f.name, src, likes: 0 },
              ...c,
            ]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="fine">
        Demo nature clip · your added videos stay in this session.
      </p>
      <div
        className="reels-scroller"
        tabIndex={0}
        aria-label="Reels. Scroll to the next video"
      >
        {clips.map((r, i) => (
          <Reel
            key={r.src}
            reel={r}
            index={i}
            onShare={onShare}
            suspended={suspended}
          />
        ))}
        <div className="reels-end">
          <Check />
          <h3>That's all for now.</h3>
          <p>Take a little of this calm with you.</p>
        </div>
      </div>
    </>
  );
}
