import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Plus } from "lucide-react";
import { api, mediaUrl } from "./api";
import { TOPICS } from "./topics";
export function Interests({ user, execute, onUpdate }) {
  const [selected, setSelected] = useState(user.interests || []),
    [busy, setBusy] = useState(false);
  return (
    <section className="interests-panel">
      <div className="between">
        <div>
          <h3>Make Discover yours.</h3>
          <p>Your picks shape what appears here. Change them anytime.</p>
        </div>
        <small>{busy ? "Saving…" : "YOUR CHOICE"}</small>
      </div>
      <div className="interest-chips">
        {TOPICS.map((t) => (
          <button
            key={t}
            disabled={busy}
            className={selected.includes(t) ? "selected" : ""}
            onClick={async () => {
              const next = selected.includes(t)
                ? selected.filter((x) => x !== t)
                : [...selected, t];
              setBusy(true);
              const d = await execute(() =>
                api("/profile", { method: "PATCH", body: { interests: next } }),
              );
              if (d) {
                setSelected(next);
                onUpdate(d.user);
              }
              setBusy(false);
            }}
          >
            {selected.includes(t) ? <Check size={12} /> : <Plus size={12} />}{" "}
            {t}
          </button>
        ))}
      </div>
      <p className="fine">
        Only interests you choose. No paid placements. Clear all topics to
        explore the broader community.
      </p>
    </section>
  );
}
export function CommunityProfile({ username, execute, notify, onBack }) {
  const [profile, setProfile] = useState(null),
    [posts, setPosts] = useState([]),
    [kind, setKind] = useState("photo"),
    [message, setMessage] = useState(""),
    [comments, setComments] = useState({});
  const load = async () => {
    const r = await execute(() =>
      api("/profiles/" + encodeURIComponent(username)),
    );
    if (r) {
      setProfile(r.profile);
      const feed = await execute(() =>
        api(`/posts?view=profile&owner=${r.profile.id}&kind=${kind}`),
      );
      setPosts(feed?.posts || []);
    }
  };
  useEffect(() => {
    load();
  }, [username, kind]);
  return (
    <>
      <button className="text-button" onClick={onBack}>
        <ArrowLeft size={15} />
        Back to people
      </button>
      {profile ? (
        <>
          <section className="community-profile">
            <span className="profile-initial">
              {profile.display_name.slice(0, 2).toUpperCase()}
            </span>
            <span className="eyebrow">
              {profile.account_type === "organization"
                ? "ORGANIZATION PROFILE"
                : "COMMUNITY PROFILE"}
            </span>
            <h1>{profile.display_name}</h1>
            <p className="muted">
              @{profile.username}
              {profile.private ? " · Private account" : ""}
            </p>
            <p>{profile.bio || "A little space to share what matters."}</p>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit website <ArrowUpRight size={14} />
              </a>
            )}
            <button
              className="primary"
              onClick={() =>
                execute(async () => {
                  const d = await api(`/people/${profile.id}/follow`, {
                    method: "POST",
                  });
                  notify(
                    d.requested
                      ? "Follow request sent."
                      : d.following
                        ? "Following @" + profile.username
                        : "Unfollowed.",
                  );
                  load();
                })
              }
            >
              {profile.following
                ? profile.private && !profile.follow_accepted
                  ? "Requested"
                  : "Following"
                : "Follow"}
            </button>
            {profile.account_type === "organization" && (
              <small>
                Meet the people behind the page. Follow for organic posts and
                conversations; no paid placement.
              </small>
            )}
          </section>
          <div className="feed-tabs">
            {[
              ["photo", "Photos"],
              ["reel", "Reels"],
              ["video", "Videos"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={kind === k ? "selected" : ""}
                onClick={() => setKind(k)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="community-posts">
            {posts.map((p) => (
              <article key={p.id}>
                {p.mime.startsWith("video/") ? (
                  <video
                    src={mediaUrl(p.media_id)}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img src={mediaUrl(p.media_id)} alt={p.caption} />
                )}
                <p>{p.caption}</p>
                <div className="community-post-actions">
                  <button
                    onClick={() =>
                      execute(async () => {
                        await api(`/posts/${p.id}/like`, { method: "POST" });
                        load();
                      })
                    }
                  >
                    {p.liked ? "Liked" : "Like"} · {p.likes}
                  </button>
                  <button
                    onClick={() =>
                      execute(async () => {
                        const d = await api(`/posts/${p.id}/comments`);
                        setComments((c) => ({ ...c, [p.id]: d.comments }));
                      })
                    }
                  >
                    Comments · {p.comments}
                  </button>
                </div>
                {comments[p.id]?.map((c) => (
                  <p className="community-comment" key={c.id}>
                    <b>@{c.username}</b> {c.body}
                  </p>
                ))}
                <form
                  className="comment-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const el = e.currentTarget,
                      body = el.comment.value;
                    execute(async () => {
                      await api(`/posts/${p.id}/comments`, {
                        method: "POST",
                        body: { body },
                      });
                      el.reset();
                      const d = await api(`/posts/${p.id}/comments`);
                      setComments((c) => ({ ...c, [p.id]: d.comments }));
                      load();
                    });
                  }}
                >
                  <input
                    name="comment"
                    aria-label={"Reply to " + profile.username}
                    placeholder="Join the conversation…"
                    required
                    maxLength={1000}
                  />
                  <button>Reply</button>
                </form>
              </article>
            ))}
          </div>
          {!posts.length && (
            <p className="muted">
              {profile.private && !profile.follow_accepted
                ? "Request to follow to see their posts."
                : "No approved posts to show yet."}
            </p>
          )}
        </>
      ) : (
        <p className="muted">Opening profile…</p>
      )}
    </>
  );
}
const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
const moments = [
  [
    "Photography",
    "ella.wanders",
    "photo-1470770841072-f978cf4d019e",
    "Still thinking about this view.",
  ],
  [
    "Food",
    "mia.slowdays",
    "photo-1495474472287-4d71bcdd2085",
    "The first cup hits different.",
  ],
  [
    "Travel",
    "noah.outside",
    "photo-1441974231531-c6227db76b6e",
    "Take the scenic route.",
  ],
  [
    "Books",
    "sophie.studio",
    "photo-1455390582262-044cdead277a",
    "A page a day, a world away.",
  ],
  [
    "Art",
    "james.analog",
    "photo-1470252649378-9c29740c9fa8",
    "Chasing the last bit of light.",
  ],
  [
    "Music",
    "alex.morgan",
    "photo-1511379938547-c1f69419868d",
    "What are you listening to lately?",
  ],
];
export function DemoDiscover() {
  const [topic, setTopic] = useState("For you"),
    [page, setPage] = useState(null),
    [followed, setFollowed] = useState([]),
    [detail, setDetail] = useState(null),
    [comments, setComments] = useState({});
  const orgs = [
    [
      "sunday.coffee",
      "Sunday Coffee",
      "Food",
      "Your neighborhood coffee people. Tell us your most controversial coffee order.",
    ],
    [
      "frame.club",
      "Frame Club",
      "Photography",
      "Photo walks, film experiments, and a community with a different perspective.",
    ],
    [
      "playroom.studio",
      "Playroom Studio",
      "Gaming",
      "Behind the scenes with a tiny game studio. Your feedback is part of the process.",
    ],
  ];
  if (page) {
    const org = orgs.find((o) => o[0] === page);
    return (
      <>
        <button className="text-button" onClick={() => setPage(null)}>
          <ArrowLeft size={15} />
          Back to Discover
        </button>
        <section className="community-profile">
          <span className="profile-initial">
            {org[1].slice(0, 2).toUpperCase()}
          </span>
          <span className="eyebrow">ORGANIZATION · DEMO PAGE</span>
          <h1>{org[1]}</h1>
          <p className="muted">@{org[0]}</p>
          <p>{org[3]}</p>
          <button
            className="primary"
            onClick={() =>
              setFollowed((f) =>
                f.includes(page) ? f.filter((p) => p !== page) : [...f, page],
              )
            }
          >
            {followed.includes(page) ? "Following" : "Follow page"}
          </button>
          <small>
            Organic posts and conversations. No sponsored placements.
          </small>
        </section>
        <article className="demo-page-post">
          <img
            src={image(
              org[2] === "Food"
                ? "photo-1495474472287-4d71bcdd2085"
                : "photo-1455390582262-044cdead277a",
            )}
            alt={org[1] + " community post"}
          />
          <h3>
            {org[2] === "Food"
              ? "Settle a debate for us: iced coffee in winter?"
              : "What should we make together next?"}
          </h3>
          <p>We’re listening. Tell us in the comments.</p>
          {(comments[page] || []).map((c, i) => (
            <p key={i}>
              <b>alex.morgan</b> {c}
            </p>
          ))}
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault();
              const body = e.target.comment.value.trim();
              if (body) {
                setComments({
                  ...comments,
                  [page]: [...(comments[page] || []), body],
                });
                e.target.reset();
              }
            }}
          >
            <input
              name="comment"
              aria-label="Reply to organization"
              placeholder="Join the conversation…"
              required
            />
            <button>Reply</button>
          </form>
        </article>
      </>
    );
  }
  return (
    <>
      <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
      <h1>
        A world of your kind of things<span>.</span>
      </h1>
      <p className="muted">
        People, ideas, and moments. Pick what you’re into.
      </p>
      <div className="interest-chips demo-topic-chips">
        {[
          "For you",
          "Photography",
          "Food",
          "Travel",
          "Books",
          "Art",
          "Music",
        ].map((t) => (
          <button
            className={topic === t ? "selected" : ""}
            key={t}
            onClick={() => {
              setTopic(t);
              setDetail(null);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="discover-mosaic">
        {moments
          .filter((m) => topic === "For you" || m[0] === topic)
          .map((m) => (
            <button
              key={m[1]}
              onClick={() => setDetail(detail === m[1] ? null : m[1])}
            >
              <img src={image(m[2])} alt={m[3]} />
              <span>
                <small>{m[0]}</small>
                <b>@{m[1]}</b>
              </span>
              {detail === m[1] && <p>{m[3]}</p>}
            </button>
          ))}
      </div>
      <section className="organization-discovery">
        <div>
          <span className="eyebrow">COMMUNITIES WITH A PERSONALITY</span>
          <h3>People behind the pages.</h3>
          <p>Meet the teams, join a conversation, follow if it’s your thing.</p>
        </div>
        {orgs.map((o) => (
          <button key={o[0]} onClick={() => setPage(o[0])}>
            <span className="profile-initial small">
              {o[1].slice(0, 2).toUpperCase()}
            </span>
            <span>
              <b>{o[1]}</b>
              <small>Organization · {o[2]}</small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </section>
    </>
  );
}
