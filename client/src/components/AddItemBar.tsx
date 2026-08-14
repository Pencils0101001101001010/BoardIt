import { useState, type SubmitEvent, type ChangeEvent } from "react";
import type { NewBoardItem, ItemType } from "../types";
import api from "../../api/client";

interface Props {
  boardId: number;
  onAdd: (item: NewBoardItem) => void;
  onUploaded: () => void;
}

export default function AddItemBar({ boardId, onAdd, onUploaded }: Props) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ItemType>("link");
  const [uploading, setUploading] = useState(false);

  const guessType = (u: string): ItemType =>
    /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(u) ? "image" : "link";

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (type !== "header") setType(guessType(value)); // don't override an explicit header choice
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
    <form onSubmit={handleSubmit} className="add-bar">
      <input
        value={url}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder={
          type === "header" ? "Header text..." : "Paste a link or image URL..."
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
        Header
      </label>
      <button type="submit">Add to board</button>

      <label className="upload-btn">
        {uploading ? "Uploading..." : "Upload image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </label>
    </form>
  );
}

// import { useState, type SubmitEvent, type ChangeEvent } from "react";
// import type { NewBoardItem, ItemType } from "../types";
// import api from "../../api/client";

// interface Props {
//   boardId: number;
//   onAdd: (item: NewBoardItem) => void;
//   onUploaded: () => void; // reload items after an upload completes
// }

// export default function AddItemBar({ boardId, onAdd, onUploaded }: Props) {
//   const [url, setUrl] = useState("");
//   const [type, setType] = useState<ItemType>("link");
//   const [uploading, setUploading] = useState(false);

//   const guessType = (u: string): ItemType =>
//     /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(u) ? "image" : "link";

//   const handleUrlChange = (value: string) => {
//     setUrl(value);
//     setType(guessType(value));
//   };

//   const handleSubmit = (e: SubmitEvent) => {
//     e.preventDefault();
//     if (!url.trim()) return;
//     onAdd({
//       type,
//       url,
//       title: url,
//       pos_x: 100 + Math.random() * 300,
//       pos_y: 100 + Math.random() * 300,
//     });
//     setUrl("");
//     setType("link");
//   };

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append("image", file);
//     formData.append("pos_x", String(100 + Math.random() * 300));
//     formData.append("pos_y", String(100 + Math.random() * 300));

//     try {
//       await api.post(`/boards/${boardId}/items/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       onUploaded();
//     } finally {
//       setUploading(false);
//       e.target.value = ""; // reset input so the same file can be re-selected
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="add-bar">
//       <input
//         value={url}
//         onChange={(e) => handleUrlChange(e.target.value)}
//         placeholder="Paste a link or image URL..."
//       />
//       <label>
//         <input
//           type="radio"
//           checked={type === "link"}
//           onChange={() => setType("link")}
//         />{" "}
//         Link
//       </label>
//       <label>
//         <input
//           type="radio"
//           checked={type === "image"}
//           onChange={() => setType("image")}
//         />{" "}
//         Image
//       </label>

//       <label className="upload-btn">
//         {uploading ? "Uploading..." : "Upload image"}
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           hidden
//         />
//       </label>
//       <button type="submit">Add to board</button>
//     </form>
//   );
// }
