export const JobCategories = () => {
  return (
    <section className="job-categories border-bottom-0 pt-0">
      <div className="auto-container">
        <div className="d-flex align-items-center justify-content-between wow fadeInUp">
          <div className="sec-title">
            <h2>Popular Job Categories</h2>
            <div className="text">2020 jobs live - 293 added today.</div>
          </div>
          <a href="" className="text ud-btn2">
            View All Categories <i className="fal fa-long-arrow-right"></i>
          </a>
        </div>
        <div className="row wow fadeInUp">
          {/* Category Block */}
          <div className="category-block-two at-home22 col-xl-3 col-sm-6">
            <div className="inner-box text-start">
              <div className="content justify-content-start d-block">
                <span className="icon flaticon-money justify-content-start-1"></span>
                <p>(2 open positions)</p>
                <h4>
                  <a href="#">Accounting / Finance</a>
                </h4>
                <p className="text">
                  Sit amet, consectetur adipiscing{" "}
                  <br className="d-none d-xl-block" /> elit, sed do eiusmod.
                </p>
              </div>
            </div>
          </div>
          {/* Category Block */}
          <div className="category-block-two at-home22 col-xl-3 col-sm-6">
            <div className="inner-box text-start">
              <div className="content justify-content-start d-block">
                <span className="icon flaticon-promotion"></span>
                <p>86 open positions)</p>
                <h4>
                  <a href="#">Marketing</a>
                </h4>
                <p className="text">
                  Sit amet, consectetur adipiscing{" "}
                  <br className="d-none d-xl-block" /> elit, sed do eiusmod.
                </p>
              </div>
            </div>
          </div>
          {/* Category Block */}
          <div className="category-block-two at-home22 col-xl-3 col-sm-6">
            <div className="inner-box text-start">
              <div className="content justify-content-start d-block">
                <span className="icon flaticon-vector"></span>
                <p>43 open positions)</p>
                <h4>
                  <a href="#">Design</a>
                </h4>
                <p className="text">
                  Sit amet, consectetur adipiscing{" "}
                  <br className="d-none d-xl-block" /> elit, sed do eiusmod.
                </p>
              </div>
            </div>
          </div>
          {/* Category Block */}
          <div className="category-block-two at-home22 col-xl-3 col-sm-6">
            <div className="inner-box text-start">
              <div className="content justify-content-start d-block">
                <span className="icon flaticon-web-programming"></span>
                <p>(12 open positions)</p>
                <h4>
                  <a href="#">Development</a>
                </h4>
                <p className="text">
                  Sit amet, consectetur adipiscing{" "}
                  <br className="d-none d-xl-block" /> elit, sed do eiusmod.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
