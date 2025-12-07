import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";
import { useEditorStore } from "~/store/editor-store";

export const Editor = () => {
  const { title, content, setTitle, setContent } = useEditorStore();

  return (
    <div className="flex flex-col gap-6">
      <TitleEditor value={title} onChange={setTitle} />
      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
};
