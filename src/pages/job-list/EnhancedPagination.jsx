/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const EnhancedPagination = ({ currentPage, totalPage, setSearchParams }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setSearchParams((prev) => ({
        ...prev,
        PageIndex: newPage,
      }));

      // Scroll to top of results when changing page
      const resultsElement = document.querySelector(".lg\\:col-span-3");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Generate array of visible page numbers
  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const pages = [];

    let leftBound = Math.max(1, currentPage - delta);
    let rightBound = Math.min(totalPage, currentPage + delta);

    // Adjust bounds to always show 5 pages when possible
    if (rightBound - leftBound < 2 * delta) {
      if (leftBound === 1) {
        rightBound = Math.min(1 + 2 * delta, totalPage);
      } else if (rightBound === totalPage) {
        leftBound = Math.max(totalPage - 2 * delta, 1);
      }
    }

    // Add first page
    if (leftBound > 1) {
      pages.push(1);
      if (leftBound > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible pages
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    // Add last page
    if (rightBound < totalPage) {
      if (rightBound < totalPage - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPage);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-6">
      <div className="flex space-x-2">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className="hidden md:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex space-x-2">
          {getVisiblePageNumbers().map((pageNum, index) =>
            pageNum === "ellipsis-start" || pageNum === "ellipsis-end" ? (
              <div
                key={pageNum}
                className="flex items-center justify-center w-10"
              >
                <span className="text-gray-500">...</span>
              </div>
            ) : (
              <Button
                key={index}
                variant={currentPage === pageNum ? "default" : "outline"}
                className="w-10"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPage)}
          disabled={currentPage === totalPage}
          aria-label="Last page"
          className="hidden md:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-4 text-sm text-gray-500">
        Page {currentPage} of {totalPage}
      </div>
    </div>
  );
};

export default EnhancedPagination;
