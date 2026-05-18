"use client";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { cn } from "./cn.js";

export interface DropZoneProps extends DropzoneOptions {
  className?: string;
  children?: React.ReactNode;
  /** When true, renders a slim "+ Add screenshot" style. */
  compact?: boolean;
}

export function DropZone({ className, children, compact, ...opts }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(opts);
  return (
    <div
      {...getRootProps()}
      data-slot="dropzone"
      data-drag-active={isDragActive ? "" : undefined}
      data-compact={compact ? "" : undefined}
      className={cn("sw-dropzone", isDragActive && "sw-dropzone--active", className)}
    >
      <input {...getInputProps()} />
      {children ?? (
        <div data-slot="dropzone-default">
          <p>{isDragActive ? "Drop here" : "Drag & drop screenshots or click to browse"}</p>
        </div>
      )}
    </div>
  );
}
