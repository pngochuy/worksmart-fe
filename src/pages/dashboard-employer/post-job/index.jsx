import { JobForm } from "./jobform";
import { getVerificationLevel } from "@/helpers/decodeJwt";
import { useEffect, useState  } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Index = () => {
  // const [verificationLevel, setVerificationLevel] = useState(1);
  // const navigate = useNavigate();

  // useEffect(() => {
  //     const level = getVerificationLevel();
  //     setVerificationLevel(level);
  
  //     if (verificationLevel < 3) {
  //         navigate("/employer/verification");
  //     }
  //   }, []);
  
  return <JobForm />;
  // return (
  //   <>
  //     <section className="user-dashboard">
  //       <div className="dashboard-outer">
  //         <div className="upper-title-box">
  //           <h3>Post a New Job!</h3>
  //           <div className="text">Ready to jump back in?</div>
  //         </div>

  //         <div className="row">
  //           <div className="col-lg-12">
  //             {/* Ls widget */}
  //             <div className="ls-widget">
  //               <div className="tabs-box">
  //                 <div className="widget-title">
  //                   <h4>Post Job</h4>
  //                 </div>

  //                 <div className="widget-content">
  //                   <div className="post-job-steps">
  //                     <div className="step">
  //                       <span className="icon flaticon-briefcase"></span>
  //                       <h5>Job Detail</h5>
  //                     </div>

  //                     <div className="step">
  //                       <span className="icon flaticon-money"></span>
  //                       <h5>Package & Payments</h5>
  //                     </div>

  //                     <div className="step">
  //                       <span className="icon flaticon-checked"></span>
  //                       <h5>Confirmation</h5>
  //                     </div>
  //                   </div>

  //                   <form className="default-form">
  //                     <div className="row">
  //                       {/* Input */}
  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <label>Job Title</label>
  //                         <input type="text" name="name" placeholder="Title" />
  //                       </div>

  //                       {/* About Company */}
  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <label>Job Description</label>
  //                         <textarea placeholder="Spent several years working on sheep on Wall Street. Had moderate success investing in Yugo's on Wall Street. Managed a small team buying and selling Pogo sticks for farmers. Spent several years licensing licorice in West Palm Beach, FL. Developed several new methods for working it banjos in the aftermarket. Spent a weekend importing banjos in West Palm Beach, FL.In this position, the Software Engineer collaborates with Evention's Development team to continuously enhance our current software solutions as well as create new solutions to eliminate the back-office operations and management challenges present"></textarea>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Email Address</label>
  //                         <input type="text" name="name" placeholder="" />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Username</label>
  //                         <input type="text" name="name" placeholder="" />
  //                       </div>

  //                       {/* Search Select */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Specialisms </label>
  //                         <select
  //                           data-placeholder="Categories"
  //                           className="chosen-select multiple"
  //                           multiple
  //                           tabIndex="4"
  //                         >
  //                           <option value="Banking">Banking</option>
  //                           <option value="Digital&Creative">
  //                             Digital & Creative
  //                           </option>
  //                           <option value="Retail">Retail</option>
  //                           <option value="Human Resources">
  //                             Human Resources
  //                           </option>
  //                           <option value="Management">Management</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Job Type</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Banking</option>
  //                           <option>Digital & Creative</option>
  //                           <option>Retail</option>
  //                           <option>Human Resources</option>
  //                           <option>Management</option>
  //                         </select>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Offered Salary</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>$1500</option>
  //                           <option>$2000</option>
  //                           <option>$2500</option>
  //                           <option>$3500</option>
  //                           <option>$4500</option>
  //                           <option>$5000</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Career Level</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Banking</option>
  //                           <option>Digital & Creative</option>
  //                           <option>Retail</option>
  //                           <option>Human Resources</option>
  //                           <option>Management</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Experience</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Banking</option>
  //                           <option>Digital & Creative</option>
  //                           <option>Retail</option>
  //                           <option>Human Resources</option>
  //                           <option>Management</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Gender</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Male</option>
  //                           <option>Female</option>
  //                           <option>Other</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Industry</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Banking</option>
  //                           <option>Digital & Creative</option>
  //                           <option>Retail</option>
  //                           <option>Human Resources</option>
  //                           <option>Management</option>
  //                         </select>
  //                       </div>

  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Qualification</label>
  //                         <select className="chosen-select">
  //                           <option>Select</option>
  //                           <option>Banking</option>
  //                           <option>Digital & Creative</option>
  //                           <option>Retail</option>
  //                           <option>Human Resources</option>
  //                           <option>Management</option>
  //                         </select>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <label>Application Deadline Date</label>
  //                         <input
  //                           type="text"
  //                           name="name"
  //                           placeholder="06.04.2020"
  //                         />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Country</label>
  //                         <select className="chosen-select">
  //                           <option>Australia</option>
  //                           <option>Pakistan</option>
  //                           <option>Chaina</option>
  //                           <option>Japan</option>
  //                           <option>India</option>
  //                         </select>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>City</label>
  //                         <select className="chosen-select">
  //                           <option>Melbourne</option>
  //                           <option>Pakistan</option>
  //                           <option>Chaina</option>
  //                           <option>Japan</option>
  //                           <option>India</option>
  //                         </select>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <label>Complete Address</label>
  //                         <input
  //                           type="text"
  //                           name="name"
  //                           placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
  //                         />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-6 col-md-12">
  //                         <label>Find On Map</label>
  //                         <input
  //                           type="text"
  //                           name="name"
  //                           placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
  //                         />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-3 col-md-12">
  //                         <label>Latitude</label>
  //                         <input
  //                           type="text"
  //                           name="name"
  //                           placeholder="Melbourne"
  //                         />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-3 col-md-12">
  //                         <label>Longitude</label>
  //                         <input
  //                           type="text"
  //                           name="name"
  //                           placeholder="Melbourne"
  //                         />
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <button className="theme-btn btn-style-three">
  //                           Search Location
  //                         </button>
  //                       </div>

  //                       <div className="form-group col-lg-12 col-md-12">
  //                         <div className="map-outer">
  //                           <div
  //                             className="map-canvas map-height"
  //                             data-zoom="12"
  //                             data-lat="-37.817085"
  //                             data-lng="144.955631"
  //                             data-type="roadmap"
  //                             data-hue="#ffc400"
  //                             data-title="Envato"
  //                             data-icon-path="images/resource/map-marker.png"
  //                             data-content="Melbourne VIC 3000, Australia<br><a href='mailto:info@youremail.com'>info@youremail.com</a>"
  //                           ></div>
  //                         </div>
  //                       </div>

  //                       {/* Input */}
  //                       <div className="form-group col-lg-12 col-md-12 text-right">
  //                         <button className="theme-btn btn-style-one">
  //                           Next
  //                         </button>
  //                       </div>
  //                     </div>
  //                   </form>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   </>
  // );
};
