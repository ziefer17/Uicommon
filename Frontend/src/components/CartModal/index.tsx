import { useState } from "react";
import { useCart } from "../../contexts/CartContext";

interface CartModalProps {
  onClose: () => void;
}

const CartModal = ({ onClose }: CartModalProps) => {
  const { cartItems, removeFromCart, checkout } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    count: number;
    total: number;
    transactionIds: string[];
  } | null>(null);

  const total = cartItems.reduce((sum, item) => sum + (item.price || 4.99), 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const result = await checkout();
      setSuccess(result);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>

        {success ? (
          /* ── Success screen ── */
          <div className="cart-success">
            <span>✅</span>
            <h3>Thanh Toán Thành Công!</h3>
            <p>Đã mua {success.count} component</p>
            <p className="cart-success-total">
              Tổng: ${success.total.toFixed(2)}
            </p>
            <div className="cart-success-txns">
              {success.transactionIds.map((tid) => (
                <code key={tid}>{tid}</code>
              ))}
            </div>
            <button onClick={onClose}>Đóng</button>
          </div>
        ) : (
          /* ── Normal cart ── */
          <>
            <div className="cart-header">
              <h3>🛒 Giỏ Hàng ({cartItems.length})</h3>
              <button className="cart-close" onClick={onClose}>✕</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="cart-empty">Giỏ hàng trống</div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div className="cart-item-info">
                        <span className="cart-item-name">
                          {item.title || item.category}
                        </span>
                        <span className="cart-item-price">
                          ${(item.price || 4.99).toFixed(2)}
                        </span>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item._id)}
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    Tổng: <strong>${total.toFixed(2)}</strong>
                  </div>
                  <button
                    className="cart-checkout-btn"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Thanh Toán (Demo)"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default CartModal;
