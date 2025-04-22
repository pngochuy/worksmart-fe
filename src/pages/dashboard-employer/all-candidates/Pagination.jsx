import React from "react";
import PropTypes from "prop-types";
import "./Pagination.css"; // Assuming you have a CSS file for styling

const Pagination = ({ currentPage, totalPage, onPageChange, maxDisplayedPages = 5 }) => {
  // Don't render pagination if there's only one page
  if (totalPage <= 1) return null;

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      onPageChange(newPage);
    }
  };

  // Generate page numbers to display with smart logic for many pages
  const getPageNumbers = () => {
    // If we have fewer pages than the max to display, show all of them
    if (totalPage <= maxDisplayedPages) {
      return Array.from({ length: totalPage }, (_, i) => i + 1);
    }

    // Calculate the range of visible page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
    let endPage = startPage + maxDisplayedPages - 1;

    // Adjust if we're near the end
    if (endPage > totalPage) {
      endPage = totalPage;
      startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }

    // Create the array of page numbers to display
    const pages = [];
    
    // Always include first page
    if (startPage > 1) {
      pages.push(1);
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPage) {
        pages.push(i);
      }
    }

    // Always include last page
    if (endPage < totalPage) {
      // Add ellipsis if there's a gap
      if (endPage < totalPage - 1) {
        pages.push("...");
      }
      pages.push(totalPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container mt-4 d-flex justify-content-center">
      <nav aria-label="Pagination">
        <ul className="pagination">
          {/* Previous button */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="la la-angle-left"></i>
            </button>
          </li>

          {/* Page numbers */}
          {pageNumbers.map((pageNum, index) => {
            // For ellipsis
            if (pageNum === "...") {
              return (
                <li key={`ellipsis-${index}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              );
            }
            
            // For actual page numbers
            return (
              <li
                key={pageNum}
                className={`page-item ${currentPage === pageNum ? "active" : ""}`}
              >
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            );
          })}

          {/* Next button */}
          <li className={`page-item ${currentPage === totalPage ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPage}
            >
              <i className="la la-angle-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxDisplayedPages: PropTypes.number
};

export default Pagination;