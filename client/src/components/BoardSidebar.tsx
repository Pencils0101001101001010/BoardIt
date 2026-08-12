import { useState, type SubmitEvent } from "react";
import type { Board } from "../types";

interface Props {
  boards: Board[];
  activeBoardId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
}

export default function BoardSidebar({
  boards,
  activeBoardId,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const [newName, setNewName] = useState("");

  const handleCreate = (e: SubmitEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName("");
  };

  return (
    <aside className="sidebar">
      <h3>My Boards</h3>
      <ul>
        {boards.map((board) => (
          <li
            key={board.id}
            className={board.id === activeBoardId ? "active" : ""}
          >
            <button className="board-name" onClick={() => onSelect(board.id)}>
              {board.name}
            </button>
            <button
              className="board-delete"
              onClick={() => {
                if (
                  confirm(
                    `Delete "${board.name}"? This deletes all its items too.`,
                  )
                ) {
                  onDelete(board.id);
                }
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="new-board-form">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New board name..."
        />
        <button type="submit">+ Add board</button>
      </form>
    </aside>
  );
}
