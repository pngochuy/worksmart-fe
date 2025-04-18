import React, { useEffect, useState } from "react";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { recordProfileView } from "../../services/profileViewServices";

const CompanyProfile = ({ companyId }) => {
  const [companyData, setCompanyData] = useState({
    name: "Công ty ABC",
    logo: "/images/company-logo.png",
    industry: "Công nghệ thông tin",
    location: "Hà Nội, Việt Nam",
    description: "Công ty chuyên cung cấp giải pháp phần mềm và ứng dụng di động cho doanh nghiệp",
    employees: "50-200 nhân viên",
    website: "https://example.com",
    foundedYear: 2015
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch thông tin công ty
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Giả định API call để lấy thông tin công ty
        // const response = await fetch(`/api/companies/${companyId}`);
        // const data = await response.json();
        // setCompanyData(data);
        
        // Giả lập tải dữ liệu
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Không thể tải thông tin công ty. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [companyId]);

  // Ghi nhận lượt xem profile
  useEffect(() => {
    // Function để ghi nhận lượt xem
    const trackProfileView = async () => {
      try {
        // Lấy ID của người đang xem (nếu đã đăng nhập)
        const currentUser = getUserLoginData();
        const viewerId = currentUser ? currentUser.userID : null;
        
        // Ghi nhận lượt xem
        await recordProfileView(companyId, viewerId);
      } catch (error) {
        console.error("Failed to record profile view:", error);
      }
    };
    
    // Chỉ gọi khi component mount và khi companyId thay đổi
    trackProfileView();
  }, [companyId]);

  if (loading) {
    return (
      <div className="company-profile-loading">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-profile-error">
        <div className="alert alert-danger m-4" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-profile">
      <div className="company-profile-header">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="company-logo text-center mb-4">
              <img 
                src={companyData.logo || "/images/default-company.png"} 
                alt={companyData.name} 
                className="img-fluid rounded"
                style={{ maxHeight: "150px" }}
              />
            </div>
          </div>
          <div className="col-lg-9 col-md-8">
            <div className="company-info">
              <h2 className="company-name">{companyData.name}</h2>
              <p className="company-industry">
                <i className="la la-briefcase mr-2"></i>
                {companyData.industry}
              </p>
              <p className="company-location">
                <i className="la la-map-marker mr-2"></i>
                {companyData.location}
              </p>
              <p className="company-size">
                <i className="la la-users mr-2"></i>
                {companyData.employees}
              </p>
              <p className="company-founded">
                <i className="la la-calendar mr-2"></i>
                Thành lập: {companyData.foundedYear}
              </p>
              {companyData.website && (
                <p className="company-website">
                  <i className="la la-globe mr-2"></i>
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer">
                    {companyData.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="company-profile-content mt-4">
        <div className="card">
          <div className="card-header">
            <h4>Giới thiệu công ty</h4>
          </div>
          <div className="card-body">
            <p className="company-description">
              {companyData.description}
            </p>
          </div>
        </div>
      </div>

      <div className="company-profile-jobs mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4>Việc làm đang tuyển</h4>
            <a href={`/company/${companyId}/jobs`} className="btn btn-primary btn-sm">
              Xem tất cả
            </a>
          </div>
          <div className="card-body">
            {/* Phần này sẽ hiển thị danh sách công việc đang tuyển dụng */}
            <p className="text-center">
              Hiện chưa có dữ liệu về công việc đang tuyển.
            </p>
          </div>
        </div>
      </div>

      <div className="company-profile-reviews mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4>Đánh giá về công ty</h4>
            <button className="btn btn-outline-primary btn-sm">
              Viết đánh giá
            </button>
          </div>
          <div className="card-body">
            {/* Phần này sẽ hiển thị đánh giá về công ty */}
            <p className="text-center">
              Chưa có đánh giá nào về công ty này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;