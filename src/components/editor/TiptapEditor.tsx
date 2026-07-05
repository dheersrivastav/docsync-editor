"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";
import { Toolbar } from "./Toolbar";

interface Props {
  content: string;
  editable: boolean;
  onChange?: (html: string) => void;
}

export function TiptapEditor({ content, editable, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
      CharacterCount,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Sync content when it changes externally (e.g. after conflict resolution)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable flag if role changes
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
          className="prose prose-gray max-w-none px-8 py-6 min-h-full focus:outline-none"
        />
      </div>

      <div className="flex justify-end px-8 py-2 text-xs text-gray-400 border-t border-gray-100">
        {words} words · {chars} characters
      </div>
    </div>
  );
}
