import { useState, type SubmitEvent } from "react";
import type { NewBoardItem, ItemType } from "../types";

export default function AddItemBar({
  onAdd,
}: {
  onAdd: (item: NewBoardItem) => void;
}) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ItemType>("link");

  const guessType = (u: string): ItemType =>
    /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(u) ? "image" : "link";

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setType(guessType(value)); // auto-guess, but user can still override below
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAdd({
      type,
      url,
      title: url,
      pos_x: 100 + Math.random() * 300,
      pos_y: 100 + Math.random() * 300,
    });
    setUrl("");
    setType("link");
  };

  return (
    <form onSubmit={handleSubmit} className="add-bar">
      <input
        value={url}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="Insert a name or Paste a link or image URL..."
      />
      <label>
        <input
          type="radio"
          checked={type === "link"}
          onChange={() => setType("link")}
        />{" "}
        Link
      </label>
      <label>
        <input
          type="radio"
          checked={type === "image"}
          onChange={() => setType("image")}
        />{" "}
        Image
      </label>
      <button type="submit">Add to board</button>
    </form>
  );
}
