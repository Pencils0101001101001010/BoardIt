import { useEffect, useState, useCallback } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import api from "../../api/client";
import type { BoardItem, NewBoardItem } from "../types";
import AddItemBar from "./AddItemBar";
import ItemCard from "./ItemCard";

export default function Whiteboard({ boardId }: { boardId: number }) {
  const [items, setItems] = useState<BoardItem[]>([]);

  const loadItems = useCallback(async () => {
    const res = await api.get<BoardItem[]>(`/boards/${boardId}/items`);
    setItems(res.data);
  }, [boardId]);
  loadItems;

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    const item = items.find((i) => i.id === active.id);
    if (!item) return;

    const newX = item.pos_x + delta.x;
    const newY = item.pos_y + delta.y;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, pos_x: newX, pos_y: newY } : i,
      ),
    );
    await api.patch(`/items/${item.id}`, { pos_x: newX, pos_y: newY });
  };

  const addItem = async (newItem: NewBoardItem) => {
    const res = await api.post<BoardItem>(`/boards/${boardId}/items`, newItem);
    setItems((prev) => [...prev, res.data]);
  };

  const deleteItem = async (id: number) => {
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      <AddItemBar boardId={boardId} onAdd={addItem} onUploaded={loadItems} />
      <DndContext onDragEnd={handleDragEnd}>
        <div className="canvas">
          <div className="canvas-inner">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
