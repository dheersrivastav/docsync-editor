"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Minus, Undo, Redo,
} from "lucide-react";

interface Props {
  editor: Editor;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  active?: boolean;
}

export function Toolbar({ editor }: Props) {
  const buttons: ToolbarButton[] = [
    {
      label: "Heading 2",
      icon: <Heading2 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      icon: <Heading3 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "Bold",
      icon: <Bold className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: <Italic className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Strikethrough",
      icon: <Strikethrough className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      label: "Bullet list",
      icon: <List className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Numbered list",
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Blockquote",
      icon: <Quote className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Horizontal rule",
      icon: <Minus className="h-4 w-4" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 flex-wrap">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.action}
          title={btn.label}
          aria-label={btn.label}
          aria-pressed={btn.active}
          className={`p-1.5 rounded transition-colors ${
            btn.active
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {btn.icon}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200 mx-1" aria-hidden="true" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        aria-label="Undo"
        className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        aria-label="Redo"
        className="p-1.5 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}
