"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef } from "react";
import { Toolbar } from "./Toolbar";

interface Props {
  content: string;
  editable: boolean;
  onChange?: (html: string) => void;
}

export function TiptapEditor({ content, editable, onChange }: Props) {
  const lastExternalContent = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
      CharacterCount,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Only apply external content changes when the editor is NOT focused.
  // This prevents cursor reset / text erase while the user is actively typing.
  useEffect(() => {
    if (!editor) return;
    if (content === lastExternalContent.current) return;
    lastExternalContent.current = content;

    if (!editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) return null;

  const words = editor.storage.characterCount?.words() ?? 0;
  const chars = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {editable && <Toolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-gray max-w-none px-12 py-8 min-h-full focus:outline-none"
        />
      </div>
      <div className="flex justify-end px-12 py-2 text-xs text-[#9CA3AF] border-t border-[#F3F4F6]">
        {words} words · {chars} characters
      </div>
    </div>
  );
}
