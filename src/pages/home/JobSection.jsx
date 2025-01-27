import companyLogo from "../../assets/images/resource/company-logo/3-1.png";
import companyLogo2 from "../../assets/images/resource/company-logo/3-2.png";

export const JobSection = () => {
  return (
    <section className="job-section pt-0">
      <div className="auto-container">
        <div className="sec-title text-center wow fadeInUp">
          <h2>Featured Jobs</h2>
          <div className="text">
            Know your worth and find the job that qualify your life
          </div>
        </div>
        <div className="row wow fadeInUp">
          {/* Job Block */}
          <div className="job-block at-jlv16 col-sm-6">
            <div className="inner-box">
              <div className="tags d-flex align-items-center">
                <a className="far fa-crown" href=""></a>
                <a className="far fa-bolt" href=""></a>
                <a className="flaticon-bookmark" href=""></a>
              </div>
              <div className="content ps-0">
                <div className="d-xl-flex align-items-center">
                  <span className="company-logo position-relative">
                    <img src={companyLogo} alt="" />
                  </span>
                  <div className="ms-0 ms-xl-3 mt-3 mt-xl-0">
                    <h4 className="fz20 mb-2 mb-lg-0">
                      <a href="#">Software Engineer (Android), Libraries</a>
                    </h4>
                    <p className="mb-0">
                      by <span className="fw500 text">CreativeLayers</span> in
                      Design & Creative
                    </p>
                  </div>
                </div>
                <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                  <li className="time">Full Time</li>
                  <li className="time2">London, UK</li>
                  <li className="time2">11 hours ago</li>
                  <li className="time2">450 - $900/month</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Job Block */}
          <div className="job-block at-jlv16 active col-sm-6">
            <div className="inner-box">
              <div className="tags d-flex align-items-center">
                <a className="far fa-crown" href=""></a>
                <a className="far fa-bolt" href=""></a>
                <a className="flaticon-bookmark" href=""></a>
              </div>
              <div className="content ps-0">
                <div className="d-xl-flex align-items-center">
                  <span className="company-logo position-relative">
                    <img src={companyLogo2} alt="" />
                  </span>
                  <div className="ms-0 ms-xl-3 mt-3 mt-xl-0">
                    <h4 className="fz20 mb-2 mb-lg-0">
                      <a href="#">Software Engineer (Android), Libraries</a>
                    </h4>
                    <p className="mb-0">
                      by <span className="fw500 text">CreativeLayers</span> in
                      Design & Creative
                    </p>
                  </div>
                </div>
                <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                  <li className="time">Full Time</li>
                  <li className="time2">London, UK</li>
                  <li className="time2">11 hours ago</li>
                  <li className="time2">450 - $900/month</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
