import addressLogo from "../../assets/images/icons/placeholder.svg";
import smartPhoneLogo from "../../assets/images/icons/smartphone.svg";
import letterLogo from "../../assets/images/icons/letter.svg";
import { CallToAction } from "../home/CallToAction";

export const index = () => {
  return (
    <>
      <section className="contact-section" style={{ marginTop: "350px" }}>
        <div className="auto-container">
          <div className="upper-box" style={{ backgroundColor: "#eef4fc" }}>
            <div className="row">
              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src={addressLogo} alt="" />
                  </span>
                  <h4>Address</h4>
                  <p>
                    FPT Technology Park, Hoa Hai Ward, Ngu Hanh Son District,
                    <br /> Da Nang City, Viet Nam.
                  </p>
                </div>
              </div>
              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src={smartPhoneLogo} alt="" />
                  </span>
                  <h4>Call Us</h4>
                  <p>
                    <a href="#" className="phone">
                      123 456 7890
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src={letterLogo} alt="" />
                  </span>
                  <h4>Email</h4>
                  <p>
                    <a href="#" className="phone">
                      support@worksmart.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="contact-form default-form"
            style={{ marginTop: "50px" }}
          >
            <h3>Leave A Message</h3>
            {/*Contact Form*/}
            <form method="post" action="#" id="email-form">
              <div className="row">
                <div className="form-group col-lg-12 col-md-12 col-sm-12">
                  <div className="response"></div>
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="username"
                    className="username"
                    placeholder="Your Name*"
                    required
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    className="email"
                    placeholder="Your Email*"
                    required
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="subject"
                    placeholder="Subject *"
                    required
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Your Message</label>
                  <textarea
                    name="message"
                    placeholder="Write your message..."
                    required=""
                  ></textarea>
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <button
                    className="theme-btn btn-style-one"
                    type="button"
                    id="submit"
                    name="submit-form"
                  >
                    Send Massage
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/*End Contact Form */}
        </div>
      </section>

      <hr />
      <CallToAction />
      <br />
    </>
  );
};
