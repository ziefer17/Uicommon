import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ElementPreview from "../../components/ElementPreview";
import "./style.scss";
import { FiBookmark } from "react-icons/fi";

const API_BASE = "http://localhost:3000";

type TabKey = "weekly" | "creators" | "favorites" | "views";

export interface SpotlightItem {
  _id: string;
  htmlCode?: string;
  cssCode?: string;
  component?: {
    htmlCode: string;
    cssCode: string;
    accountId?: { username: string };
  };
  username?: string;
  weeklyViews?: number;
  viewsCount?: number;
  viewCount?: number;
  weeklyFavourites?: number;
  favouritesCount?: number;
  favCount?: number;
}

export interface CreatorItem {
  userId: string;
  username: string;
  avatar: string;
  postsCount?: number;
  totalPoints?: number;
  totalViews?: number;
  totalFavorites?: number;
}

type SpotlightResponse = SpotlightItem[] | CreatorItem[];

const Spotlight = () => {
  const [tab, setTab] = useState<TabKey>("weekly");
  const [items, setItems] = useState<SpotlightResponse>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const apiMap = useMemo(
    () => ({
      weekly: "leaderboard/weekly",
      creators: "leaderboard/creators",
      favorites: "leaderboard/top-users-fav",
      views: "leaderboard/top-users-views",
    }),
    []
  );

  const tabTitles: Record<TabKey, string> = {
    weekly: "Những bài đăng được trân trọng nhất tuần này",
    creators: "Tác giả cống hiến nhiều nhất",
    favorites: "Tác giả với thành phần có nhiều lượt yêu thích nhất",
    views: "Tác giả với thành phần có nhiều lượt xem nhất",
  };

  const isCreatorTab =
    tab === "creators" || tab === "favorites" || tab === "views";

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/${apiMap[tab]}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab, apiMap]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toLocaleString();
  };

  const getCreatorScoreAndUnit = (u: CreatorItem) => {
    if (tab === "creators")
      return { score: u.totalPoints ?? 0, unit: "Point", isFav: false };
    if (tab === "views")
      return { score: u.totalViews ?? 0, unit: "views", isFav: false };
    if (tab === "favorites")
      return { score: u.totalFavorites ?? 0, unit: "K", isFav: true };
    return { score: 0, unit: "pts", isFav: false };
  };

  const renderSkeletons = () => {
    const count = tab === "weekly" ? 3 : 16;
    return (
      <div
        className={`spotlight__grid ${
          tab === "weekly" ? "spotlight__grid--weekly" : ""
        }`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={`skeleton-${i}`} className="spotlight__skeleton"></div>
        ))}
      </div>
    );
  };

  const renderWeekly = () => {
    const weeklyItems = items as SpotlightItem[];

    return (
      <>
        <p className="spotlight__subtitle">{tabTitles[tab]}</p>
        <div className="spotlight__grid spotlight__grid--weekly">
          {weeklyItems.map((el) => {
            const html = el.component?.htmlCode ?? el.htmlCode ?? "";
            const css = el.component?.cssCode ?? el.cssCode ?? "";
            const author =
              el.component?.accountId?.username ?? el.username ?? "Unknown";
            const views = el.weeklyViews ?? el.viewsCount ?? el.viewCount ?? 0;
            const favs =
              el.weeklyFavourites ?? el.favouritesCount ?? el.favCount ?? 0;

            return (
              <div key={`weekly-${el._id}`} className="spotlight__card-wrapper">
                <Link to={`/element/${el._id}`} className="spotlight__card">
                  <ElementPreview htmlCode={html} cssCode={css} />
                </Link>

                <div className="spotlight__meta">
                  <strong>{author}</strong>
                  <div className="spotlight__stats">
                    <span>{formatNumber(views)} lượt xem</span>
                    <span>
                      <FiBookmark /> {formatNumber(favs)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderCreators = () => {
    const creators = items as CreatorItem[];

    return (
      <>
        <p className="spotlight__subtitle">{tabTitles[tab]}</p>
        <div className="spotlight__grid spotlight__grid--creators">
          {creators.map((u, index) => {
            const { score, unit, isFav } = getCreatorScoreAndUnit(u);
            const scoreDisplay =
              tab === "views"
                ? formatNumber(score) + " " + unit
                : formatNumber(score);
            const postCount = u.postsCount ?? 0;

            return (
              <div
                key={`creator-${u.userId}-${index}`}
                className="spotlight__card-wrapper spotlight__card-wrapper--creator"
              >
                <Link
                  to={`/user/${u.username}`}
                  className="spotlight__creator-card"
                >
                  <img
                    src={u.avatar}
                    className="spotlight__creator-avatar"
                    alt={`${u.username} avatar`}
                  />

                  <div className="spotlight__creator-info">
                    <strong>{u.username}</strong>

                    <div className="spotlight__creator-stats-row">
                      <p className="spotlight__creator-posts">
                        {postCount} posts
                      </p>
                      <p className="spotlight__creator-score">
                        {isFav && " "}
                        {scoreDisplay}
                        {tab !== "views" && ` Favorite`}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="spotlight__show-top">
          <button className="spotlight__show-top-button">Top 50</button>
        </div>
      </>
    );
  };

  let content = null;
  if (loading) content = renderSkeletons();
  else if (tab === "weekly") content = renderWeekly();
  else if (isCreatorTab) content = renderCreators();

  return (
    <div className="spotlight">
      <h1 className="spotlight__title">Nổi Bật</h1>
      <p className="spotlight__subtitle-main">
      Tán dương những tác giả và thành phần xuất xắc nhất của cộng đồng.
      </p>

      <div className="spotlight__tabs">
        {(
          [
            ["weekly", "Những Nổi Bật Hàng Tuần"],
            ["creators", "Top Tác Giả"],
            ["favorites", "Được Yêu Thích Nhất"],
            ["views", "Có Nhiều Lượt Xem Nhất"],
          ] as [TabKey, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            className={`spotlight__tab ${
              tab === key ? "spotlight__tab--active" : ""
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {content}
    </div>
  );
};

export default Spotlight;
