import LocationMap from "@/components/LocationMap";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCompanyDetails } from "@/services/employerServices";
import axios from "axios";
import { toast } from "react-toastify";

export const Index = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState([]);
  const { companyName } = useParams(); // Lấy companyName từ URL

  // States cho message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userRole = user?.role || null;

  // Kiểm tra xem user có phải là Candidate hay không
  const isCandidate = userRole === "Candidate";

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      setLoading(true);
      try {
        // Sử dụng companyName từ URL nếu có, nếu không thì dùng "Tech Corp" hoặc giá trị mặc định
        const name = companyName || "Tech Corp";
        const data = await fetchCompanyDetails(name);

        if (data) {
          console.log("Company data fetched:", data);
          setCompany(data);

          // Nếu API trả về danh sách jobs
          if (data.postedJobs) {
            setCompanyJobs(data.postedJobs);
          }
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [companyName]);

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert("Please enter a message");
      return;
    }

    setIsSendingMessage(true);

    try {
      // Get IDs for message
      const senderId = user.userID;
      const receiverId = company.userID;

      // Create message data
      const messageData = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageContent.trim(),
      };

      // Send message through API endpoint
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);

      // Clear input and close dialog
      setMessageContent("");
      setShowMessageDialog(false);

      // Show success notification
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        {/* <div className="loading-spinner"></div>
        <p>Loading company information...</p> */}
      </div>
    );
  }

  // if (!company) {
  //   return (
  //     <div
  //       className="error-message"
  //       style={{ marginTop: "100px", textAlign: "center" }}
  //     >
  //       <h3>Company Not Found</h3>
  //       <p>Sorry, we couldn&apos;t find information for this company.</p>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* Job Detail Section */}
      <section className="job-detail-section" style={{ marginTop: "100px" }}>
        {/* Upper Box */}
        <div className="upper-box">
          <div className="auto-container">
            {/* Job Block */}
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img
                      src={company?.avatar || "https://via.placeholder.com/150"}
                      alt={company?.companyName}
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </span>
                  <h4>
                    <a href="#">{company?.companyName}</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      {company.address || "No address provided"}
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      {company.industry || "Industry not specified"}
                    </li>
                    <li>
                      <span className="icon flaticon-telephone-1"></span>{" "}
                      {company.phoneNumber || "No phone provided"}
                    </li>
                    <li>
                      <span className="icon flaticon-mail"></span>{" "}
                      {company.email || "No email provided"}
                    </li>
                  </ul>
                  <ul className="job-other-info">
                    <li className="time">Open Jobs – {companyJobs.length}</li>
                  </ul>
                </div>

                <div className="btn-box">
                  {company.companyWebsite && (
                    <a
                      href={company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-btn btn-style-one"
                    >
                      Visit Website
                    </a>
                  )}

                  {/* Nút gửi tin nhắn - Chỉ hiển thị khi user là Candidate */}
                  {isCandidate && (
                    <button
                      className="theme-btn btn-style-four message-btn ml-2"
                      onClick={() => setShowMessageDialog(true)}
                    >
                      <i className="fas fa-envelope mr-2"></i> Message Company
                    </button>
                  )}

                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <h4>About Company</h4>
                  {company.companyDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: company.companyDescription,
                      }}
                    />
                  ) : (
                    <>
                      <p>
                        {company.companyName} is a company in the{" "}
                        {company.industry || "technology"} industry.
                      </p>
                      <p>
                        For more information, please visit their website or
                        contact them directly.
                      </p>
                    </>
                  )}
                </div>

                {/* Related Jobs */}
                {companyJobs.length > 0 && (
                  <div className="related-jobs">
                    <div className="title-box">
                      <h3>
                        {companyJobs.length} jobs at {company.companyName}
                      </h3>
                      <div className="text">
                        Apply now to work at {company.companyName}
                      </div>
                    </div>

                    {/* Job Blocks */}
                    {companyJobs.map((job) => (
                      <div className="job-block" key={job.jobID}>
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              <img
                                src={
                                  company.avatar ||
                                  "https://via.placeholder.com/150"
                                }
                                alt={company.companyName}
                              />
                            </span>
                            <h4>
                              <a href={`/jobs/${job.jobID}`}>{job.title}</a>
                            </h4>
                            <ul className="job-info">
                              <li>
                                <span className="icon flaticon-briefcase"></span>{" "}
                                {company.companyName}
                              </li>
                              <li>
                                <span className="icon flaticon-map-locator"></span>{" "}
                                {job.location}
                              </li>
                              <li>
                                <span className="icon flaticon-clock-3"></span>{" "}
                                {new Date(job.createdAt).toLocaleDateString()}
                              </li>
                              <li>
                                <span className="icon flaticon-money"></span>{" "}
                                {job.salary}
                              </li>
                            </ul>
                            <ul className="job-other-info">
                              <li className="time">{job.workType}</li>
                              {job.priority && (
                                <li className="required">Featured</li>
                              )}
                            </ul>
                            <button className="bookmark-btn">
                              <span className="flaticon-bookmark"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <ul className="company-info mt-0">
                        <li>
                          Primary industry:{" "}
                          <span>{company.industry || "Not specified"}</span>
                        </li>
                        <li>
                          Company size:{" "}
                          <span>{company.companySize || "Not specified"}</span>
                        </li>
                        <li>
                          Founded in:{" "}
                          <span>{company.foundedYear || "Not specified"}</span>
                        </li>
                        <li>
                          Phone:{" "}
                          <span>{company.phoneNumber || "Not provided"}</span>
                        </li>
                        <li>
                          Email: <span>{company.email || "Not provided"}</span>
                        </li>
                        <li>
                          Location:{" "}
                          <span>
                            {company.workLocation ||
                              company.address ||
                              "Not specified"}
                          </span>
                        </li>
                        <li>
                          Social media:
                          <div className="social-links">
                            <a href="#">
                              <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-linkedin-in"></i>
                            </a>
                          </div>
                        </li>
                      </ul>

                      {company.companyWebsite && (
                        <div className="btn-box">
                          <a
                            href={company.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {company.companyWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <LocationMap
                    address={
                      company.address ||
                      company.workLocation ||
                      "Ha Noi, Vietnam"
                    }
                    companyName={company.companyName}
                  />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="message-dialog-overlay">
          <div className="message-dialog">
            <div className="message-dialog-header">
              <h3>Send Message to {company.companyName}</h3>
              <button
                className="close-dialog"
                onClick={() => setShowMessageDialog(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="message-dialog-body">
              <p className="message-instructions">
                Use this form to send a message directly to{" "}
                <b>{company.companyName}</b>. They will receive your message
                along with your contact information.
              </p>

              <div className="message-form">
                <div className="form-group">
                  <label htmlFor="messageContent">Message:</label>
                  <textarea
                    id="messageContent"
                    className="message-textarea"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={10}
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="message-dialog-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowMessageDialog(false)}
                disabled={isSendingMessage}
              >
                Cancel
              </button>
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isSendingMessage}
              >
                {isSendingMessage ? (
                  <>
                    <span className="send-spinner"></span> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error Styles */}
      <style>{`
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          margin-top: 100px;
        }

        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          padding: 20px;
          border-radius: 5px;
          max-width: 500px;
          margin: 100px auto 0;
        }

        .error-message h3 {
          color: #856404;
          margin-bottom: 10px;
        }
        
        /* Message Button Styles */
        .message-btn {
          margin-right: 10px;
          display: inline-flex;
          align-items: center;
        }
        
        .mr-2 {
          margin-right: 0.5rem;
        }
        
        /* Message Dialog Styles */
        .message-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .message-dialog {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        
        .message-dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
        }
        
        .message-dialog-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .close-dialog {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #888;
        }
        
        .close-dialog:hover {
          color: #333;
        }
        
        .message-dialog-body {
          padding: 20px;
          overflow-y: auto;
        }
        
        .message-instructions {
          margin-bottom: 15px;
          color: #555;
          font-size: 14px;
        }
        
        .message-form {
          margin-top: 15px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .message-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
          font-size: 14px;
        }
        
        .message-textarea:focus {
          border-color: #26ae61;
          outline: none;
          box-shadow: 0 0 0 2px rgba(38, 174, 97, 0.2);
        }
        
        .message-dialog-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .cancel-btn, .send-btn {
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .cancel-btn {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          color: #495057;
        }
        
        .cancel-btn:hover:not(:disabled) {
          background-color: #e9ecef;
        }
        
        .send-btn {
          background-color: #26ae61;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .send-btn:hover:not(:disabled) {
          background-color: #20925a;
        }
        
        .send-btn:disabled, .cancel-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .send-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Index;
