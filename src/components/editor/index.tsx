import { MarkdownEditor } from "./markdown-editor";
import { TitleEditor } from "./title-editor";
import { FolderSelector } from "./folder-selector";
import { useEditorContent } from "~/services/use-editor-content";
import { useState, lazy, Suspense } from "react";
import { Button } from "~/components/ui/button";
import { Clock } from "lucide-react";

const HistorySheet = lazy(() =>
  import("~/components/common/history-sheet").then((module) => ({
    default: module.HistorySheet,
  }))
);

export const Editor = () => {
  const { content, updateTitle, updateContent, updateFolder } =
    useEditorContent();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <FolderSelector
          value={content?.folderId ?? null}
          onChange={updateFolder}
        />

        <Button
          variant="ghost"
          size="icon"
          title="History"
          onClick={() => setHistoryOpen(true)}
        >
          <Clock />
          <span className="sr-only">Open history</span>
        </Button>
      </div>

      <TitleEditor value={content?.title ?? ""} onChange={updateTitle} />
      <MarkdownEditor value={content?.content ?? ""} onChange={updateContent} />

      <Suspense fallback={null}>
        <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
      </Suspense>
    </div>
  );
};
