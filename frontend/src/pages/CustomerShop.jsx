import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import { MOCK_PRODUCTS } from "../mock/products.js";

// --- PurchaseModal component ---
function PurchaseModal({ product, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    setLoading(true);
    setError("");
    // Simulate network/digital delivery.
    setTimeout(() => {
      setResult({
        value_type: product.value_type,
        value:
          product.value_type === "IMAGE"
            ? product.image_url
            : "ABCD-1234-COUPON",
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <Modal
      title={result ? "🎉 Purchase Successful!" : `Buy: ${product.name}`}
      onClose={onClose}
    >
      {!result ? (
        <>
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: "100%",
              height: "140px",
              objectFit: "contain",
              marginBottom: "16px",
              background: "var(--green-50)",
              borderRadius: "8px",
              padding: "12px",
            }}
          />
          <p
            style={{
              color: "var(--gray-600)",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            {product.description || "Redeemable digital coupon"}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              background: "var(--green-50)",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "var(--gray-700)", fontWeight: "500" }}>
              Price
            </span>
            <span className="price-tag">
              ${product.price?.toFixed(2)}
            </span>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <button
            className="btn btn-primary btn-full"
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                &nbsp;Processing...
              </>
            ) : (
              `Purchase for $${product.price?.toFixed(2)}`
            )}
          </button>
        </>
      ) : (
        <>
          <p
            style={{
              color: "var(--gray-600)",
              marginBottom: "4px",
              fontSize: "0.875rem",
            }}
          >
            Your coupon code is ready to use:
          </p>
          <div className="coupon-reveal">
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--gray-600)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {result.value_type === "IMAGE" ? "Coupon Image" : "Coupon Code"}
            </div>
            {result.value_type === "IMAGE" ? (
              <img
                src={result.value}
                alt="coupon"
                style={{ maxWidth: "100%", marginTop: "8px" }}
              />
            ) : (
              <div className="value">{result.value}</div>
            )}
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--gray-400)",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Save this code — it will not be shown again.
          </p>
          <button
            className="btn btn-outline btn-full"
            style={{ marginTop: "16px" }}
            onClick={onClose}
          >
            Close
          </button>
        </>
      )}
    </Modal>
  );
}

// --- CustomerShop main page ---
export default function CustomerShop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Use all unsold coupons from the mock database.
    setProducts(MOCK_PRODUCTS.filter((p) => !p.is_sold));
    setLoading(false);
  }, []);

  // Remove the sold product from the local list after purchase.
  const handlePurchaseClose = () => {
    setSelected(null);
    setProducts((prevProds) =>
      prevProds.filter((p) => p.id !== selected?.id)
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="icon">⏳</div>
          Loading coupons...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">🎟 Available Coupons</h1>
      {error && <Alert type="error">{error}</Alert>}

      {products.length === 0 && !error ? (
        <div className="empty-state">
          <div className="icon">🏷️</div>
          <p>No coupons available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onBuy={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      {selected && (
        <PurchaseModal
          product={selected}
          onClose={handlePurchaseClose}
        />
      )}
    </div>
  );
}
