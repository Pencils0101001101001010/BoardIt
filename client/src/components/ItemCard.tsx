import { useDraggable } from "@dnd-kit/core";
import type { BoardItem } from "../types";

interface Props {
  item: BoardItem;
  onDelete: (id: number) => void;
}

export default function ItemCard({ item, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: item.pos_x,
    top: item.pos_y,
    width: item.width,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card"
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
    </div>
  );
}
