import home22City1 from "../../assets/images/index-22/home22-city-1.png";
import home22City2 from "../../assets/images/index-22/home22-city-2.png";
import home22City3 from "../../assets/images/index-22/home22-city-3.png";
import home22City4 from "../../assets/images/index-22/home22-city-4.png";
import home22City5 from "../../assets/images/index-22/home22-city-5.png";
export const PopularCity = () => {
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
          <a href="" className="text ud-btn2">
            View All Cities <i className="fal fa-long-arrow-right"></i>
          </a>
        </div>
        <div className="row wow fadeInUp">
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb30">
              <div className="thumb mr20">
                <img src={home22City1} alt="" />
              </div>
              <div className="details">
                <h5 className="mb-0 fz18 fw500">Ha Noi City</h5>
                <p className="text">96 Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb30">
              <div className="thumb mr20">
                <img src={home22City2} alt="" />
              </div>
              <div className="details">
                <h5 className="mb-0 fz18 fw500">Ho Chi Minh City</h5>
                <p className="text">96 Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb30">
              <div className="thumb mr20">
                <img src={home22City3} alt="" />
              </div>
              <div className="details">
                <h5 className="mb-0 fz18 fw500">Da Nang City</h5>
                <p className="text">96 Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb30">
              <div className="thumb mr20">
                <img src={home22City4} alt="" />
              </div>
              <div className="details">
                <h5 className="mb-0 fz18 fw500">Hue</h5>
                <p className="text">96 Jobs</p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4 col-lg-3">
            <div className="d-flex align-items-center mb30">
              <div className="thumb mr20">
                <img src={home22City5} alt="" />
              </div>
              <div className="details">
                <h5 className="mb-0 fz18 fw500">Can Tho</h5>
                <p className="text">96 Jobs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
