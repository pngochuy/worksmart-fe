/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export const CandidatePagination = ({
  totalCandidates,
  candidatesPerPage = 3,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalCandidates / candidatesPerPage);
  const [visiblePages, setVisiblePages] = useState([]);

  // Tính toán các trang hiển thị trong thanh phân trang
  useEffect(() => {
    let pages = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      // Hiển thị tất cả trang nếu ít hơn maxVisibleButtons
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Tính toán phạm vi trang hiển thị
      let startPage = Math.max(currentPage - 2, 1);
      let endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

      if (endPage - startPage < maxVisibleButtons - 1) {
        startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
      }

      // Thêm trang đầu nếu cần
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      // Thêm các trang giữa
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Thêm trang cuối nếu cần
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    setVisiblePages(pages);
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Cuộn lên đầu danh sách
      window.scrollTo({
        top: document.getElementById("candidates-list").offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-4 mt-6 border-t border-gray-200">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {Math.min(
                (currentPage - 1) * candidatesPerPage + 1,
                totalCandidates
              )}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * candidatesPerPage, totalCandidates)}
            </span>{" "}
            of <span className="font-medium">{totalCandidates}</span> candidates
          </p>
        </div>

        <div>
          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {/* Nút về trang đầu */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-md border-gray-300"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Nút trang trước */}
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Các số trang */}
            {visiblePages.map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  className={`border-gray-300 ${
                    currentPage === page
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700"
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              )
            )}

            {/* Nút trang sau */}
            <Button
              variant="outline"
              size="icon"
              className="border-gray-300"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Nút đến trang cuối */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-r-md border-gray-300"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>

      {/* Phân trang cho mobile */}
      <div className="flex justify-between w-full sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Trước
        </Button>

        <span className="flex items-center text-sm text-gray-700">
          Trang {currentPage}/{totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
