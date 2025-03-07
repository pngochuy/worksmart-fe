import React from 'react';

const Pagination = ({ currentPage, totalPage, setSearchParams }) => {
    console.log(currentPage, totalPage)
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setSearchParams(prev => ({
        ...prev,
        PageIndex: newPage
      }));
    }
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="ls-pagination">
      <ul>
        <li className="prev">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <i className="fa fa-arrow-left"></i>
          </a>
        </li>

        {getPageNumbers().map(pageNum => (
          <li key={pageNum}>
            <a 
              href="#" 
              className={currentPage === pageNum ? 'current-page' : ''}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(pageNum);
              }}
            >
              {pageNum}
            </a>
          </li>
        ))}

        <li className="next">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            style={{ cursor: currentPage === totalPage ? 'not-allowed' : 'pointer' }}
          >
            <i className="fa fa-arrow-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;