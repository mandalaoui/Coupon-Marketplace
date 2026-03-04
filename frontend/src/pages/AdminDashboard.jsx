import { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import { MOCK_PRODUCTS } from "../mock/products.js"; // Using mock data instead of adminApi

const EMPTY_FORM = {
  name: "", description: "", image_url: "",
  cost_price: "", margin_percentage: "",
  value_type: "STRING", value: "",
};

function CouponFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name,
    description: initial.description || "",
    image_url: initial.image_url,
    cost_price: initial.cost_price,
    margin_percentage: initial.margin_percentage,
    value_type: initial.value_type,
    value: "",  // never pre-fill value for security
  } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const minSell = () => {
    const cp = parseFloat(form.cost_price);
    const mp = parseFloat(form.margin_percentage);
    if (isNaN(cp) || isNaN(mp)) return null;
    return (cp * (1 + mp / 100)).toFixed(2);
  };

  const handleSave = async () => {
    setError(""); setLoading(true);
    try {
      // simulate save/update (mock)
      // This would be handled externally via parent with local state
      setTimeout(() => {
        onSaved({
          ...form,
          cost_price: parseFloat(form.cost_price),
          margin_percentage: parseFloat(form.margin_percentage),
          minimum_sell_price: minSell(),
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Save failed");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initial ? "Edit Coupon" : "Create Coupon"}
      onClose={onClose}
      maxWidth={520}
    >
      {error && <Alert type="error">{error}</Alert>}

      <div className="form-group">
        <label>Name *</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Amazon $10 Gift Card" />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Short description..." />
      </div>
      <div className="form-group">
        <label>Image URL *</label>
        <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://example.com/image.png" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Cost Price ($) *</label>
          <input type="number" min="0" step="0.01" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} placeholder="8.00" />
        </div>
        <div className="form-group">
          <label>Margin (%) *</label>
          <input type="number" min="0" step="0.01" value={form.margin_percentage} onChange={(e) => set("margin_percentage", e.target.value)} placeholder="25" />
        </div>
      </div>

      {minSell() && (
        <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: "7px", padding: "10px 14px", marginBottom: "18px", fontSize: "0.875rem" }}>
          <strong>Minimum Sell Price (derived):</strong> <span style={{ color: "var(--green-700)", fontWeight: "700" }}>${minSell()}</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Value Type *</label>
          <select value={form.value_type} onChange={(e) => set("value_type", e.target.value)}>
            <option value="STRING">String (Code)</option>
            <option value="IMAGE">Image URL</option>
          </select>
        </div>
        <div className="form-group">
          <label>Coupon Value {initial ? "(leave blank to keep)" : "*"}</label>
          <input value={form.value} onChange={(e) => set("value", e.target.value)} placeholder={form.value_type === "IMAGE" ? "https://..." : "XXXX-YYYY-ZZZZ"} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <><span className="spinner" />&nbsp;Saving...</> : (initial ? "Update" : "Create")}
        </button>
      </div>
    </Modal>
  );
}

function ConfirmModal({ message, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <Modal
      title="Confirm"
      onClose={onClose}
      maxWidth={360}
    >
      <p style={{ marginBottom: "20px", color: "var(--gray-700)" }}>{message}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={loading} onClick={async () => { setLoading(true); await onConfirm(); }}>
          {loading ? <span className="spinner" /> : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

export default function AdminDashboard() {
  // Use mock data instead of server API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [filter, setFilter] = useState("all");

  // Simulate a "load" from mock data (and deduplicate by id for demo)
  const load = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      // Remove duplicates by keeping last instance per id
      const idMap = new Map();
      for (const p of MOCK_PRODUCTS) idMap.set(p.id, p);
      setProducts(Array.from(idMap.values()));
      setLoading(false);
    }, 350);
  };

  useEffect(load, []);

  // Mock handleDelete: just remove from local state
  const handleDelete = async () => {
    if (!deleteItem) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteItem.id));
    setDeleteItem(null);
  };

  // Filtering
  const visible = products.filter((p) => {
    if (filter === "unsold") return !p.is_sold;
    if (filter === "sold") return p.is_sold;
    return true;
  });

  // Handle create/update for mock scenario
  const handleSaved = (item) => {
    setShowForm(false);
    setEditItem(null);
    if (!item) return;
    setProducts((prev) => {
      if (editItem) {
        // Update
        return prev.map((p) => (p.id === editItem.id ? { ...p, ...item } : p));
      } else {
        // New: simulate ID
        const newId = (Math.random() + 1).toString(36).substring(7).padEnd(24, "0");
        return [
          ...prev,
          {
            ...item,
            id: newId,
            is_sold: false,
            minimum_sell_price: item.minimum_sell_price ?? ((item.cost_price * (1 + item.margin_percentage / 100)).toFixed(2)),
          },
        ];
      }
    });
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          + Create Coupon
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all", "unsold", "sold"].map((f) => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: "auto", color: "var(--gray-400)", fontSize: "0.85rem", alignSelf: "center" }}>
          {visible.length} product{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="empty-state"><div className="icon">⏳</div>Loading...</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Margin</th>
                <th>Min Sell Price</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img src={p.image_url} alt="" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "var(--green-50)", padding: "2px" }} onError={(e) => e.target.style.display = "none"} />
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>{p.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{p.id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td>${parseFloat(p.cost_price).toFixed(2)}</td>
                  <td>{parseFloat(p.margin_percentage).toFixed(1)}%</td>
                  <td style={{ color: "var(--green-700)", fontWeight: "700" }}>${parseFloat(p.minimum_sell_price).toFixed(2)}</td>
                  <td><span className="badge badge-gray">{p.value_type}</span></td>
                  <td>
                    {p.is_sold
                      ? <span className="badge badge-red">Sold</span>
                      : <span className="badge badge-green">Available</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditItem(p); setShowForm(true); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteItem(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CouponFormModal
          initial={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Are you sure you want to delete "${deleteItem.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}
