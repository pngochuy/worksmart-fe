import CategoryTagsManager from "@/components/CategoryTagsManager";

export const Index = () => {
  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Applied Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box w-full" >
                  <CategoryTagsManager />
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
