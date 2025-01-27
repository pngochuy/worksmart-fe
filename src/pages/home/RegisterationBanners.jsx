import home22Banner1 from "../../assets/images/index-22/home22-banner-1.png";
import home22Banner2 from "../../assets/images/index-22/home22-banner-2.png";
export const RegisterationBanners = () => {
  return (
    <section className="layout-pt-60 layout-pb-60">
      <div className="auto-container">
        <div className="row wow fadeInUp">
          {/* Banner Style One */}
          <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
            <div className="inner-box">
              <div className="content">
                <h3 className="title">Employers</h3>
                <p className="text">
                  Sit amet, consectetur adipiscing elit
                  <br className="d-none d-lg-block" /> tempor incididunt.
                </p>
                <a href="#" className="theme-btn btn-style-one bdrs12">
                  Post Your Job For Free{" "}
                  <i className="fal fa-long-arrow-right ms-3"></i>
                </a>
              </div>
              <figure className="image d-none d-xl-block">
                <img src={home22Banner1} alt="" />
              </figure>
            </div>
          </div>

          {/* Banner Style Two */}
          <div className="banner-style-home22 at-home22 mb30 col-md-6 col-sm-12">
            <div className="inner-box">
              <div className="content">
                <h3 className="title">Candidate</h3>
                <p className="text">
                  Sit amet, consectetur adipiscing elit
                  <br className="d-none d-lg-block" /> tempor incididunt.
                </p>
                <a href="#" className="theme-btn btn-style-one bdrs12">
                  Upload Your CV{" "}
                  <i className="fal fa-long-arrow-right ms-3"></i>
                </a>
              </div>
              <figure className="image d-none d-xl-block">
                <img src={home22Banner2} alt="" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
