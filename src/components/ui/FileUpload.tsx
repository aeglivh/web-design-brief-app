import { useRef } from "react";
import { cn } from "@/lib/cn";

interface UploadedFile {
  base64: string;
  mediaType: string;
  label: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
  className?: string;
}

function readFileAsBase64(
  file: File
): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const mediaType =
        result.match(/data:(.*?);/)?.[1] || "application/octet-stream";
      resolve({ base64, mediaType });
    };
    reader.readAsDataURL(file);
  });
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  accept = "image/*,.pdf,.svg",
  label,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const remaining = maxFiles - files.length;
    const toProcess = selected.slice(0, remaining);

    const newFiles = await Promise.all(
      toProcess.map(async (f) => {
        const { base64, mediaType } = await readFileAsBase64(f);
        return { base64, mediaType, label: f.name };
      })
    );

    onFilesChange([...files, ...newFiles]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-[13px] font-medium text-th-secondary mb-1.5">
          {label}
        </label>
      )}
      <label className="flex flex-col items-center gap-2 border border-dashed border-th-border rounded-xl px-4 py-5 cursor-pointer bg-th-surface hover:border-th-border hover:bg-th-surface-hover transition-all">
        <svg className="text-th-muted" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[13px] text-th-muted">
          {files.length >= maxFiles
            ? `Maximum ${maxFiles} files reached`
            : "Drop files here or click to upload"}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
      </label>
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2.5">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-th-surface-hover border border-th-border-light rounded-lg px-3 py-2 text-[12px] text-th-secondary"
            >
              <svg className="text-th-muted shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="max-w-[120px] truncate">{f.label}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-th-muted hover:text-[#FF453A] transition-colors cursor-pointer ml-0.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
