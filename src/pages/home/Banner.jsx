import home22HeroImg1 from "../../assets/images/index-22/home22-hero-img1.png";
import client1Img from "../../assets/images/index-22/client-1.png";
import client2Img from "../../assets/images/index-22/client-2.png";
import client3Img from "../../assets/images/index-22/client-3.png";
import client4Img from "../../assets/images/index-22/client-4.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Banner = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitting search from home:", { title, location });

    // Tạo query params cho URL
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (location) params.append("location", location);

    // Thêm flag expand vào cả URL và state
    params.append("expand", "true");

    // Điều hướng với đầy đủ thông tin
    navigate(`/job-list?${params.toString()}`, {
      state: {
        title,
        location,
        expand: true, // Thêm flag expand vào state
      },
    });
  };

  return (
    <section className="banner-section-three at-home22">
      <div className="auto-container">
        <div className="row">
          <div className="content-column col-lg-7 col-md-12 col-sm-12">
            <div className="inner-column">
              <div className="title-box wow fadeInUp">
                <h3>
                  Join us & Explore Thousands <br /> of Jobs
                </h3>
                <div className="text">
                  Find Jobs, Employment & Career Opportunities
                </div>
              </div>

              {/* Job Search Form */}
              <div
                className="job-search-form-two wow fadeInUp"
                data-wow-delay="200ms"
              >
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="form-group col-lg-5 col-md-12 col-sm-12">
                      <label className="title">What</label>
                      <span className="icon flaticon-search-1"></span>
                      <input
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Job title, keywords, or company"
                      />
                    </div>
                    {/* Form Group */}
                    <div className="form-group col-lg-4 col-md-12 col-sm-12 location">
                      <label className="title">Where</label>
                      <span className="icon flaticon-map-locator"></span>
                      <input
                        type="text"
                        name="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City or location"
                      />
                    </div>
                    {/* Form Group */}
                    <div className="form-group col-lg-3 col-md-12 col-sm-12 btn-box">
                      <button type="submit" className="theme-btn btn-style-one">
                        <span className="btn-title">Find Jobs</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {/* Job Search Form */}

              {/* Popular Search */}
              <div
                className="popular-searches wow fadeInUp"
                data-wow-delay="400ms"
              >
                <span className="title">Popular Searches : </span>
                <a href="#">Designer</a>,<a href="#">Developer</a>,
                <a href="#">Web</a>,<a href="#">IOS</a>,<a href="#">PHP</a>,
                <a href="#">Senior</a>,<a href="#">Engineer</a>,
              </div>
              {/* End Popular Search */}
            </div>
          </div>

          <div className="image-column col-lg-5 col-md-12">
            <div className="image-box ms-0 mt50">
              <figure
                className="main-image wow fadeInRight"
                data-wow-delay="1500ms"
              >
                <img className="w-100" src={home22HeroImg1} alt="" />
              </figure>
            </div>
          </div>
        </div>
        {/*  */}
      </div>
    </section>
  );
};
