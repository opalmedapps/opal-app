import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined" && "Worker" in window) {
  GlobalWorkerOptions.workerPort = new Worker(
    new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url),
    { type: "module" }
  );
}

export * from "pdfjs-dist/legacy/build/pdf.mjs";