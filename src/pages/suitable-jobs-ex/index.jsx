import { useState, useEffect } from "react";
import { getCVsByUserId } from "@/services/cvServices";
import {
  recommendJobsForUser,
  getCachedRecommendations,
} from "./recommendationService";
import { Link } from "react-router-dom";

export const Index = () => {
  const [userId, setUserId] = useState(null);
  const [userCVs, setUserCVs] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);

  const getUserId = () => {
    const userDataString = localStorage.getItem("userLoginData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.userID;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  };

  const checkForUpdates = async (userId) => {
    try {
      // Timestamps từ localStorage
      const lastCVCheck = parseInt(
        localStorage.getItem(`cv_last_checked_${userId}`) || "0"
      );
      const lastJobCheck = parseInt(
        localStorage.getItem(`jobs_last_checked`) || "0"
      );

      // Lấy CV mới nhất
      const latestCVData = await getCVsByUserId(userId);

      // Tìm timestamp mới nhất từ CV
      let latestCVTimestamp = 0;
      if (latestCVData && latestCVData.length > 0) {
        latestCVTimestamp = Math.max(
          ...latestCVData.map((cv) => {
            const updateTime = cv.updatedAt
              ? new Date(cv.updatedAt).getTime()
              : 0;
            const createTime = cv.createdAt
              ? new Date(cv.createdAt).getTime()
              : 0;
            return Math.max(updateTime, createTime);
          })
        );
      }

      // Lấy thời gian cập nhật công việc mới nhất
      const latestJobTimestamp = parseInt(
        localStorage.getItem("latest_job_update") || "0"
      );

      console.log("CV check:", {
        lastCVCheck,
        latestCVTimestamp,
        hasUpdates: latestCVTimestamp > lastCVCheck,
      });
      console.log("Job check:", {
        lastJobCheck,
        latestJobTimestamp,
        hasUpdates: latestJobTimestamp > lastJobCheck,
      });

      // Kiểm tra cập nhật
      return {
        hasUpdates:
          latestCVTimestamp > lastCVCheck || latestJobTimestamp > lastJobCheck,
        latestCVTimestamp,
        latestJobTimestamp,
      };
    } catch (err) {
      console.error("Lỗi khi kiểm tra cập nhật:", err);
      return { hasUpdates: false };
    }
  };

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Kiểm tra thay đổi CV và công việc định kỳ
  useEffect(() => {
    if (!userId) return;

    const runUpdateCheck = async () => {
      const result = await checkForUpdates(userId);
      setHasUpdates(result.hasUpdates);
    };

    // Chạy kiểm tra ban đầu
    runUpdateCheck();

    // Thiết lập kiểm tra định kỳ
    const intervalId = setInterval(runUpdateCheck, 30 * 1000); // 5 phút

    return () => clearInterval(intervalId);
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Kiểm tra xem có đề xuất đã lưu trong cache không
      const cachedData = getCachedRecommendations(userId);
      console.log("Dữ liệu từ cache:", cachedData);

      if (cachedData) {
        // Lọc dữ liệu không hợp lệ trước khi hiển thị
        if (
          cachedData.recommendations &&
          Array.isArray(cachedData.recommendations)
        ) {
          cachedData.recommendations = cachedData.recommendations.filter(
            (job) => {
              return (
                job &&
                typeof job === "object" &&
                job.jobId &&
                job.jobTitle &&
                job.company &&
                typeof job.matchPercentage === "number" &&
                !isNaN(job.matchPercentage)
              );
            }
          );
        }
        setRecommendations(cachedData);
        // Vẫn tiếp tục lấy CV nhưng không cần đợi
        fetchUserCVs(false);
        setLoading(false);
        return;
      }

      // Không có cache, thực hiện lấy CV và đề xuất mới
      await fetchUserCVs(true);

      // Lấy đề xuất dựa trên tất cả CV
      const result = await recommendJobsForUser(userId);
      console.log("Kết quả đề xuất:", result);

      // Lọc dữ liệu không hợp lệ
      if (result.recommendations && Array.isArray(result.recommendations)) {
        result.recommendations = result.recommendations.filter((job) => {
          return (
            job &&
            typeof job === "object" &&
            job.jobId &&
            job.jobTitle &&
            job.company &&
            typeof job.matchPercentage === "number" &&
            !isNaN(job.matchPercentage)
          );
        });
      }

      setRecommendations(result);
    } catch (err) {
      setError("Lỗi trong quá trình đề xuất công việc: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCVs = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const cvs = await getCVsByUserId(userId);
      console.log("CVs nhận được:", cvs);

      if (cvs && cvs.length > 0) {
        setUserCVs(cvs);
      } else {
        setUserCVs([]);
        setError("Không tìm thấy CV nào cho người dùng này");
      }
    } catch (err) {
      setError("Lỗi khi lấy danh sách CV: " + err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true); // Bắt đầu làm mới
      setError("");
      setHasUpdates(false); // Đã xử lý cập nhật

      // Xóa cache và lấy đề xuất mới
      localStorage.removeItem(`job_recommendations_${userId}_all`);

      // Cập nhật danh sách CV trước
      await fetchUserCVs(false);

      // Lấy đề xuất mới
      const result = await recommendJobsForUser(userId);

      // Lọc dữ liệu không hợp lệ
      if (result.recommendations && Array.isArray(result.recommendations)) {
        result.recommendations = result.recommendations.filter((job) => {
          return (
            job &&
            typeof job === "object" &&
            job.jobId &&
            job.jobTitle &&
            job.company &&
            typeof job.matchPercentage === "number" &&
            !isNaN(job.matchPercentage)
          );
        });
      }

      setRecommendations(result);

      // Cập nhật timestamps
      const updateResult = await checkForUpdates(userId);
      localStorage.setItem(
        `cv_last_checked_${userId}`,
        updateResult.latestCVTimestamp.toString()
      );
      localStorage.setItem(`jobs_last_checked`, Date.now().toString());
    } catch (err) {
      setError("Lỗi khi làm mới đề xuất: " + err.message);
    } finally {
      setRefreshing(false); // Kết thúc làm mới
    }
  };

  // Hiển thị skeleton loader khi đang tải
  const renderSkeletonLoader = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div
            key={index}
            className="p-5 border rounded-lg bg-white animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mt-3"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mt-1"></div>
            <div className="mt-4 flex justify-end">
              <div className="h-8 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyState = (title, message) => (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
      <svg
        className="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">{message}</p>
    </div>
  );

  const renderRecommendationList = () => {
    if (!recommendations || !recommendations.recommendations) {
      return renderEmptyState(
        "Không tìm thấy đề xuất",
        "Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
      );
    }

    // Lọc các đề xuất hợp lệ
    const validRecommendations = recommendations.recommendations.filter(
      (job) => {
        return (
          job &&
          typeof job === "object" &&
          job.jobId &&
          job.jobTitle &&
          job.company &&
          typeof job.matchPercentage === "number" &&
          !isNaN(job.matchPercentage)
        );
      }
    );

    if (validRecommendations.length === 0) {
      return renderEmptyState(
        "Không tìm thấy đề xuất hợp lệ",
        "Vui lòng thử làm mới đề xuất hoặc liên hệ hỗ trợ."
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {validRecommendations.map((job, index) => (
          <div
            key={index}
            className="p-5 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                  {job.jobTitle}
                </h3>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {job.company}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-medium text-sm ${
                  job.matchPercentage >= 80
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : job.matchPercentage >= 60
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
              >
                {job.matchPercentage}% matching
              </span>
            </div>
            <p className="mt-3 text-gray-700 line-clamp-2">{job.reason}</p>
            <div className="mt-4 flex justify-end">
              <Link
                to={`/job-list/${encodeURIComponent(job.jobId)}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Xem Chi Tiết
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    // Thêm margin-top để tránh bị chèn vào header, tạo khoảng cách phân biệt
    <div className="bg-gray-100 min-h-screen" style={{ paddingTop: "70px" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Phần đề xuất công việc */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Công việc đề xuất
            </h2>
            <button
              onClick={refreshRecommendations}
              disabled={loading || refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loading || refreshing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors shadow-sm`}
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang làm mới...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>{hasUpdates ? "Cập nhật ngay" : "Làm mới"}</span>
                </>
              )}
            </button>
          </div>

          {/* Thông báo có cập nhật mới */}
          {hasUpdates && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <span className="font-medium">Phát hiện thay đổi!</span>
                <span className="ml-1">
                  CV hoặc danh sách công việc đã được cập nhật. Nhấn "Cập nhật
                  ngay" để xem đề xuất mới nhất.
                </span>
              </div>
            </div>
          )}

          {userCVs.length > 0 && (
            <div className="mb-6 px-1">
              <p className="text-gray-600 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Đề xuất dựa trên {userCVs.length} CV của bạn
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>
                    Đang phân tích CV và tìm kiếm công việc phù hợp...
                  </span>
                </div>
              </div>
              {renderSkeletonLoader()}
            </div>
          ) : refreshing ? (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang cập nhật đề xuất công việc mới nhất...</span>
                </div>
              </div>
              {renderSkeletonLoader()}
            </div>
          ) : (
            renderRecommendationList()
          )}
        </div>

        {/* Phần CV của người dùng */}
        {userCVs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                CV của bạn ({userCVs.length})
              </h2>
              <Link
                to="/candidate/my-cv"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
              >
                Quản lý CV
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCVs.map((cv) => (
                <div
                  key={cv.cvid}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 line-clamp-1">
                        {cv.title || cv.fileName || `CV #${cv.cvid}`}
                      </h3>
                      {cv.updatedAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cập nhật:{" "}
                          {new Date(cv.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link
                      to="/candidate/my-cv"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      Xem CV
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
