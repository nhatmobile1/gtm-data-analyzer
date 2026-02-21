"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Pencil } from "lucide-react";

interface EditableNameProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  maxLength?: number;
}

export default function EditableName({
  value,
  onSave,
  className = "",
  maxLength = 60,
}: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  }, [draft, value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        setDraft(value);
        setEditing(false);
      }
    },
    [save, value]
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={`bg-transparent border-b border-accent outline-none text-text ${className}`}
        style={{ width: `${Math.max(draft.length + 1, 4)}ch` }}
      />
    );
  }

  return (
    <span
      className={`group/name inline-flex items-center gap-1 cursor-pointer hover:text-accent/80 transition-colors text-text ${className}`}
      onClick={() => setEditing(true)}
      title="Click to rename"
    >
      <span className="truncate">{value}</span>
      <Pencil
        size={12}
        className="opacity-40 group-hover/name:opacity-70 transition-opacity shrink-0 text-muted"
      />
    </span>
  );
}
