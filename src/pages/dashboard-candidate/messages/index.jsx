export const index = () => {
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Messages</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Chat Widget */}
              <div className="chat-widget">
                <div className="widget-content">
                  <div className="row">
                    <div
                      className="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat"
                      id="chat_contacts"
                    >
                      <div className="card contacts_card">
                        <div className="card-header">
                          <div className="search-box-one">
                            <form method="post" action="#">
                              <div className="form-group">
                                <span className="icon flaticon-search-1"></span>
                                <input
                                  type="search"
                                  name="search-field"
                                  value=""
                                  placeholder="Search"
                                  required=""
                                />
                              </div>
                            </form>
                          </div>
                        </div>
                        <div className="card-body contacts_body">
                          <ul className="contacts">
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-1.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Darlene Robertson</span>
                                    <p> Head of Development</p>
                                  </div>
                                  <span className="info">35 mins</span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-2.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Jane Cooper</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">
                                    35 mins <span className="count">2</span>
                                  </span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-3.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Arlene McCoy</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">
                                    35 mins{" "}
                                    <span className="count bg-success">2</span>
                                  </span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-4.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Albert Flores</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">35 mins</span>
                                </div>
                              </a>
                            </li>
                            <li className="active">
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-5.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Williamson</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">
                                    35 mins{" "}
                                    <span className="count bg-warning">2</span>
                                  </span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-6.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Kristin Watson</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">35 mins</span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-7.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Annette Black</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">35 mins</span>
                                </div>
                              </a>
                            </li>
                            <li>
                              <a href="#">
                                <div className="d-flex bd-highlight">
                                  <div className="img_cont">
                                    <img
                                      src="images/resource/candidate-8.png"
                                      className="rounded-circle user_img"
                                      alt=""
                                    />
                                  </div>
                                  <div className="user_info">
                                    <span>Jacob Jones</span>
                                    <p>Head of Development</p>
                                  </div>
                                  <span className="info">35 mins</span>
                                </div>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className=" col-xl-8 col-lg-7 col-md-12 col-sm-12 chat">
                      <div className="card message-card">
                        <div className="card-header msg_head">
                          <div className="d-flex bd-highlight">
                            <div className="img_cont">
                              <img
                                src="images/resource/candidate-8.png"
                                alt=""
                                className="rounded-circle user_img"
                              />
                            </div>
                            <div className="user_info">
                              <span>Arlene McCoy</span>
                              <p>Active</p>
                            </div>
                          </div>

                          <div className="btn-box">
                            <button className="dlt-chat">
                              Delete Conversation
                            </button>
                            <button className="toggle-contact">
                              <span className="fa fa-bars"></span>
                            </button>
                          </div>
                        </div>

                        <div className="card-body msg_card_body">
                          <div className="d-flex justify-content-start mb-2">
                            <div className="img_cont_msg">
                              <img
                                src="images/resource/candidate-3.png"
                                alt=""
                                className="rounded-circle user_img_msg"
                              />
                              <div className="name">
                                Albert Flores{" "}
                                <span className="msg_time">35 mins</span>
                              </div>
                            </div>
                            <div className="msg_cotainer">
                              How likely are you to recommend our company to
                              your friends and family?
                            </div>
                          </div>

                          <div className="d-flex justify-content-end mb-2 reply">
                            <div className="img_cont_msg">
                              <img
                                src="images/resource/candidate-6.png"
                                alt=""
                                className="rounded-circle user_img_msg"
                              />
                              <div className="name">
                                You <span className="msg_time">35 mins</span>
                              </div>
                            </div>
                            <div className="msg_cotainer">
                              Hey there, we’re just writing to let you know that
                              you’ve been subscribed to a repository on GitHub.
                            </div>
                          </div>

                          <div className="d-flex justify-content-start">
                            <div className="img_cont_msg">
                              <img
                                src="images/resource/candidate-3.png"
                                alt=""
                                className="rounded-circle user_img_msg"
                              />
                              <div className="name">
                                Cameron Williamson{" "}
                                <span className="msg_time">35 mins</span>
                              </div>
                            </div>
                            <div className="msg_cotainer">Ok, Understood!</div>
                          </div>
                        </div>

                        <div className="card-footer">
                          <div className="form-group mb-0">
                            <textarea
                              className="form-control type_msg"
                              placeholder="Type a message..."
                            ></textarea>
                            <button
                              type="button"
                              className="theme-btn btn-style-one submit-btn"
                            >
                              Send Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
