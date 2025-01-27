import home22Cta1 from "../../assets/images/index-22/cta-1.png";
import home22Cta2 from "../../assets/images/index-22/cta-2.png";
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
                    Collaboration With Top <br />
                    Brands
                  </h2>
                  <div className="text">
                    To start searching for jobs, you can attend job fairs online
                    or <br className="d-none d-lg-block" /> in person, use job
                    boards and career websites or reach out{" "}
                    <br className="d-none d-lg-block" /> directly to recruiters
                  </div>
                </div>
                <a href="#" className="theme-btn btn-style-one bdrs12">
                  View All Brands{" "}
                  <i className="fal fa-long-arrow-right ms-3"></i>
                </a>
              </div>
            </div>

            {/* Image Column */}
            <div className="col-md-6 col-lg-5 col-sm-12">
              <figure className="image-box wow fadeInLeft">
                <img src={home22Cta1} alt="" />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="home22-cta-2">
        <div className="auto-container">
          <div className="row align-items-center">
            {/* Content Column */}
            <div className="content-column wow fadeInRight col-lg-6 col-sm-12 pe-0">
              <div className="inner-column">
                <div className="mb-0">
                  <img className="mb40" src={home22Cta2} alt="" />
                  <h4 className="title mb50">
                    Without WorkSmart i’d be homeless, they{" "}
                    <br className="d-none d-lg-block" /> found me a job and got
                    me sorted out <br className="d-none d-lg-block" /> quickly
                    with everything! Can’t quite…{" "}
                  </h4>
                  <div className="text-white fz20">Nout Golstein</div>
                  <p className="text-white">CEO, Futured & Artdirector</p>
                </div>
              </div>
            </div>
            {/* Image Column */}
            <div className="image-content position-relative wow fadeInLeft col-lg-5 col-sm-12 ps-0">
              <figure className="image-box mb-0">
                <img className="w-100" src={home22Video1} alt="" />
              </figure>
              <div className="video-box">
                <figure className="image">
                  <a
                    href="https://www.youtube.com/watch?v=Fvae8nxzVz4"
                    className="play-now"
                    data-fancybox="gallery"
                    data-caption=""
                  >
                    <i
                      className="icon flaticon-play-button-3"
                      aria-hidden="true"
                    ></i>
                  </a>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
