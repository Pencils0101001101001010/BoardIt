import { useEffect, useState } from "react";
import api from "../../api/client";
import type { Collaborator } from "../types";

export default function ShareModal({
  boardId,
  onClose,
}: {
  boardId: number;
  onClose: () => void;
}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState("");

  const loadCollaborators = () => {
    api
      .get<Collaborator[]>(`/boards/${boardId}/collaborators`)
      .then((res) => setCollaborators(res.data));
  };

  useEffect(() => {
    loadCollaborators();
  }, [boardId]);

  const handleShare = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/boards/${boardId}/share`, { email, role });
      setEmail("");
      loadCollaborators();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not share board");
    }
  };

  const handleRemove = async (userId: number) => {
    await api.delete(`/boards/${boardId}/collaborators/${userId}`);
    loadCollaborators();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Share board</h3>
        <form onSubmit={handleShare} className="share-form">
          <input
            type="email"
            placeholder="Collaborator's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
          >
            <option value="editor">Can edit</option>
            <option value="viewer">Can view</option>
          </select>
          <button type="submit">Invite</button>
        </form>
        {error && <p className="error">{error}</p>}

        <ul className="collaborator-list">
          {collaborators.map((c) => (
            <li key={c.id}>
              <span>
                {c.email} — {c.role}
              </span>
              <button onClick={() => handleRemove(c.user_id)}>Remove</button>
            </li>
          ))}
        </ul>

        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
}
