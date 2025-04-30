import home22City1 from "../../assets/images/index-22/home22-city-1.png";
import home22City2 from "../../assets/images/index-22/home22-city-2.png";
import home22City3 from "../../assets/images/index-22/home22-city-3.png";
import home22City4 from "../../assets/images/index-22/home22-city-4.png";
import home22City5 from "../../assets/images/index-22/home22-city-5.png";
import { getJobLocationDashboard } from "../../services/dashboardServices";
import { useState, useEffect } from "react";

// Object ánh xạ tên thành phố với hình ảnh tương ứng
const cityImages = {
  "Ha Noi": home22City1,
  "Ho Chi Minh": home22City2,
  "Da Nang": home22City3,
  "Can Tho": home22City5,
  "Others": home22City4,
};

// Hình ảnh mặc định nếu không tìm thấy thành phố trong cityImages
const defaultCityImage = home22City4;

export const PopularCity = () => {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch location data
        const locationResponse = await getJobLocationDashboard();
        setLocationData(locationResponse);
        setError(null);
      } catch (error) {
        console.error("Error fetching location data:", error);
        setError("Không thể tải dữ liệu thành phố. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  // Hàm lấy hình ảnh dựa trên tên thành phố
  const getCityImage = (cityName) => {
    return cityImages[cityName] || defaultCityImage;
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <section className="job-categories border-bottom-0">
        <div className="auto-container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Đang tải dữ liệu thành phố...</p>
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <section className="job-categories border-bottom-0">
        <div className="auto-container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="job-categories border-bottom-0">
      <div className="auto-container">
        <div className="d-flex align-items-center justify-content-between wow fadeInUp">
          <div className="sec-title">
            <h2>Popular Cities</h2>
            <div className="text">
              Know your worth and find the job that qualify your life
            </div>
          </div>
          {/* <a href="/cities" className="text ud-btn2">
            View All Cities <i className="fal fa-long-arrow-right"></i>
          </a> */}
        </div>
        <div className="row wow fadeInUp">
          {locationData.length > 0 ? (
            locationData.map((city, index) => (
              <div key={index} className="col-sm-6 col-md-4 col-lg-3">
                <div className="d-flex align-items-center mb30">
                  <div className="thumb mr20">
                    <img src={getCityImage(city.name)} alt={city.name} />
                  </div>
                  <div className="details">
                    <h5 className="mb-0 fz18 fw500">{city.name}</h5>
                    <p className="text">
                      {city.jobCount?.toLocaleString()} Jobs
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-4">
              <p>No City Data Available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};