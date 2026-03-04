export default function Modal({ title, children, onClose, maxWidth = 640 }) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth }}>
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    );
  }