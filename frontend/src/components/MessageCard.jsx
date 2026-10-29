export default function MessageCard({ item, onEdit, onDelete }) {
  const date = item.created_at
    ? new Date(item.created_at).toLocaleString()
    : "Just now";

  return (
    <article className="message-card">
      <p className="message-text">{item.message}</p>

      <div className="message-footer">
        <span className="message-date">{date}</span>

        <div className="message-actions">
          <button
            className="btn btn-outline btn-small"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-small"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}