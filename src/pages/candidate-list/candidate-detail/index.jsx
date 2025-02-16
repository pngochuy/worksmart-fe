import avatarUser from "../../../assets/images/resource/candidate-1-v4.png";

export const index = () => {
  return (
    <>
      {/* Candidate Detail Section */}
      <section
        className="candidate-detail-section"
        style={{ marginTop: "120px" }}
      >
        {/* Upper Box */}
        <div className="upper-box ub1-v4">
          {/*  */}
          <div className="auto-container">
            {/* Candidate block Five */}
            <div className="candidate-block-five at-v5">
              <div className="inner-box d-block d-lg-flex">
                <div className="content mb-3 mb-xl-0">
                  <figure className="image">
                    <img src={avatarUser} alt="" />
                  </figure>
                  <h4 className="name">
                    <a href="#">Jane Cooper</a>
                  </h4>
                  <ul className="candidate-info at-sv5">
                    <li className="designation">UX Designer</li>
                    <li>
                      <span className="icon dark-color fal fa-location-dot"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon dark-color fal fa-circle-dollar"></span>{" "}
                      $294 / hour
                    </li>
                    <li>
                      <span className="fas fa-star review-color"></span> 4.5 (8
                      Reviews)
                    </li>
                  </ul>
                  <ul className="post-tags at-sv5">
                    <li className="mb-2 mb-xl-0">
                      <a href="#">UX Designer</a>
                    </li>
                    <li className="mb-2 mb-xl-0">
                      <a href="#">Product Manager</a>
                    </li>
                    <li>
                      <a href="#">Developer</a>
                    </li>
                  </ul>
                </div>
                <div className="btn-box d-block d-sm-flex">
                  <a href="" className="ud-btn-transparent mr20 mb-2 mb-sm-0">
                    Follow <i className="fal fa-long-arrow-right"></i>
                  </a>
                  <a href="" className="ud-btn-transparent mr20 mb-2 mb-sm-0">
                    Invite <i className="fal fa-long-arrow-right"></i>
                  </a>
                  <a href="#" className="theme-btn btn-style-one">
                    Download CV{" "}
                    <i className="fal fa-long-arrow-right text-white d-block ml15"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="candidate-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8">
                <div className="job-detail at-v5 pe-0">
                  <h3 className="fz30 fw500 mb-4">About me</h3>
                  <p className="text">
                    Hello my name is Nicole Wells and web developer from
                    Portland. In pharetra orci dignissim, blandit mi semper,
                    ultricies diam. Suspendisse malesuada suscipit nunc non
                    volutpat. Sed porta nulla id orci laoreet tempor non
                    consequat enim. Sed vitae aliquam velit. Aliquam ante erat,
                    blandit at pretium et, accumsan ac est. Integer vehicula
                    rhoncus molestie. Morbi ornare ipsum sed sem condimentum, et
                    pulvinar tortor luctus. Suspendisse condimentum lorem ut
                    elementum aliquam.Mauris nec erat ut libero vulputate
                    pulvinar. Aliquam ante erat, blandit at pretium et, accumsan
                    ac est. Integer vehicula rhoncus molestie. Morbi ornare
                    ipsum sed sem condimentum, et pulvinar tortor luctus.
                    Suspendisse condimentum lorem ut elementum aliquam. Mauris
                    nec erat ut libero vulputate pulvinar.
                  </p>
                  <hr className="opacity-100" />
                  {/* Resume / Education */}
                  <div className="resume-outer">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Education</h3>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name">M</span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Bachlors in Fine Arts</h3>
                            <span>Modern College</span>
                          </div>
                          <div className="edit-box">
                            <span className="year">2012 - 2014</span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante <br className="d-none d-lg-block" />{" "}
                          ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name">H</span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Computer Science</h3>
                            <span>Harvard University</span>
                          </div>
                          <div className="edit-box">
                            <span className="year">2008 - 2012</span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante <br className="d-none d-lg-block" />{" "}
                          ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="opacity-100" />
                  {/* Resume / Work & Experience */}
                  <div className="resume-outer theme-blue">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Work & Experience</h3>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name">S</span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Product Designer</h3>
                            <span>Spotify Inc.</span>
                          </div>
                          <div className="edit-box">
                            <span className="year">2008 - 2012</span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name">D</span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Sr UX Engineer</h3>
                            <span>Dropbox Inc.</span>
                          </div>
                          <div className="edit-box">
                            <span className="year">2012 - 2014</span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="opacity-100" />
                  {/* Resume / Awards */}
                  <div className="resume-outer theme-yellow at-sv5">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Honors & awards</h3>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name"></span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Perfect Attendance Programs</h3>
                            <p className="text fz15 mb-0">29 April 2023</p>
                            <span></span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name"></span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Top Performer Recognition</h3>
                            <p className="text fz15 mb-0">29 April 2023</p>
                            <span></span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-column col-lg-4">
                <aside className="sidebar">
                  <div className="sidebar-widget">
                    <h4 className="widget-title">Information</h4>
                    <div className="widget-content">
                      <ul className="job-overview at-sv5">
                        <li>
                          <i className="icon far fa-circle-dollar"></i>
                          <div className="ml15">
                            <h5>Offer Salary</h5>
                            <span>$10 / hour</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-title"></i>
                          <div className="ml15">
                            <h5>Experience Time</h5>
                            <span>2 Year</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon far fa-mars"></i>
                          <div className="ml15">
                            <h5>Gender</h5>
                            <span>Male</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon far fa-user"></i>
                          <div className="ml15">
                            <h5>Age</h5>
                            <span>25-30</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-exercise"></i>
                          <div className="ml15">
                            <h5>Qualification</h5>
                            <span>Associate Degree</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon fal fa-language"></i>
                          <div className="ml15">
                            <h5>Language:</h5>
                            <span>English, German, Spanish</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-email-3"></i>
                          <div className="ml15">
                            <h5>Email</h5>
                            <span>candidate@apus.com</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-telephone-1"></i>
                          <div className="ml15">
                            <h5>Phone Number</h5>
                            <span>3323534200594</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="d-grid mb15">
                      <a href="" className="ud-btn-transparent">
                        Send Message
                      </a>
                    </div>
                    <div className="text-center">
                      <div className="social-link-style1">
                        <a className="me-3" href="#">
                          <i className="fab fa-facebook-f"></i>
                        </a>
                        <a className="me-3" href="#">
                          <i className="fab fa-twitter"></i>
                        </a>
                        <a className="me-3" href="#">
                          <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#">
                          <i className="fab fa-linkedin-in"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-0">
                    {/* Job Skills */}
                    <h4 className="widget-title fz18 mb25 fw500">
                      Professional Skills
                    </h4>
                    <div className="widget-content">
                      <div className="job-skills-style1">
                        <a href="#">Marketing Jobs</a>
                        <a href="#">Designer</a>
                        <a href="#">Engimeering</a>
                        <a href="#">Developer</a>
                        <a href="#">Security Jobs</a>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End candidate Detail Section */}
    </>
  );
};
