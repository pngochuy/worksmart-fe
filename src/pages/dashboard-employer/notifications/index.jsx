export const index = () => {
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Notications</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Notications</h4>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Alert Query</th>
                            <th>Number Jobs</th>
                            <th>Times</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr>
                            <td>Education</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>Accounting and Finance</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>Education</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>Accounting and Finance</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>Education</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>Accounting and Finance</td>
                            <td>
                              Category: Education Training, Posted Date: All,
                              Salary: $1000 – $3000
                            </td>
                            <td>Jobs found 5</td>
                            <td>Weekly</td>
                            <td>
                              <button>
                                <i className="la la-trash colored"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
