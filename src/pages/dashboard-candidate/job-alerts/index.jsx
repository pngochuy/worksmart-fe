import { useEffect, useState } from "react";
import {
  getJobAlertsByUserId,
  deleteJobAlert,
} from "@/services/candidateServices";
import { toast } from "react-toastify";
import { Search, RefreshCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingButton from "@/components/LoadingButton";

const JobAlertManager = () => {
  const [jobAlerts, setJobAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [alertDetail, setAlertDetail] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("userLoginData"));
    } catch {
      return null;
    }
  })();

  const userID = user?.userID;

  // Fetch job alerts
  const fetchJobAlerts = async () => {
    if (!userID) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getJobAlertsByUserId(userID);
      setJobAlerts(data || []);
      setFilteredAlerts(data || []);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch job alerts.");
      toast.error("Failed to fetch job alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAlerts();
  }, [userID]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAlerts(jobAlerts);
    } else {
      const filtered = jobAlerts.filter((alert) =>
        alert.keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAlerts(filtered);
    }
    // Reset to page 1 when search changes
    setCurrentPage(1);
  }, [searchTerm, jobAlerts]);

  // Handle delete confirmation
  const handleDeleteClick = (alert) => {
    setSelectedAlert(alert);
    setSelectedAlertId(alert.jobAlertId);
    setDeleteDialogOpen(true);
  };

  // Handle detail view
  const handleViewDetail = (alert) => {
    setAlertDetail(alert);
    setDetailDialogOpen(true);
  };

  // Handle delete operation
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteJobAlert(selectedAlertId, userID);
      setJobAlerts((prev) =>
        prev.filter((alert) => alert.jobAlertId !== selectedAlertId)
      );
      setFilteredAlerts((prev) =>
        prev.filter((alert) => alert.jobAlertId !== selectedAlertId)
      );
      toast.success("Alert deleted successfully.");
    } catch (error) {
      console.error("Error while deleting job alert:", error);
      toast.error("Failed to delete alert.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Job Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job alert for{" "}
              <b>{selectedAlert?.keyword}</b> in{" "}
              <b>{selectedAlert?.province}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Job Alert Details</DialogTitle>
          </DialogHeader>

          {alertDetail && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">Keyword</p>
                    <p className="text-sm mt-1">{alertDetail.keyword}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>
                    <p className="text-sm mt-1">
                      {alertDetail.province}
                      {alertDetail.district && `, ${alertDetail.district}`}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">
                      Salary Range
                    </p>
                    <p className="text-sm mt-1">
                      {alertDetail.salaryRange || "Negotiable"}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">
                      Experience
                    </p>
                    <p className="text-sm mt-1">{alertDetail.experience}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">
                      Work Type
                    </p>
                    <p className="text-sm mt-1">
                      {alertDetail.jobType || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-500">
                      Notification Method
                    </p>
                    <p className="text-sm mt-1">
                      {alertDetail.notificationMethod}
                    </p>
                  </div>
                  {alertDetail.jobPosition && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Job Position
                      </p>
                      <p className="text-sm mt-1">{alertDetail.jobPosition}</p>
                    </div>
                  )}
                  {alertDetail.frequency && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Frequency
                      </p>
                      <p className="text-sm mt-1">{alertDetail.frequency}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Job Alerts</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Job Alerts</h4>
                    {!loading && filteredAlerts.length > 0 && (
                      <Button
                        className="h-8 px-2 lg:px-3"
                        variant="outline"
                        disabled={loading}
                        onClick={fetchJobAlerts}
                      >
                        <RefreshCcw
                          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                        <span className="ml-1 hidden sm:inline"></span>
                      </Button>
                    )}
                  </div>

                  {/* Search box */}
                  <div className="search-box-outer w-full border border-gray-300 rounded-md p-3 mb-4 bg-white shadow-sm">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search by keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <div className="table-responsive">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th width="5%">#</th>
                              <th width="20%">Keyword</th>
                              <th width="20%">Location</th>
                              <th width="13%">Salary</th>
                              <th width="12%">Experience</th>
                              <th width="10%">Work Type</th>
                              <th width="10%">Notification</th>
                              <th width="10%">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  <p>Loading job alerts...</p>
                                </td>
                              </tr>
                            ) : error ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  <p>{error}</p>
                                </td>
                              </tr>
                            ) : filteredAlerts.length > 0 ? (
                              currentAlerts.map((alert, index) => (
                                <tr key={alert.jobAlertId}>
                                  <td className="text-center">
                                    {(currentPage - 1) * itemsPerPage +
                                      index +
                                      1}
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.keyword}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.province}
                                      {alert.district && `, ${alert.district}`}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.salaryRange || "Negotiable"}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.experience}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.jobType || "N/A"}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="text-truncate-container">
                                      {alert.notificationMethod}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="option-box">
                                      <ul className="option-list">
                                        <li>
                                          <button
                                            onClick={() =>
                                              handleViewDetail(alert)
                                            }
                                            className="text-blue-500 hover:text-blue-700 mr-3"
                                          >
                                            <Eye size={16} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteClick(alert)
                                            }
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <span className="la la-trash"></span>
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  {searchTerm ? (
                                    <p>
                                      No job alerts found matching &quot;
                                      {searchTerm}&quot;.
                                    </p>
                                  ) : (
                                    <p>No job alerts found.</p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {filteredAlerts.length > 0 && (
                        <div className="pagination-container mt-4 d-flex justify-content-center">
                          <nav aria-label="Job alerts pagination">
                            <ul className="pagination">
                              <li
                                className={`page-item ${
                                  currentPage === 1 ? "disabled" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 1}
                                >
                                  <i className="la la-angle-left"></i>
                                </button>
                              </li>

                              {[...Array(totalPages).keys()].map((number) => (
                                <li
                                  key={number + 1}
                                  className={`page-item ${
                                    currentPage === number + 1 ? "active" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => paginate(number + 1)}
                                  >
                                    {number + 1}
                                  </button>
                                </li>
                              ))}

                              <li
                                className={`page-item ${
                                  currentPage === totalPages ? "disabled" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={goToNextPage}
                                  disabled={currentPage === totalPages}
                                >
                                  <i className="la la-angle-right"></i>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS styles */}
      <style>
        {`
          /* Table content handling */
          .text-truncate-container {
            max-width: 100%;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            word-wrap: break-word;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.3;
          }
          
          /* Table responsiveness */
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Pagination styling */
          .pagination-container {
            margin-top: 20px;
          }
          
          .pagination .page-link {
            color: #2361ff;
            border: 1px solid #dee2e6;
          }
          
          .pagination .page-item.active .page-link {
            background-color: #2361ff;
            border-color: #2361ff;
            color: white;
          }
          
          .pagination .page-item.disabled .page-link {
            color: #6c757d;
            pointer-events: none;
            background-color: #fff;
            border-color: #dee2e6;
          }
          
          /* Table styling */
          .default-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px;
            table-layout: fixed;
          }
          
          .default-table thead th {
            background-color: #f5f7fc;
            padding: 15px;
            font-weight: 500;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .default-table tbody tr {
            background-color: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }
          
          .default-table tbody tr:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .default-table tbody td {
            padding: 15px;
            border-top: 1px solid #e9ecef;
            border-bottom: 1px solid #e9ecef;
            vertical-align: middle;
            overflow: hidden;
          }
          
          .option-list {
            display: flex;
            justify-content: center;
            padding: 0;
            margin: 0;
            list-style: none;
          }
          
          .option-list li {
            display: flex;
            margin: 0 5px;
          }
          
          .option-list button {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          /* Eye icon button */
          .text-blue-500 {
            color: #3b82f6;
          }
          
          .hover\\:text-blue-700:hover {
            color: #1d4ed8;
          }
          
          /* Make sure the action column is properly sized */
          .default-table th:last-child,
          .default-table td:last-child {
            width: 100px;
            min-width: 100px;
          }
        `}
      </style>
    </>
  );
};

export const index = JobAlertManager;
