export const index = () => {
  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>My Resume</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Profile</h4>
                  </div>

                  <div className="widget-content">
                    <form className="default-form">
                      <div className="row">
                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Select Your CV</label>
                          <select className="chosen-select">
                            <option>My CV</option>
                          </select>
                        </div>

                        {/* About Company */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Description</label>
                          <textarea placeholder="Spent several years working on sheep on Wall Street. Had moderate success investing in Yugo's on Wall Street. Managed a small team buying and selling Pogo sticks for farmers. Spent several years licensing licorice in West Palm Beach, FL. Developed several new methods for working it banjos in the aftermarket. Spent a weekend importing banjos in West Palm Beach, FL.In this position, the Software Engineer collaborates with Evention's Development team to continuously enhance our current software solutions as well as create new solutions to eliminate the back-office operations and management challenges present"></textarea>
                        </div>

                        <div className="form-group col-lg-12 col-md-12">
                          {/* Resume / Education */}
                          <div className="resume-outer">
                            <div className="upper-title">
                              <h4>Education</h4>
                              <button className="add-info-btn">
                                <span className="icon flaticon-plus"></span> Add
                                Aducation
                              </button>
                            </div>
                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">M</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Bachlors in Fine Arts</h3>
                                    <span>Modern College</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">H</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Computer Science</h3>
                                    <span>Harvard University</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2008 - 2012</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Resume / Work & Experience */}
                          <div className="resume-outer theme-blue">
                            <div className="upper-title">
                              <h4>Work & Experience</h4>
                              <button className="add-info-btn">
                                <span className="icon flaticon-plus"></span> Add
                                Work
                              </button>
                            </div>
                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">S</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Product Designer</h3>
                                    <span>Spotify Inc.</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">D</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Sr UX Engineer</h3>
                                    <span>Dropbox Inc.</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="form-group col-lg-6 col-md-12">
                          <div className="uploading-outer">
                            <div className="uploadButton">
                              <input
                                className="uploadButton-input"
                                type="file"
                                name="attachments[]"
                                accept="image/*, application/pdf"
                                id="upload"
                                multiple
                              />
                              <label
                                className="uploadButton-button ripple-effect"
                                htmlFor="upload"
                              >
                                Add Portfolio
                              </label>
                              <span className="uploadButton-file-name"></span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group col-lg-12 col-md-12">
                          {/* Resume / Awards */}
                          <div className="resume-outer theme-yellow">
                            <div className="upper-title">
                              <h4>Awards</h4>
                              <button className="add-info-btn">
                                <span className="icon flaticon-plus"></span>{" "}
                                Awards
                              </button>
                            </div>
                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name"></span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Perfect Attendance Programs</h3>
                                    <span></span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume BLock */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name"></span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Top Performer Recognition</h3>
                                    <span></span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button>
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button>
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur
                                  adipiscing elit. Proin a ipsum tellus.
                                  Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Search Select */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Skills </label>
                          <select
                            data-placeholder="Categories"
                            className="chosen-select multiple"
                            multiple
                            tabIndex="4"
                          >
                            <option value="Banking">Banking</option>
                            <option value="Digital&Creative">
                              Digital & Creative
                            </option>
                            <option value="Retail">Retail</option>
                            <option value="Human Resources">
                              Human Resources
                            </option>
                            <option value="Management">Management</option>
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button className="theme-btn btn-style-one">
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Dashboard */}
    </>
  );
};
