import React from "react";
import PropTypes from "prop-types";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPage, setSearchParams }) => {
  const pages = [];

  // Xác định phạm vi trang hiển thị
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPage, startPage + 4);

  // Điều chỉnh lại startPage nếu cần
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Thêm các trang vào mảng
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Xử lý khi click vào một trang cụ thể
  const handlePageClick = (pageNumber) => {
    if (pageNumber === currentPage) return;
    console.log("Changing to page:", pageNumber);
    setSearchParams({ PageIndex: pageNumber });
  };

  // Xử lý khi click vào nút Previous
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1);
    }
  };

  // Xử lý khi click vào nút Next
  const handleNext = () => {
    if (currentPage < totalPage) {
      handlePageClick(currentPage + 1);
    }
  };

  // Không hiển thị phân trang nếu chỉ có 1 trang
  if (totalPage <= 1) return null;

  return (
    <nav className="pagination-container">
      <ul className="pagination">
        {/* Nút Previous */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>

        {/* Hiển thị trang đầu tiên nếu không phải là trang hiện tại hoặc kề tiếp */}
        {startPage > 1 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageClick(1)}>
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {/* Các trang chính */}
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => handlePageClick(page)}>
              {page}
            </button>
          </li>
        ))}

        {/* Hiển thị trang cuối cùng nếu cần */}
        {endPage < totalPage && (
          <>
            {endPage < totalPage - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => handlePageClick(totalPage)}
              >
                {totalPage}
              </button>
            </li>
          </>
        )}

        {/* Nút Next */}
        <li
          className={`page-item ${currentPage === totalPage ? "disabled" : ""}`}
        >
          <button
            className="page-link"
            onClick={handleNext}
            disabled={currentPage === totalPage}
            aria-label="Next page"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPage: PropTypes.number.isRequired,
  setSearchParams: PropTypes.func.isRequired,
};

export default Pagination;
