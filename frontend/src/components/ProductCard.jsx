export default function ProductCard({ product, onBuy }) {
    return (
      <div className="product-card">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => { e.target.src = "https://placehold.co/640x360?text=Coupon"; }}
        />
        <div className="product-card-body">
          <h3>{product.name}</h3>
          <p>{product.description || "Redeemable digital coupon"}</p>
  
          <div className="product-card-footer">
            <div className="price-tag">${product.price?.toFixed(2)}</div>
            <button className="btn btn-primary btn-sm" onClick={onBuy}>Buy</button>
          </div>
        </div>
      </div>
    );
  }