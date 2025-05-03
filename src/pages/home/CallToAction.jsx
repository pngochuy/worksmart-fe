import home22Banner3 from "../../assets/images/index-22/home22-banner-3.png";

export const CallToAction = () => {
  return (
    <section className="call-to-action at-home22">
      <div className="auto-container">
        <div className="outer-box wow fadeInUp">
          <div className="row">
            <div className="d-lg-flex align-items-center justify-content-between">
              <div className="sec-title mb-4 mb-lg-0">
                <img src={home22Banner3} alt="" />
              </div>
              <div className="sec-title mb-4 mb-lg-0">
                <h2>We Are Hiring</h2>
                <div className="text">
                  Let’s Work Together & Explore Opportunities
                </div>
              </div>
              <div className="d-block">
                <a href="/job-list" className="theme-btn btn-style-one">
                  Apply Now <i className="fal fa-long-arrow-right ms-3"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
