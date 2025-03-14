import React, { useState } from "react";
import { uploadFile } from "@/services/employerServices";
import { toast } from "react-toastify";
import "@react-pdf-viewer/core/lib/styles/index.css";

const UploadFileTest = () => {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileUrl(URL.createObjectURL(selectedFile)); // Tạo URL tạm thời để hiển thị ngay lập tức
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Vui lòng chọn file trước khi upload.");
            return;
        }
        try {
            setUploading(true);
            const response = await uploadFile(file);
            setFileUrl(response.FileUrl);
            console.log("Uploaded File URL:", response);
            toast.success("File uploaded successfully!");
        } catch (error) {
            toast.error("Upload failed!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Upload File Test (PDF)</h2>
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
            <br />
            <button onClick={handleUpload} disabled={uploading} style={{ marginTop: "10px" }}>
                {uploading ? "Uploading..." : "Upload File"}
            </button>
            {fileUrl && (
                <div>
                    <h4>Preview:</h4>
                    {file?.type.includes("image") ? (
                        <img src={fileUrl} alt="Preview" style={{ width: "300px", marginTop: "10px" }} />
                    ) : (
                        <iframe
                            src={fileUrl}
                            width="100%"
                            height="600px"
                            style={{ border: "none", marginTop: "10px" }}
                        ></iframe>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadFileTest;
