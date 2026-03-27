import React, { ReactNode } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableItemProps = {
  id: string;
  children: ReactNode;
};

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.1)" : undefined,
    border: isDragging ? "2px dashed #727272" : "2px solid transparent",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag Handle */}
      <div className="py-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          style={{
            cursor: "grab",
            border: "none",
            padding: 4,
            fontSize: 18,
          }}
          className="h-full! bg-neutral-100 text-neutral-500 rounded-sm"
        >
          ⠿
        </button>
      </div>

      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
