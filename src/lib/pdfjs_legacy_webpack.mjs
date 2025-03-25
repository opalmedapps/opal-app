// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined" && "Worker" in window) {
  GlobalWorkerOptions.workerPort = new Worker(
    new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url),
    { type: "module" }
  );
}

export * from "pdfjs-dist/legacy/build/pdf.mjs";
