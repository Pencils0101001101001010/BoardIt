import { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import api from "../../api/client";
import type { BoardItem, NewBoardItem } from "../types";
import AddItemBar from "./AddItemBar";
import ItemCard from "./ItemCard";

export default function Whiteboard({
  boardId,
  accessLevel,
}: {
  boardId: number;
  accessLevel: "owner" | "editor" | "viewer";
}) {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [zIndexes, setZIndexes] = useState<Record<number, number>>({});
  const nextZ = useRef(1);

  const bringToFront = useCallback((id: number) => {
    nextZ.current += 1;
    setZIndexes((prev) => ({ ...prev, [id]: nextZ.current }));
  }, []);

  const loadItems = useCallback(async () => {
    const res = await api.get<BoardItem[]>(`/boards/${boardId}/items`);
    setItems(res.data);
    // seed initial stacking order by creation order
    const seeded: Record<number, number> = {};
    res.data.forEach((item, i) => {
      seeded[item.id] = i + 1;
    });
    nextZ.current = res.data.length + 1;
    setZIndexes(seeded);
  }, [boardId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDragStart = (event: DragStartEvent) => {
    bringToFront(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    // console.log(delta);
    // console.log(active);
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

  const handleResize = async (id: number, width: number, height: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, width, height } : i)),
    );
    await api.patch(`/items/${id}`, { width, height });
  };

  const addItem = async (newItem: NewBoardItem): Promise<void> => {
    const res = await api.post<BoardItem>(`/boards/${boardId}/items`, newItem);
    setItems((prev) => [...prev, res.data]);
    bringToFront(res.data.id);
  };

  const deleteItem = async (id: number) => {
    await api.delete(`/items/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleHeaderUpdate = async (
    id: number,
    updates: Partial<Pick<BoardItem, "title" | "font_size" | "color">>,
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    );
    await api.patch(`/items/${id}`, updates);
  };

  return (
    <div>
      {accessLevel !== "viewer" && (
        <AddItemBar boardId={boardId} onAdd={addItem} onUploaded={loadItems} />
      )}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="canvas">
          <div className="canvas-inner">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onUpdate={handleHeaderUpdate}
                onDelete={deleteItem}
                onResize={handleResize}
                readOnly={accessLevel === "viewer"}
                zIndex={
                  item.type === "header"
                    ? (zIndexes[item.id] ?? 1) + 100000
                    : (zIndexes[item.id] ?? 1)
                }
                onFocus={() => bringToFront(item.id)}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
