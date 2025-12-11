import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";
import { useEditorContent } from "~/services/use-editor-content";

export const Editor = () => {
  const { title, content, updateTitle, updateContent } = useEditorContent();

  return (
    <div className="flex flex-col gap-6">
      <TitleEditor value={title} onChange={updateTitle} />
      <MarkdownEditor value={content} onChange={updateContent} />
    </div>
  );
};
