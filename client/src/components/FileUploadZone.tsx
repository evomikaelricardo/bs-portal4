import { Upload, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
  maxSize?: number;
}

export default function FileUploadZone({
  onFileSelect,
  acceptedFormats = ".csv",
  maxSize = 10 * 1024 * 1024,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return false;
    }
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="w-full" data-testid="file-upload-zone">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          {!selectedFile ? (
            <label htmlFor="file-input" className="cursor-pointer block">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-foreground mb-1">
                    Drop CSV file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported format: .csv (Max {maxSize / (1024 * 1024)}MB)
                  </p>
                </div>
              </div>
              <input
                id="file-input"
                type="file"
                accept={acceptedFormats}
                onChange={handleFileInput}
                className="hidden"
                data-testid="input-file"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid="text-filename">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                data-testid="button-clear-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
      {error && (
        <p className="mt-2 text-sm text-destructive" data-testid="text-error">
          {error}
        </p>
      )}
    </div>
  );
}
