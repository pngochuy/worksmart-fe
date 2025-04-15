import { useState, useEffect } from 'react';
import { getCVsByUserId } from '@/services/cvServices';
import { recommendJobsForUser, getCachedRecommendations } from './recommendationService';
import { Link } from "react-router-dom";

export const Index = () => {
  const [userId, setUserId] = useState(null);
  const [userCVs, setUserCVs] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
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

  // Lấy thông tin CV và đề xuất ngay khi xác định được userId
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Kiểm tra thay đổi CV và công việc định kỳ (mỗi 5 phút)
  useEffect(() => {
    if (!userId) return;
    
    const checkForUpdates = async () => {
      try {
        // Lấy timestamps mới nhất từ localStorage
        const lastCVCheck = localStorage.getItem(`cv_last_checked_${userId}`) || '0';
        const lastJobCheck = localStorage.getItem(`jobs_last_checked`) || '0';
        
        // Gọi API để kiểm tra timestamp mới nhất của CV và công việc
        const latestCVData = await getCVsByUserId(userId);
        const latestCVTimestamp = latestCVData && latestCVData.length > 0 
          ? Math.max(...latestCVData.map(cv => new Date(cv.updatedAt || cv.createdAt).getTime()))
          : 0;
          
        // Giả định có một API để lấy thời gian cập nhật công việc mới nhất
        // const latestJobTimestamp = await getLatestJobUpdateTimestamp();
        const latestJobTimestamp = localStorage.getItem('latest_job_update') || '0';
        
        // So sánh với timestamp đã lưu
        if (latestCVTimestamp > parseInt(lastCVCheck) || parseInt(latestJobTimestamp) > parseInt(lastJobCheck)) {
          setHasUpdates(true);
        }
        
        // Cập nhật thời gian kiểm tra
        localStorage.setItem(`cv_last_checked_${userId}`, latestCVTimestamp.toString());
        localStorage.setItem(`jobs_last_checked`, latestJobTimestamp);
      } catch (err) {
        console.error("Lỗi khi kiểm tra cập nhật:", err);
      }
    };
    
    // Chạy kiểm tra ban đầu
    checkForUpdates();
    
    // Thiết lập kiểm tra định kỳ
    const intervalId = setInterval(checkForUpdates, 5 * 60 * 1000); // Kiểm tra mỗi 5 phút
    
    return () => clearInterval(intervalId); // Dọn dẹp khi component unmount
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Kiểm tra xem có đề xuất đã lưu trong cache không
      const cachedData = getCachedRecommendations(userId);
      console.log("Dữ liệu từ cache:", cachedData);

      if (cachedData) {
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

      setRecommendations(result);
    } catch (err) {
      setError('Lỗi trong quá trình đề xuất công việc: ' + err.message);
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
        setError('Không tìm thấy CV nào cho người dùng này');
      }
    } catch (err) {
      setError('Lỗi khi lấy danh sách CV: ' + err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    try {
      setRefreshing(true); // Bắt đầu làm mới
      setError('');
      setHasUpdates(false); // Đã xử lý cập nhật
      
      // Xóa cache và lấy đề xuất mới
      localStorage.removeItem(`job_recommendations_${userId}_all`);
      const result = await recommendJobsForUser(userId);
      setRecommendations(result);
      
      // Cập nhật thời gian kiểm tra sau khi làm mới
      const cvs = await getCVsByUserId(userId);
      const latestCVTimestamp = cvs && cvs.length > 0 
        ? Math.max(...cvs.map(cv => new Date(cv.updatedAt || cv.createdAt).getTime()))
        : Date.now();
      
      localStorage.setItem(`cv_last_checked_${userId}`, latestCVTimestamp.toString());
      localStorage.setItem(`jobs_last_checked`, Date.now().toString());
      
      // Hiển thị thông báo thành công
      showToast("Đã cập nhật đề xuất công việc mới nhất!");
    } catch (err) {
      setError('Lỗi khi làm mới đề xuất: ' + err.message);
    } finally {
      setRefreshing(false); // Kết thúc làm mới
    }
  };
  
  // Hàm hiển thị thông báo tạm thời
  const [toast, setToast] = useState({show: false, message: ''});
  
  const showToast = (message) => {
    setToast({show: true, message});
    setTimeout(() => setToast({show: false, message: ''}), 3000);
  };

  // Hiển thị skeleton loader khi đang tải
  const renderSkeletonLoader = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border rounded bg-gray-50 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center">Công việc phù hợp với bạn</h1>
          <p className="text-center text-gray-600 mt-2">Dựa trên phân tích tất cả CV của bạn</p>
        </header>
        
        {/* Thông báo toast */}
        {toast.show && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
            {toast.message}
          </div>
        )}
        
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Công việc đề xuất dành cho bạn</h2>
              <button 
                onClick={refreshRecommendations}
                disabled={loading || refreshing}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  loading || refreshing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang làm mới...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    <span>Làm mới</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Thông báo có cập nhật mới */}
            {hasUpdates && (
              <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>CV hoặc danh sách công việc đã được cập nhật. Nhấn "Làm mới" để cập nhật đề xuất.</span>
                </div>
                <button 
                  onClick={refreshRecommendations}
                  disabled={refreshing}
                  className="text-yellow-800 font-medium hover:text-yellow-900"
                >
                  Cập nhật ngay
                </button>
              </div>
            )}
            
            {userCVs.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-600">Đề xuất dựa trên {userCVs.length} CV của bạn</p>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {loading ? (
              <div>
                <p className="text-center text-gray-500 mb-4">Đang phân tích CV và tìm kiếm công việc phù hợp...</p>
                {renderSkeletonLoader()}
              </div>
            ) : refreshing ? (
              <div>
                <p className="text-center text-gray-500 mb-4">Đang cập nhật đề xuất công việc mới nhất...</p>
                {renderSkeletonLoader()}
              </div>
            ) : recommendations && recommendations.recommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.recommendations.map((job, index) => (
                  <div key={index} className="p-4 border rounded bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{job.jobTitle}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        job.matchPercentage >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : job.matchPercentage >= 60 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.matchPercentage}% phù hợp
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{job.reason}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        <Link to={`/job-list/${encodeURIComponent(job.jobId)}`}>
                          Xem Chi Tiết
                        </Link>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đề xuất</h3>
                <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
              </div>
            )}
          </div>
          
          {/* Thông tin về CV */}
          {userCVs.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">CV của bạn ({userCVs.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCVs.map((cv) => (
                  <div key={cv.cvid} className="p-4 border rounded hover:bg-gray-50">
                    <h3 className="font-medium mb-2">{cv.title || cv.fileName || `CV #${cv.cvid}`}</h3>
                    {cv.updatedAt && (
                      <p className="text-sm text-gray-500">
                        Cập nhật: {new Date(cv.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-2 flex justify-end">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Xem CV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}