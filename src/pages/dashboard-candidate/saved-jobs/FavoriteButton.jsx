import React, { useState, useEffect } from 'react';
import { checkJobIsFavorite, addJobToFavorites, removeJobFromFavorites } from '../../../services/favoriteJobService';

const FavoriteButton = ({ jobId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteJobId, setFavoriteJobId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy userId từ localStorage hoặc context/redux state
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id;
  };

  const userId = getUserId();

  // Kiểm tra xem công việc có nằm trong danh sách yêu thích không khi component được tải
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId && jobId) {
        try {
          setIsLoading(true);
          const result = await checkJobIsFavorite(userId, jobId);
          setIsFavorite(result.isFavorite);
          setFavoriteJobId(result.favoriteJobId);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [userId, jobId]);

  // Chuyển đổi trạng thái yêu thích
  const toggleFavorite = async () => {
    if (!userId) {
      // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
      window.location.href = '/login';
      return;
    }

    try {
      setIsLoading(true);
      
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        await removeJobFromFavorites(favoriteJobId);
        setIsFavorite(false);
        setFavoriteJobId(null);
      } else {
        // Thêm vào danh sách yêu thích
        const result = await addJobToFavorites(userId, jobId);
        setIsFavorite(true);
        setFavoriteJobId(result.favoriteJobID);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu người dùng chưa đăng nhập, không hiển thị nút yêu thích
  if (!userId) {
    return null;
  }

  return (
    <button 
      className={`bookmark-btn ${isFavorite ? 'bookmarked' : ''}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={isFavorite ? "Remove from Saved Jobs" : "Save Job"}
    >
      {isLoading ? (
        <span className="loading-icon">
          <i className="fa fa-spinner fa-spin"></i>
        </span>
      ) : (
        <span className={`la ${isFavorite ? 'la-heart' : 'la-heart-o'}`}></span>
      )}
    </button>
  );
};

export default FavoriteButton;