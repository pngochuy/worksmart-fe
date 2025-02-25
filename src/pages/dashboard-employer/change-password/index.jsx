export const index = () => {
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Change Password</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          {/* Ls widget */}
          <div className="ls-widget">
            <div className="widget-title">
              <h4>Change Password</h4>
            </div>

            <div className="widget-content">
              <form className="default-form">
                <div className="row">
                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>Old Password </label>
                    <input type="password" name="name" placeholder="" />
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>New Password</label>
                    <input type="password" name="name" placeholder="" />
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>Confirm Password</label>
                    <input type="password" name="name" placeholder="" />
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-6 col-md-12">
                    <button className="theme-btn btn-style-one">Update</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
