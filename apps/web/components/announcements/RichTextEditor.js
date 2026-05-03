"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const btnCls = "rounded px-2 py-1 text-xs font-medium transition hover:bg-[color:var(--border)]/60 disabled:opacity-40";
const activeCls = "bg-[color:var(--accent)]/15 text-[color:var(--accent)]";

export function RichTextEditor({ content, onChange, editable = true, placeholder = "Write something…" }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: content ? (typeof content === "string" ? (() => { try { return JSON.parse(content); } catch { return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] }; } })() : content) : undefined,
    editable,
    onUpdate({ editor }) {
      onChange?.(JSON.stringify(editor.getJSON()));
    },
  });

  if (!editor) return null;

  if (!editable) {
    return (
      <div className="prose prose-sm max-w-none text-[color:var(--foreground)]">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[color:var(--border)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-[color:var(--border)] bg-[color:var(--border)]/20 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnCls} ${editor.isActive("bold") ? activeCls : ""}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnCls} font-italic ${editor.isActive("italic") ? activeCls : ""}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${btnCls} line-through ${editor.isActive("strike") ? activeCls : ""}`}
        >
          S
        </button>
        <span className="mx-1 h-5 w-px self-center bg-[color:var(--border)]" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnCls} ${editor.isActive("bulletList") ? activeCls : ""}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnCls} ${editor.isActive("orderedList") ? activeCls : ""}`}
        >
          1. List
        </button>
        <span className="mx-1 h-5 w-px self-center bg-[color:var(--border)]" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnCls} ${editor.isActive("blockquote") ? activeCls : ""}`}
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${btnCls} font-mono ${editor.isActive("code") ? activeCls : ""}`}
        >
          {"</>"}
        </button>
      </div>

      {/* Editor area */}
      <div className="min-h-[120px] px-4 py-3 text-sm text-[color:var(--foreground)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
