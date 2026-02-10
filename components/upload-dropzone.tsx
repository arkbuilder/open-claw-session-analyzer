"use client";

import React from "react"

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isAnalyzing: boolean;
}

export function UploadDropzone({
  onFilesSelected,
  isAnalyzing,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith(".jsonl")
      );
      if (files.length > 0) {
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) =>
        f.name.endsWith(".jsonl")
      );
      if (files.length > 0) {
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-500",
        isDragOver
          ? "scale-[1.02] border-primary bg-primary/10"
          : "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80",
        isAnalyzing && "pointer-events-none opacity-60"
      )}
    >
      {/* Animated background glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500",
          isDragOver && "opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(132,0,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
          isDragOver
            ? "scale-110 bg-primary/20"
            : "bg-secondary group-hover:bg-primary/10"
        )}
      >
        {isDragOver ? (
          <Sparkles className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>

      <div className="relative text-center">
        <p className="text-lg font-medium text-foreground">
          {isDragOver ? "Drop files here" : "Upload session files"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag & drop .jsonl files or click to browse
        </p>
      </div>

      {selectedFiles.length > 0 && !isAnalyzing && (
        <div className="relative flex flex-wrap justify-center gap-2">
          {selectedFiles.map((f) => (
            <span
              key={f.name}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <FileText className="h-3 w-3" />
              {f.name}
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jsonl"
        multiple
        onChange={handleFileInput}
        className="hidden"
        aria-label="Upload JSONL session files"
      />
    </div>
  );
}
