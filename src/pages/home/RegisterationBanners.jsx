import home22Banner1 from "../../assets/images/index-22/home22-banner-1.png";
import home22Banner2 from "../../assets/images/index-22/home22-banner-2.png";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";

export const RegisterationBanners = () => {
  const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập


  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUserLoginData();
        setUserDataLogin(user);
      }
      catch (error) {
        console.error("Error loading user data:", error);
      }
    }
    loadData();
  }, []);

  return (
    <section className="layout-pt-60 layout-pb-60">
      <div className="auto-container">
        <div className="row wow fadeInUp justify-content-center">
          {/* Banner Style One - For Employer */}
          {userDataLogin?.role === "Employer" && (
            <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <h3 className="title">Employers</h3>
                  <p className="text">
                    Sit amet, consectetur adipiscing elit
                    <br className="d-none d-lg-block" /> tempor incididunt.
                  </p>
                  <a href="/employer/post-job" className="theme-btn btn-style-one bdrs12">
                    Post Your Job{" "}
                    <i className="fal fa-long-arrow-right ms-3"></i>
                  </a>
                </div>
                <figure className="image d-none d-xl-block">
                  <img src={home22Banner1} alt="" />
                </figure>
              </div>
            </div>
          )}

          {/* Banner Style Two - For Candidate */}
          {userDataLogin?.role === "Candidate" && (
            <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <h3 className="title">Candidate</h3>
                  <p className="text">
                    Sit amet, consectetur adipiscing elit
                    <br className="d-none d-lg-block" /> tempor incididunt.
                  </p>
                  <a href="/candidate/my-cv" className="theme-btn btn-style-one bdrs12">
                    Upload Your CV{" "}
                    <i className="fal fa-long-arrow-right ms-3"></i>
                  </a>
                </div>
                <figure className="image d-none d-xl-block">
                  <img src={home22Banner2} alt="" />
                </figure>
              </div>
            </div>
          )}

          {/* Show both banners when not logged in */}
          {!userDataLogin && (
            <>
              {/* Employer Banner */}
              <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
                <div className="inner-box">
                  <div className="content">
                    <h3 className="title">Employers</h3>
                    <p className="text">
                      Sit amet, consectetur adipiscing elit
                      <br className="d-none d-lg-block" /> tempor incididunt.
                    </p>
                    <a href="/employer/post-job" className="theme-btn btn-style-one bdrs12">
                      Post Your Job{" "}
                      <i className="fal fa-long-arrow-right ms-3"></i>
                    </a>
                  </div>
                  <figure className="image d-none d-xl-block">
                    <img src={home22Banner1} alt="" />
                  </figure>
                </div>
              </div>

              {/* Candidate Banner */}
              <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
                <div className="inner-box">
                  <div className="content">
                    <h3 className="title">Candidate</h3>
                    <p className="text">
                      Sit amet, consectetur adipiscing elit
                      <br className="d-none d-lg-block" /> tempor incididunt.
                    </p>
                    <a href="/candidate/my-cv" className="theme-btn btn-style-one bdrs12">
                      Upload Your CV{" "}
                      <i className="fal fa-long-arrow-right ms-3"></i>
                    </a>
                  </div>
                  <figure className="image d-none d-xl-block">
                    <img src={home22Banner2} alt="" />
                  </figure>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
