import { useDraggable } from "@dnd-kit/core";
import { useState, useRef, useCallback } from "react";
import type { BoardItem } from "../types";

interface Props {
  item: BoardItem;
  onDelete: (id: number) => void;
  onResize: (id: number, width: number, height: number) => void;
  readOnly?: boolean;
  zIndex: number;
  onFocus: () => void;
}

export default function ItemCard({
  item,
  onDelete,
  onResize,
  readOnly,
  zIndex,
  onFocus,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    disabled: readOnly,
  });

  const [size, setSize] = useState({ width: item.width, height: item.height });
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizing = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onFocus(); // resizing also brings the card to front
      resizing.current = true;
      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [size, onFocus],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizing.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setSize({
      width: Math.max(80, startRef.current.width + dx),
      height: Math.max(80, startRef.current.height + dy),
    });
  }, []);

  const handlePointerUp = useCallback(
    (_e: React.PointerEvent) => {
      if (!resizing.current) return;
      resizing.current = false;
      onResize(item.id, size.width, size.height);
    },
    [item.id, size, onResize],
  );

  const style: React.CSSProperties = {
    position: "absolute",
    left: item.pos_x,
    top: item.pos_y,
    width: size.width,
    height: size.height,
    zIndex,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card"
      onPointerDown={onFocus}
      {...listeners}
      {...attributes}
    >
      <button
        className="delete-btn"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(item.id)}
      >
        ×
      </button>

      {item.type === "image" ? (
        <img
          src={item.url}
          alt={item.title || ""}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {item.thumbnail_url && <img src={item.thumbnail_url} alt="" />}
          <p>{item.title || item.url}</p>
        </a>
      )}

      {!readOnly && (
        <div
          className="resize-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}
    </div>
  );
}
