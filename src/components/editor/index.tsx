import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";
import { FolderSelector } from "./folder-selector";
import { useEditorContent } from "~/services/use-editor-content";

export const Editor = () => {
  const { content, updateTitle, updateContent, updateFolder } =
    useEditorContent();

  return (
    <div className="flex flex-col gap-4">
      <FolderSelector
        value={content?.folderId ?? null}
        onChange={updateFolder}
      />
      <TitleEditor value={content?.title ?? ""} onChange={updateTitle} />
      <MarkdownEditor value={content?.content ?? ""} onChange={updateContent} />
    </div>
  );
};
