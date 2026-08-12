import { useEffect, useState } from "react";
import Whiteboard from "./Whiteboard";
import BoardSidebar from "./BoardSidebar";

import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { type Board } from "../types";
import ShareModal from "./SharedModal";

export default function BoardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user, logout } = useAuth();
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  useEffect(() => {
    api.get<Board[]>("/boards").then((res) => {
      setBoards(res.data);
      if (res.data.length > 0) setActiveBoardId(res.data[0].id);
      setLoading(false);
    });
  }, []);

  const createBoard = async (name: string) => {
    const res = await api.post<Board>("/boards", { name });
    setBoards((prev) => [...prev, res.data]);
    setActiveBoardId(res.data.id);
  };

  const deleteBoard = async (id: number) => {
    await api.delete(`/boards/${id}`);
    setBoards((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      if (activeBoardId === id) {
        setActiveBoardId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  if (loading) return <p>Loading your boards...</p>;

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          <img src={"/favicon.svg"} width={25} /> BoardIt
        </h1>
        <div>
          {" "}
          <span>{user?.email}</span>
          {activeBoard && activeBoard.access_level === "owner" && (
            <button onClick={() => setShowShareModal(true)}>Share</button>
          )}
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <div className="layout">
        <BoardSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelect={setActiveBoardId}
          onCreate={createBoard}
          onDelete={deleteBoard}
        />
        <div className="board-area">
          {activeBoard ? (
            <Whiteboard
              key={activeBoardId}
              boardId={activeBoard.id}
              accessLevel={activeBoard.access_level}
            />
          ) : (
            <p>No boards yet — create one to get started.</p>
          )}
        </div>
      </div>

      {showShareModal && activeBoard && (
        <ShareModal
          boardId={activeBoard.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
