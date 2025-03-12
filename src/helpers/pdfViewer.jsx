import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PdfViewer = ({ pdfUrl }) => {
  return (
    <div style={{ height: "600px", border: "1px solid #ccc", marginTop: "10px" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default PdfViewer;
