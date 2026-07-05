"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Minus, Undo, Redo,
} from "lucide-react";

interface Props {
  editor: Editor;
}

function ToolBtn({
  onMouseDown,
  active,
  disabled,
  label,
  children,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`p-2 rounded-md transition-colors duration-100 ${
        active
          ? "bg-[#6D28D9] text-white"
          : "text-[#6B7280] hover:bg-white hover:text-[#111827] hover:shadow-sm"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-4 bg-[#E5E7EB] mx-1 shrink-0" aria-hidden="true" />;
}

export function Toolbar({ editor }: Props) {
  function cmd(fn: () => void) {
    return (e: React.MouseEvent) => {
      e.preventDefault(); // keeps editor focused
      fn();
    };
  }

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[#E5E7EB] flex-wrap bg-[#F9FAFB]">
      <ToolBtn
        label="Heading 2"
        onMouseDown={cmd(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Heading 3"
        onMouseDown={cmd(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        label="Bold"
        onMouseDown={cmd(() => editor.chain().focus().toggleBold().run())}
        active={editor.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Italic"
        onMouseDown={cmd(() => editor.chain().focus().toggleItalic().run())}
        active={editor.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Strikethrough"
        onMouseDown={cmd(() => editor.chain().focus().toggleStrike().run())}
        active={editor.isActive("strike")}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        label="Bullet list"
        onMouseDown={cmd(() => editor.chain().focus().toggleBulletList().run())}
        active={editor.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Numbered list"
        onMouseDown={cmd(() => editor.chain().focus().toggleOrderedList().run())}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Blockquote"
        onMouseDown={cmd(() => editor.chain().focus().toggleBlockquote().run())}
        active={editor.isActive("blockquote")}
      >
        <Quote className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Horizontal rule"
        onMouseDown={cmd(() => editor.chain().focus().setHorizontalRule().run())}
      >
        <Minus className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        label="Undo"
        onMouseDown={cmd(() => editor.chain().focus().undo().run())}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        label="Redo"
        onMouseDown={cmd(() => editor.chain().focus().redo().run())}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </ToolBtn>
    </div>
  );
}
