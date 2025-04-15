// src/utils/downloadHelpers.js
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";

/**
 * Download CV từ URL (dành cho CV loại 2 - uploaded PDF)
 */
export const downloadCVFromURL = async (url, fileName = "cv.pdf") => {
  try {
    // Xử lý tên file
    const cleanFileName = fileName.endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;

    // Fetch file từ URL
    const response = await fetch(url);
    const blob = await response.blob();

    // Tạo object URL và kích hoạt download
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      document.body.removeChild(link);
    }, 100);

    toast.success("CV downloaded successfully");
  } catch (error) {
    console.error("Error downloading CV:", error);
    toast.error("Failed to download CV. Please try again.");
  }
};

/**
 * Download CV từ HTML element (dành cho CV loại 1 - system CV)
 */
export const downloadCVAsHTML = async (contentRef, fileName = "cv.pdf") => {
  try {
    if (!contentRef.current) {
      toast.error("Cannot generate PDF. CV content not found.");
      return;
    }

    // Tạo loading toast
    const loadingToastId = toast.loading("Generating PDF...");

    const element = contentRef.current;

    // Tạo một bản sao của element để không ảnh hưởng đến UI
    const clonedElement = element.cloneNode(true);

    // Đặt vào container tạm thời để render
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Xóa thuộc tính zoom và áp dụng kích thước cố định
    clonedElement.style.zoom = "unset";
    clonedElement.style.transform = "none";
    clonedElement.style.width = "794px"; // Chiều rộng chuẩn cho A4
    clonedElement.style.transformOrigin = "top left";

    // Đảm bảo tất cả phần tử con có font-size phù hợp
    Array.from(clonedElement.querySelectorAll("*")).forEach((el) => {
      if (el.style.fontSize) {
        // Điều chỉnh font-size nếu cần
        const currentSize = window.getComputedStyle(el).fontSize;
        const sizeValue = parseFloat(currentSize);
        if (sizeValue > 30) {
          // Giới hạn kích thước tối đa
          el.style.fontSize = "16px";
        }
      }
    });

    // Xử lý đặc biệt cho các badge trong SkillsSection
    const badges = clonedElement.querySelectorAll(
      ".flex.break-inside-avoid.flex-wrap.gap-2 > *"
    );
    badges.forEach((badge) => {
      // Đảm bảo text căn giữa trong badge
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.justifyContent = "center";
      badge.style.lineHeight = "normal";
      badge.style.verticalAlign = "middle";
      badge.style.textAlign = "center";
      badge.style.padding = "0.25rem 0.5rem";

      // Điều chỉnh text bên trong badge
      Array.from(badge.childNodes).forEach((node) => {
        if (node.nodeType === 3) {
          // Node.TEXT_NODE
          // Wrap text node trong span để có thể áp dụng style
          const span = document.createElement("span");
          span.textContent = node.textContent;
          span.style.display = "inline-block";
          span.style.verticalAlign = "middle";
          badge.replaceChild(span, node);
        } else if (node.nodeType === 1) {
          // Node.ELEMENT_NODE
          node.style.verticalAlign = "middle";
        }
      });
    });

    // Sử dụng scale thấp hơn và chính xác hơn
    const canvas = await html2canvas(clonedElement, {
      scale: 1.0, // Scale 1:1 vì chúng ta đã thiết lập kích thước chuẩn
      useCORS: true,
      logging: false,
      allowTaint: true,
      letterRendering: true,
      removeContainer: false, // Không tự động dọn dẹp để tránh lỗi
    });

    // Dọn dẹp
    document.body.removeChild(tempContainer);

    const imgData = canvas.toDataURL("image/png");

    // Tạo PDF với kích thước A4 chuẩn
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Tính toán tỷ lệ chính xác
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Thêm hình ảnh vào PDF với kích thước đã tính toán
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      (pdfWidth * canvas.height) / canvas.width
    );

    // Tạo tên file hợp lệ
    const cleanFileName = fileName.endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;
    pdf.save(cleanFileName);

    // Đóng loading toast và hiển thị success
    toast.dismiss(loadingToastId);
    toast.success("CV downloaded successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to download CV. Please try again.");
  }
};
