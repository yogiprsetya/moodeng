import { useState } from "react";
import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";

export const Editor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <TitleEditor value={title} onChange={setTitle} />
      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
};
