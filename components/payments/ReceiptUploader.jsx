"use client";

import { useEffect, useState } from "react";

export default function ReceiptUploader({
  onFileSelected,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSizeMB = 5,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setSelectedFile(null);

    if (!file) return;

    /*
    ==============================
    Validate file type
    ==============================
    */

    if (!acceptedTypes.includes(file.type)) {
      setError(
        "Invalid file type. Please upload JPG, PNG, WEBP, or PDF files.",
      );

      return;
    }

    /*
    ==============================
    Validate file size
    ==============================
    */

    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
      setError(`File size must not exceed ${maxSizeMB}MB.`);

      return;
    }

    setSelectedFile(file);

    /*
    ==============================
    Image Preview
    ==============================
    */

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);

      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }

    /*
    ==============================
    Notify Parent
    ==============================
    */

    onFileSelected?.(file);
  }

  function removeFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    onFileSelected?.(null);
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <label
        className="
          flex flex-col items-center justify-center
          border-2 border-dashed border-gray-300
          rounded-2xl
          px-6 py-10
          cursor-pointer
          hover:border-black
          hover:bg-gray-50
          transition
          text-center
        "
      >
        <input
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileChange}
        />

        <div className="space-y-2">
          <p className="font-medium text-gray-800">Upload Payment Receipt</p>

          <p className="text-sm text-gray-500">JPG, PNG, WEBP or PDF</p>

          <p className="text-xs text-gray-400">
            Maximum file size: {maxSizeMB}MB
          </p>
        </div>
      </label>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="border rounded-2xl p-4 bg-white space-y-4">
          <div>
            <p className="font-medium text-gray-800">Selected File</p>

            <p className="text-sm text-gray-500 mt-1 break-all">
              {selectedFile.name}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Receipt Preview"
              className="
                w-full
                max-h-80
                object-contain
                rounded-xl
                border
              "
            />
          )}

          {/* PDF Indicator */}
          {!previewUrl && selectedFile.type === "application/pdf" && (
            <div
              className="
                  border rounded-xl
                  p-6
                  text-center
                  bg-gray-50
                "
            >
              <p className="font-medium">PDF Selected</p>

              <p className="text-sm text-gray-500 mt-1">{selectedFile.name}</p>
            </div>
          )}

          <button
            type="button"
            onClick={removeFile}
            className="
              px-4 py-2
              rounded-xl
              border
              text-red-600
              hover:bg-red-50
              transition
            "
          >
            Remove File
          </button>
        </div>
      )}
    </div>
  );
}
