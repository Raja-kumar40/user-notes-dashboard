import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import MessageCard from "../components/MessageCard";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/messages");

      if (!response.data?.success) {
        throw new Error("Could not load your notes.");
      }

      setMessages(
        Array.isArray(response.data.messages)
          ? response.data.messages
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load your notes. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    const text = message.trim();

    if (!text) {
      setError("Please enter a note before saving.");
      return;
    }

    if (text.length > 500) {
      setError("Your note cannot exceed 500 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId !== null) {
        await api.put(`/messages/${editingId}`, {
          message: text,
        });
      } else {
        await api.post("/messages", {
          message: text,
        });
      }

      setMessage("");
      setEditingId(null);

      await loadMessages();

      setSuccess(
        editingId !== null
          ? "Note updated successfully."
          : "Note added successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save your note. Please check your login and server."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setMessage(item.message);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMessage("");
    setError("");
    setSuccess("");
  }

  async function handleDelete(id) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/messages/${id}`);

      setMessages((current) =>
        current.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setMessage("");
      }

      setSuccess("Note deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete your note. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <section className="dashboard-heading">
          <div>
            <p className="eyebrow">YOUR PERSONAL SPACE</p>
            <h1>Your Notes</h1>
            <p className="muted">
              Capture ideas, reminders and thoughts in one place.
            </p>
          </div>

          <div className="notes-count">
            <span>{messages.length}</span>
            <small>
              {messages.length === 1 ? "Note" : "Notes"}
            </small>
          </div>
        </section>

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-success" role="status">
            {success}
          </div>
        )}

        <section className="composer-card">
          <h2>
            {editingId !== null
              ? "Edit your note"
              : "Write a new note"}
          </h2>

          <p className="muted">
            Your notes are saved to your account.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="What's on your mind?"
              maxLength={500}
              rows={5}
              required
              disabled={saving}
            />

            <div className="composer-footer">
              <span className="character-count">
                {message.length}/500
              </span>

              <div className="message-actions">
                {editingId !== null && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !message.trim()}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "+ Add Note"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="notes-section">
          <div className="section-heading">
            <h2>All Notes</h2>
            <span>{messages.length} total</span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading your notes...
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✎</div>
              <h3>No notes yet</h3>
              <p>Your first note can start right above.</p>
            </div>
          ) : (
            <div className="notes-grid">
              {messages.map((item) => (
                <MessageCard
                  key={item.id}
                  item={item}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  deleting={deletingId === item.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}