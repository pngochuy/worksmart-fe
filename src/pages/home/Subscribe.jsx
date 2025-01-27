import newslatterImg1 from "../../assets/images/index-22/newslatter-img-1.png";

export const Subscribe = () => {
  return (
    <section className="subscribe-section at-home22 py-xl-0">
      <div className="auto-container">
        <div className="outer-box wow fadeInUp">
          <div className="home22-newslatter-img d-none d-xl-block">
            <img src={newslatterImg1} alt="" />
          </div>
          <div className="sec-title">
            <h2 className="text-white">Subscribe Our Newsletter</h2>
            <div className="text-white">
              Advertise your jobs to millions of monthly users and search
              <br /> 15.8 million CVs in our database.
            </div>
          </div>
          <div className="form-column">
            <div className="subscribe-form">
              <form method="post" action="#">
                <div className="form-group">
                  <div className="response"></div>
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    className="email"
                    value=""
                    placeholder="Your e-mail"
                    required
                  />
                  <button
                    type="button"
                    id="subscribe-newslatters"
                    className="theme-btn btn-style-one"
                  >
                    Subscribe <i className="fal fa-long-arrow-right ms-3"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
