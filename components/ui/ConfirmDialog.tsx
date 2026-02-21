"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="bg-surface border border-border rounded-lg p-5 max-w-sm w-full text-text backdrop:bg-black/50"
      onClose={onCancel}
    >
      <div className="font-semibold text-sm mb-2">{title}</div>
      <p className="text-muted text-xs mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="py-1.5 px-3 rounded-md text-xs border border-border text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="py-1.5 px-3 rounded-md text-xs bg-negative text-white hover:bg-negative/80 transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
