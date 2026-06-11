import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./style.scss";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import ExportPopup from "./popupExport";
import { EditorView, lineNumbers } from "@codemirror/view";
import axios from "axios";
import { useCart } from "../../contexts/CartContext";

const API_URL = "http://localhost:3000";

interface IAccount {
  _id: string;
  userName: string;
  avatar: string;
}

interface IComment {
  _id: string;
  content: string;
  createdAt: string;
  accountId: string | IAccount;
  componentId: string;
  parentId?: string | null;
  account?: IAccount;
  replies?: IComment[];
}

interface IElement {
  _id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  reactCode?: string;
  litCode?: string;
  svelteCode?: string;
  vueCode?: string;
  createdAt: string;
  accountId: string | IAccount;
  account?: IAccount;
  // ── Commerce ──
  price?: number;
}

const ElementDetail = () => {
  const { id } = useParams();
  const [element, setElement] = useState<IElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [exportCode, setExportCode] = useState("");
  const [selectedExport, setSelectedExport] = useState("react");

  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [favouritesCount, setFavouritesCount] = useState<number>(0);
  const [viewsCount, setViewsCount] = useState<number>(0);

  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);

  // ── Commerce state ───────────────────────────────────────────────
  const [owned, setOwned] = useState(false);
  const [inCart, setInCart] = useState(false);
  const { cartItems, addToCart, removeFromCart } = useCart();

  const token = localStorage.getItem("authToken");

  // Sync inCart with CartContext
  useEffect(() => {
    if (id) setInCart(cartItems.some((item) => item._id === id));
  }, [cartItems, id]);

  // Check ownership: creator OR purchased
  const checkOwnership = async (el: IElement) => {
    // Creator always owns their component
    if (el.account?._id && currentUser?._id && el.account._id === currentUser._id) {
      setOwned(true);
      return;
    }
    if (!token || !id) { setOwned(false); return; }
    try {
      const res = await fetch(`${API_URL}/shop/purchases/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOwned(data.owned || false);
    } catch {
      setOwned(false);
    }
  };

  // Re-check after checkout (purchases-updated event)
  useEffect(() => {
    const handler = () => {
      if (element) checkOwnership(element);
    };
    window.addEventListener("purchases-updated", handler);
    return () => window.removeEventListener("purchases-updated", handler);
  }, [element, currentUser]);

  const handleCartToggle = async () => {
    if (!id || !token) { alert("Đăng nhập để mua"); return; }
    try {
      if (inCart) {
        await removeFromCart(id);
      } else {
        await addToCart(id);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    }
  };
  // ────────────────────────────────────────────────────────────────

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({
          _id: res.data._id,
          userName: res.data.userName,
          avatar: res.data.avatar,
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, [token]);

  // Fetch element data
  useEffect(() => {
    if (!id) return;
    const fetchElementData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/components/${id}/with-stats`);

        const elementData: IElement = {
          ...res.data,
          htmlCode: res.data.htmlCode || "",
          cssCode: res.data.cssCode || "",
          account:
            res.data.accountId && typeof res.data.accountId === "object"
              ? {
                  _id: res.data.accountId._id,
                  userName: res.data.accountId.userName,
                  avatar: res.data.accountId.avatar,
                }
              : undefined,
        };

        setElement(elementData);
        setViewsCount(res.data.viewsCount || 0);
        setFavouritesCount(res.data.favouritesCount || 0);

        // Record view
        try {
          await axios.post(
            `${API_URL}/views/${id}`,
            {},
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
        } catch {
          // not critical
        }

        // Check favourite status
        if (token) {
          try {
            const favRes = await axios.get(`${API_URL}/favourites/check/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setIsFavourite(favRes.data.isFavourite);
          } catch (err) {
            console.error("Error checking favourite:", err);
          }
        }
      } catch (err) {
        console.error("Error loading component:", err);
        setError("Unable to load component data.");
      } finally {
        setLoading(false);
      }
    };
    fetchElementData();
  }, [id, token]);

  // Check ownership once element + currentUser are both available
  useEffect(() => {
    if (element) checkOwnership(element);
  }, [element, currentUser]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      try {
        const res = await axios.get<IComment[]>(
          `${API_URL}/comments?componentId=${id}`
        );
        const mapped = res.data.map((comment: IComment) => ({
          ...comment,
          account:
            comment.accountId && typeof comment.accountId === "object"
              ? {
                  _id: comment.accountId._id,
                  userName: comment.accountId.userName,
                  avatar: comment.accountId.avatar,
                }
              : undefined,
        }));
        setComments(organizeComments(mapped));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [id]);

  const organizeComments = (commentsData: IComment[]): IComment[] => {
    const commentMap = new Map<string, IComment>();
    const rootComments: IComment[] = [];
    commentsData.forEach((c) => commentMap.set(c._id, { ...c, replies: [] }));
    commentsData.forEach((c) => {
      const node = commentMap.get(c._id)!;
      if (c.parentId) {
        commentMap.get(c.parentId)?.replies!.push(node);
      } else {
        rootComments.push(node);
      }
    });
    return rootComments;
  };

  const handleToggleFavourite = async () => {
    if (!id || !token) { alert("Đăng nhập để lưu"); return; }
    try {
      const res = await axios.post(
        `${API_URL}/favourites/toggle`,
        { componentId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavourite(res.data.isFavourite);
      try {
        const countRes = await axios.get(`${API_URL}/favourites/count/${id}`);
        setFavouritesCount(countRes.data.count || 0);
      } catch { /* not critical */ }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to toggle favourite");
      }
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) { alert("Làm ơn hãy viết 1 bình luận"); return; }
    if (!token || !id) { alert("Làm ơn hãy đăng nhập để bình luận"); return; }
    try {
      const res = await axios.post(
        `${API_URL}/comments`,
        { content: newComment, componentId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCommentData: IComment = {
        ...res.data,
        account:
          res.data.accountId && typeof res.data.accountId === "object"
            ? { _id: res.data.accountId._id, userName: res.data.accountId.userName, avatar: res.data.accountId.avatar }
            : currentUser || undefined,
        replies: [],
      };
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) { alert("Làm ơn hay nhập 1 bình luận"); return; }
    if (!token || !id) { alert("Làm ơn hãy đăng nhập để bình luận"); return; }
    try {
      await axios.post(
        `${API_URL}/comments`,
        { content: replyContent, componentId: id, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const commentsRes = await axios.get<IComment[]>(`${API_URL}/comments?componentId=${id}`);
      const mapped = commentsRes.data.map((c: IComment) => ({
        ...c,
        account: c.accountId && typeof c.accountId === "object"
          ? { _id: c.accountId._id, userName: c.accountId.userName, avatar: c.accountId.avatar }
          : undefined,
      }));
      setComments(organizeComments(mapped));
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || "Failed to post reply");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: IComment, isReply = false) => (
    <div key={comment._id} className={`comment ${isReply ? "comment--reply" : ""}`}>
      <img
        src={comment.account?.avatar || `https://ui-avatars.com/api/?name=${comment.account?.userName || "User"}`}
        alt="avatar"
        className="comment__avatar"
      />
      <div className="comment__content">
        <div className="comment__header">
          <span className="comment__author">{comment.account?.userName || "Anonymous"}</span>
          <span className="comment__date">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment__text">{comment.content}</p>
        {!isReply && token && (
          <button className="comment__reply-btn" onClick={() => setReplyingTo(comment._id)}>
            Phản hồi
          </button>
        )}
        {replyingTo === comment._id && (
          <div className="comment__reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết lời đáp..."
              className="comment__textarea"
            />
            <div className="comment__reply-actions">
              <button onClick={() => handlePostReply(comment._id)} className="btn-primary">
                Gửi phản hồi
              </button>
              <button onClick={() => setReplyingTo(null)} className="btn-secondary">
                Hủy bỏ
              </button>
            </div>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment__replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="detail-status">Loading component...</div>;
  if (error) return <div className="detail-status error">{error}</div>;
  if (!element) return <div className="detail-status">Component not found.</div>;

  const price = element.price ?? 4.99;

  return (
    <div className="detail">
      {/* Header */}
      <header className="detail-header">
        <Link to="/elements" className="back-btn">← Quay lại</Link>
        <div className="stats">
          <div className="info">
            <span className="title">{element.title} <span className="by">by</span></span>
            <div className="author">
              <img
                src={element.account?.avatar || `https://ui-avatars.com/api/?name=${element.account?.userName || "User"}`}
                alt="author"
                className="avatar"
              />
              <span>{element.account?.userName || "Anonymous"}</span>
            </div>
          </div>
          <div className="stat">👁️ <span>{viewsCount} lượt xem</span></div>
          <div className="stat" onClick={handleToggleFavourite}>
            <span style={{ color: isFavourite ? "#FFD700" : "#aaa", cursor: "pointer" }}>
              {isFavourite ? "★" : "☆"}
            </span>{" "}
            <span>{favouritesCount}</span>
          </div>
        </div>
      </header>

      <div className="detail__row">
        {/* Preview — always visible */}
        <div className="detail__preview">
          <iframe
            title={element.title}
            className="preview-iframe"
            srcDoc={`<style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;overflow:hidden;}${element.cssCode}</style>${element.htmlCode}`}
          />
        </div>

        {/* Code viewer */}
        <div className="detail__code-viewer">
          <div className="tabs">
            <div className="tabs__header">
              <button
                className={`tabs__button ${activeTab === "html" ? "tabs__button--active" : ""}`}
                onClick={() => setActiveTab("html")}
              >
                HTML
              </button>
              <button
                className={`tabs__button ${activeTab === "css" ? "tabs__button--active" : ""}`}
                onClick={() => setActiveTab("css")}
              >
                CSS
              </button>
            </div>

            {/* ── Blur wrapper ───────────────────────────────────── */}
            <div className="tabs__content-wrap">
              <div className={!owned ? "code-blurred" : ""}>
                <div className="tabs__content">
                  {activeTab === "html" && (
                    <CodeMirror
                      value={element.htmlCode}
                      theme={vscodeDark}
                      height="600px"
                      extensions={[html(), lineNumbers(), EditorView.lineWrapping]}
                      editable={false}
                      basicSetup={false}
                    />
                  )}
                  {activeTab === "css" && (
                    <CodeMirror
                      value={element.cssCode}
                      height="600px"
                      theme={vscodeDark}
                      extensions={[css(), lineNumbers(), EditorView.lineWrapping]}
                      editable={false}
                      basicSetup={false}
                    />
                  )}
                </div>
              </div>

              {/* Overlay CTA shown when not owned */}
              {!owned && (
                <div className="blur-overlay">
                  <div className="blur-cta">
                    <span className="crown-big">👑</span>
                    <h3>Mua để xem code</h3>
                    <p className="cta-price">${price.toFixed(2)}</p>

                    {!token ? (
                      <p className="login-cta">
                        <Link to="/login">Đăng nhập</Link> để mua component này
                      </p>
                    ) : inCart ? (
                      <button className="in-cart-btn" onClick={handleCartToggle}>
                        ✓ Trong giỏ hàng
                      </button>
                    ) : (
                      <button className="add-cart-btn" onClick={handleCartToggle}>
                        🛒 Thêm vào giỏ
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* ─────────────────────────────────────────────────── */}
          </div>
        </div>
      </div>

      {/* Action Bar — Export gated behind ownership */}
      <div className="detail__actions">
        <button className="action-btn" onClick={handleToggleFavourite}>
          <span style={{ color: isFavourite ? "#FFD700" : "#888" }}>
            {isFavourite ? "★" : "☆"}
          </span>
          Lưu vào yêu thích
        </button>

        {owned && (
          <div className="export-group">
            <button
              className="action-btn"
              onClick={() => {
                const codeMap: Record<string, string> = {
                  react: element.reactCode || "No React code available.",
                  vue: element.vueCode || "No Vue code available.",
                  svelte: element.svelteCode || "No Svelte code available.",
                  lit: element.litCode || "No Lit code available.",
                };
                setExportCode(codeMap[selectedExport] || "");
                setShowExportPopup(true);
              }}
            >
              ⚙️ Xuất
            </button>
            <select
              className="export-select"
              value={selectedExport}
              onChange={(e) => setSelectedExport(e.target.value)}
            >
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
              <option value="lit">Lit</option>
            </select>
          </div>
        )}

        <ExportPopup
          visible={showExportPopup}
          language={selectedExport}
          code={exportCode}
          onClose={() => setShowExportPopup(false)}
        />
      </div>

      {/* Comments + Sidebar */}
      <div className="detail__bottom">
        <div className="detail__comments">
          <h2>Comments ({comments.length})</h2>
          {token ? (
            <div className="comment-form">
              <img
                src={currentUser?.avatar || "https://ui-avatars.com/api/?name=User"}
                alt="your avatar"
                className="comment-form__avatar"
              />
              <div className="comment-form__input-area">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="comment-form__textarea"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="comment-form__submit"
                >
                  Đăng bình luận
                </button>
              </div>
            </div>
          ) : (
            <div className="comment-login-prompt">
              <p>Đăng nhập để bình luận</p>
            </div>
          )}
          <div className="comments-list">
            {comments.map((comment) => renderComment(comment))}
            {comments.length === 0 && (
              <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>
        </div>

        <aside className="detail__sidebar">
          <h3 className="sidebar-title">{element.title}</h3>
          <div className="sidebar-meta">
            <div className="sidebar-date">
              📅{" "}
              {new Date(element.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <button className="sidebar-report">⚠️ Báo cáo</button>
          </div>
          <div className="sidebar-author">
            <img
              src={element.account?.avatar || `https://ui-avatars.com/api/?name=${element.account?.userName || "User"}`}
              alt="author"
              className="sidebar-avatar"
            />
            <div className="sidebar-author-info">
              <strong>{element.account?.userName || "Anonymous"}</strong>
              <span>{element.account?.userName || "User"}</span>
            </div>
          </div>
          <div className="sidebar-variations">
            <p>Chưa có bản con, hãy tạo mới!</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ElementDetail;
