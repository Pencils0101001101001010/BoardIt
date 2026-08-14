import { useState, type SubmitEvent, type ChangeEvent } from "react";
import type { NewBoardItem, ItemType } from "../types";
import api from "../../api/client";

interface Props {
  boardId: number;
  onAdd: (item: NewBoardItem) => Promise<void>;
  onUploaded: () => void;
}

export default function AddItemBar({ boardId, onAdd, onUploaded }: Props) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ItemType>("link");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const guessType = (u: string): ItemType =>
    /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(u) ? "image" : "link";

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (type !== "header") setType(guessType(value)); // don't override an explicit header choice
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        type,
        url,
        title: url,
        pos_x: 100 + Math.random() * 300,
        pos_y: 100 + Math.random() * 300,
      });
      setUrl("");
      setType("link");
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("pos_x", String(100 + Math.random() * 300));
    formData.append("pos_y", String(100 + Math.random() * 300));

    try {
      await api.post(`/boards/${boardId}/items/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      {loading && <p className="loader"></p>}
      <form onSubmit={handleSubmit} className="add-bar">
        <input
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={
            type === "header" ? "Title text..." : "Paste a link or image URL..."
          }
        />
        <label title="Copy and past a link">
          <input
            type="radio"
            checked={type === "link"}
            onChange={() => setType("link")}
          />{" "}
          Link
        </label>
        <label title="Once selected, find the image on web you'd like to display and copy its link address and past it in the input bar.">
          <input
            type="radio"
            checked={type === "image"}
            onChange={() => setType("image")}
          />{" "}
          Image
        </label>
        <label title="Add a header/Title. You can then double click the header once created to edit it.">
          <input
            type="radio"
            checked={type === "header"}
            onChange={() => setType("header")}
          />{" "}
          Title
        </label>

        <label className="upload-btn">
          {uploading ? "Uploading..." : "Upload image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <button type="submit">Add to board</button>
      </form>
    </div>
  );
}
