import home22Cta1 from "../../assets/images/index-22/cta-1.png";
import home22Cta2 from "../../assets/images/index-22/cta-2.png";
import home22Cta4 from "../../assets/images/index-22/cta-4.jpg";
import home22Video1 from "../../assets/images/index-22/home22-video-img1.jpg";

export const CTA = () => {
  return (
    <>
      <section className="home22-cta-1 mx-auto bdrs12">
        <div className="auto-container">
          <div className="row align-items-center">
            {/* Content Column */}
            <div className="col-md-6 col-lg-5 offset-lg-1 col-sm-12">
              <div className="inner-column mb-3 mb-md-0 wow fadeInRight">
                <div className="mb-4">
                  <h2 className="fw-600 mb20">
                    Connect With Top-Tier <br />
                    Employers
                  </h2>
                  <div className="text">
                    Our platform connects candidates with 500+ prestigious companies
                    <br className="d-none d-lg-block" /> across diverse industries, giving you access to high-quality
                    <br className="d-none d-lg-block" /> job opportunities that perfectly match your skills
                  </div>
                </div>
                <a href="/company-list" className="theme-btn btn-style-one bdrs12">
                  Explore Employers{" "}
                  <i className="fal fa-long-arrow-right ms-3"></i>
                </a>
              </div>
            </div>

            {/* Image Column */}
            <div className="col-md-6 col-lg-5 col-sm-12">
              <figure className="image-box wow fadeInLeft">
                <img src={home22Cta1} alt="Partner companies" />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="home22-cta-2">
        <div className="auto-container">
          <div className="row align-items-center">
            {/* Content Column */}
            <div className="content-column wow fadeInRight col-lg-6 col-sm-12 pe-0" style={{ backgroundColor: "#547baf" }}>
              <div className="inner-column">
                <div className="mb-0">
                  <img className="mb40" src={home22Cta2} alt="User testimonial" />
                  <h4 className="title mb50">
                    "AI is transforming recruitment. The future of hiring isn't just about matching skills –
                    it's about understanding potential and predicting success. Smart platforms that leverage AI
                    will revolutionize how we connect talent with opportunity."{" "}
                    <br className="d-none d-lg-block" />
                  </h4>
                  <div className="text-white fz20">
                    <a
                      href="https://www.linkedin.com/in/satyanadella/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-200 transition-colors"
                    >
                      Satya Nadella
                    </a>
                  </div>
                  <p className="text-white">CEO, Microsoft</p>
                </div>
              </div>
            </div>
            {/* Image Column */}
            <div className="image-content position-relative wow fadeInLeft col-lg-5 col-sm-12 ps-0">
              <figure className="image-box mb-0">
                <img className="w-100" src={home22Cta4} alt="Platform introduction video" />
              </figure>
              {/* <div className="video-box">
                <figure className="image">
                  <a
                    href="https://www.youtube.com/watch?v=Fvae8nxzVz4"
                    className="play-now"
                    data-fancybox="gallery"
                    data-caption="See how our platform can accelerate your career growth"
                  >
                    <i
                      className="icon flaticon-play-button-3"
                      aria-hidden="true"
                    ></i>
                  </a>
                </figure>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};