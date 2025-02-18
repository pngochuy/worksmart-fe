export const index = () => {
  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>My CV</h3>
            <div className="text">Ready to jump back in?</div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              {/* CV Manager Widget */}
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>My CV</h4>
                </div>
                <div className="widget-content">
                  <div className="uploading-resume">
                    <div className="uploadButton">
                      <input
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept="image/*, application/pdf"
                        id="upload"
                        multiple
                      />
                      <label className="cv-uploadButton" htmlFor="upload">
                        <span className="title">Drop files here to upload</span>
                        <span className="text">
                          To upload file size is (Max 5Mb) and allowed file
                          types are (.doc, .docx, .pdf)
                        </span>
                        <span className="theme-btn btn-style-one">
                          Upload Resume
                        </span>
                      </label>
                      <span className="uploadButton-file-name"></span>
                    </div>
                  </div>

                  <div className="files-outer">
                    <div className="file-edit-box">
                      <span className="title">Sample CV</span>
                      <div className="edit-btns">
                        <button>
                          <span className="la la-pencil"></span>
                        </button>
                        <button>
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>

                    <div className="file-edit-box">
                      <span className="title">Sample CV</span>
                      <div className="edit-btns">
                        <button>
                          <span className="la la-pencil"></span>
                        </button>
                        <button>
                          <span className="la la-trash"></span>
                        </button>
                      </div>
                    </div>

                    <div className="file-edit-box">
                      <span className="title">Sample CV</span>
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
