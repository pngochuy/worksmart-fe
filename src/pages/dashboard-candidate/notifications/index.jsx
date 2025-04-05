import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "@/services/notificationServices";
import { toast } from "react-toastify";
import { useNotifications } from "@/layouts/NotificationProvider";

export const Index = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPage = 10;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchUserNotifications();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { refreshNotifications } = useNotifications();

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading({ ...actionLoading, [notificationId]: "read" });
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification.notificationID === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Refresh notification count in sidebar
      refreshNotifications();
    } catch (err) {
      toast.error("Failed to mark notification as read");
      console.error(err);
    } finally {
      setActionLoading({ ...actionLoading, [notificationId]: null });
    }
  };

  // Modified title click handler
  const handleTitleClick = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);

    // Automatically mark as read when opening notification
    if (!notification.isRead) {
      handleMarkAsRead(notification.notificationID);
    }
  };

  // Mở dialog xác nhận xóa thay vì xóa trực tiếp
  const confirmDelete = (notificationId) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  // Xóa notification sau khi xác nhận
  const handleDeleteConfirmed = async () => {
    if (!notificationToDelete) return;

    try {
      setActionLoading({ ...actionLoading, [notificationToDelete]: "delete" });
      await deleteNotification(notificationToDelete);

      // Update local state
      setNotifications(
        notifications.filter(
          (notification) => notification.notificationID !== notificationToDelete
        )
      );

      toast.success("Notification deleted successfully");
    } catch (err) {
      toast.error("Failed to delete notification");
      console.error(err);
    } finally {
      setActionLoading({ ...actionLoading, [notificationToDelete]: null });
      // Đóng dialog và reset notificationToDelete
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Trang tiếp theo
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box bo">
            <h3>Notifications</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title d-flex justify-content-between align-items-center  border-none">
                    <h4>Notifications</h4>
                    {!loading && notifications.length > 0 && (
                      <button
                        className="theme-btn btn-style-one btn-small px-2 py-2"
                        onClick={loadNotifications}
                      >
                        <i className="la la-refresh mr-1"></i> Refresh
                      </button>
                    )}
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      {loading ? (
                        <div className="text-center py-4">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading notifications...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-4 text-danger">
                          {error}
                        </div>
                      ) : (
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Message</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {notifications.length > 0 ? (
                              currentItems.map((notification) => (
                                <tr
                                  key={notification.notificationID}
                                  className={
                                    notification.isRead
                                      ? ""
                                      : "fw-bold bg-light"
                                  }
                                >
                                  <td
                                    className="fw-bold notification-title"
                                    onClick={() =>
                                      handleTitleClick(notification)
                                    }
                                  >
                                    {notification.title}
                                    {!notification.isRead && (
                                      <span className="new-badge">New</span>
                                    )}
                                  </td>
                                  <td>{notification.message}</td>
                                  <td>{formatDate(notification.createdAt)}</td>
                                  <td>
                                    <div className="btn-group">
                                      <button
                                        className="theme-btn btn-style-two small"
                                        onClick={() =>
                                          confirmDelete(
                                            notification.notificationID
                                          )
                                        }
                                        disabled={
                                          actionLoading[
                                            notification.notificationID
                                          ] === "delete"
                                        }
                                      >
                                        {actionLoading[
                                          notification.notificationID
                                        ] === "delete" ? (
                                          <>
                                            <i className="la la-spinner fa-spin mr-1"></i>{" "}
                                            Deleting...
                                          </>
                                        ) : (
                                          <>
                                            <i className="la la-trash mr-1"></i>{" "}
                                            Delete
                                          </>
                                        )}
                                      </button>
                                      {!notification.isRead && (
                                        <button
                                          className="theme-btn btn-style-three small"
                                          onClick={() =>
                                            handleMarkAsRead(
                                              notification.notificationID
                                            )
                                          }
                                          disabled={
                                            actionLoading[
                                              notification.notificationID
                                            ] === "read"
                                          }
                                        >
                                          {actionLoading[
                                            notification.notificationID
                                          ] === "read" ? (
                                            <>
                                              <i className="la la-spinner fa-spin mr-1"></i>{" "}
                                              Marking...
                                            </>
                                          ) : (
                                            <>
                                              <i className="la la-check mr-1"></i>{" "}
                                              Mark Read
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-4">
                                  <div className="empty-state">
                                    <i className="la la-bell-slash la-3x text-muted mb-3"></i>
                                    <p>No notifications found</p>
                                    <button
                                      className="theme-btn btn-style-one small mt-2"
                                      onClick={loadNotifications}
                                    >
                                      <i className="la la-refresh mr-1"></i>{" "}
                                      Refresh
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}

                      {/* Thêm phân trang */}
                      {!loading && notifications.length > 0 && (
                        <div className="pagination-container mt-4 d-flex justify-content-center">
                          <nav aria-label="Notification pagination">
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
      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              className="delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedNotification?.title}</AlertDialogTitle>
            <AlertDialogDescription className="notification-detail">
              <div className="notification-message">
                <p>{selectedNotification?.message}</p>
              </div>
              <div className="notification-date mt-3">
                <i>
                  Received:{" "}
                  {selectedNotification &&
                    formatDate(selectedNotification.createdAt)}
                </i>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* {selectedNotification && !selectedNotification.isRead && (
              <button
                className="theme-btn btn-style-three small"
                onClick={() => {
                  handleMarkAsRead(selectedNotification.notificationID);
                  setDetailDialogOpen(false);
                }}
              >
                <i className="la la-check mr-1"></i> Mark as Read
              </button>
            )} */}
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>
        {`

          /* Add this to your styles section */
.notification-title {
  cursor: pointer;
  align-items: center;
  gap: 10px;
}

.notification-title:hover {
  text-decoration: underline;
  color: #2361ff;
}

.new-badge {
  display: inline-block;
  background-color: #ff3333;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.notification-detail {
  padding: 15px 0;
}


          /* Notification styling */
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }

          .status-badge.unread {
            background-color: #e7f0ff;
            color: #2361ff;
          }

          .status-badge.read {
            background-color: #e9ecef;
            color: #495057;
          }

          /* Table styling */
          .default-table td {
            vertical-align: middle;
          }

          .default-table td:nth-child(2) {
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Button styling */
          .theme-btn.small {
            padding: 5px 12px;
            font-size: 13px;
            margin-right: 5px;
          }

          .theme-btn.btn-style-two {
            background-color: #ff5a5a;
            color: white;
          }

          .theme-btn.btn-style-two:hover {
            background-color: #ff3333;
          }

          .theme-btn.btn-style-three {
            background-color: #e9ecef;
            color: #495057;
          }

          .theme-btn.btn-style-three:hover {
            background-color: #dde1e5;
          }

          /* Empty state styling */
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #6c757d;
          }
          
          /* Pagination styling */
          .pagination-container {
            margin-top: 20px;
          }
          
          .pagination .page-link {
            color: #2361ff;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
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
          
          /* Styling cho nút Delete trong dialog */
          .delete-btn {
            background-color: #dc3545 !important;
            color: white !important;
          }
          
          .delete-btn:hover {
            background-color: #c82333 !important;
          }
        `}
      </style>
    </>
  );
};
