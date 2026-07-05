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
    <div className="flex flex-col flex-1 min-h-0 bg-[#f8f8f7]">
      {editable && <Toolbar editor={editor} />}

      {/* Paper area */}
      <div className="flex-1 overflow-y-auto py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-280px)]">
          <EditorContent
            editor={editor}
            className="prose max-w-none px-14 py-12 focus:outline-none"
          />
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex justify-end px-6 py-2 text-xs text-gray-400 border-t border-gray-100 bg-white">
        {words} words · {chars} characters
      </div>
    </div>
  );
}
