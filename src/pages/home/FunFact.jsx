export const FunFact = () => {
  return (
    <div className="fun-fact-section style-two">
      <div className="auto-container">
        <div className="row wow fadeInUp">
          {/*Column*/}
          <div className="counter-column col-lg-4 col-md-6 col-sm-12 wow fadeInUp">
            <div className="count-box dark-color">
              <span className="count-text" data-speed="3000" data-stop="4">
                0
              </span>
              M
            </div>
            <h4 className="counter-title">4 million daily active users</h4>
          </div>

          {/*Column*/}
          <div
            className="counter-column col-lg-4 col-md-6 col-sm-12 wow fadeInUp"
            data-wow-delay="400ms"
          >
            <div className="count-box dark-color">
              <span className="count-text" data-speed="3000" data-stop="12">
                0
              </span>
              k
            </div>
            <h4 className="counter-title">Over 12k open job positions</h4>
          </div>

          {/*Column*/}
          <div
            className="counter-column col-lg-4 col-md-6 col-sm-12 wow fadeInUp"
            data-wow-delay="800ms"
          >
            <div className="count-box dark-color">
              <span className="count-text" data-speed="3000" data-stop="20">
                0
              </span>
              M
            </div>
            <h4 className="counter-title">Over 20 million stories shared</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
