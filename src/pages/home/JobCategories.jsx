import { useState, useEffect } from "react";
import { getTopCategoryJob } from "@/services/jobServices";

export const JobCategories = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getTopCategoryJob();
        setCategories(data || {});
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Map category names to icon classes
  const categoryIcons = {
    // Category mapping for the 12 specified categories
    "Information Technology": "flaticon-web-programming",
    Design: "flaticon-vector",
    Marketing: "flaticon-promotion",
    Finance: "flaticon-money",
    Sales: "flaticon-handshake",
    "Customer Service": "flaticon-customer-service",
    Education: "flaticon-mortarboard",
    Healthcare: "flaticon-first-aid",
    Engineering: "flaticon-engineer",
    Logistics: "flaticon-delivery-truck",
    Media: "flaticon-microphone",
    Manufacturing: "flaticon-factory",
  };

  // Create an array of category blocks based on available data
  const renderCategoryBlocks = () => {
    if (loading) {
      return Array(4)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="category-block-two at-home22 col-xl-3 col-sm-6"
          >
            {/* Skeleton loading không đổi */}
            <div className="inner-box text-start">
              <div className="content justify-content-start d-block">
                <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-20 mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-6 w-32 mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-40 mb-1"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-40"></div>
              </div>
            </div>
          </div>
        ));
    }

    if (error || Object.keys(categories).length === 0) {
      return (
        <div className="col-12">
          <p className="text-center">
            No job categories available at the moment.
          </p>
        </div>
      );
    }

    // Filter các top categories
    const topCategories = Object.entries(categories).filter(([key]) =>
      key.startsWith("top")
    );

    // Xác định column class dựa vào số lượng categories
    const getColumnClass = (count) => {
      switch (count) {
        case 1:
          return "col-xl-12 col-sm-12"; // 1 category: 100% width
        case 2:
          return "col-xl-6 col-sm-6"; // 2 categories: 50% width
        case 3:
          return "col-xl-4 col-sm-6"; // 3 categories: 33.3% width
        default:
          return "col-xl-3 col-sm-6"; // 4+ categories: 25% width
      }
    };

    const columnClass = getColumnClass(topCategories.length);

    // Render danh sách categories với column class phù hợp
    return topCategories.map(([key, category]) => {
      const iconClass =
        categoryIcons[category.categoryname] || "flaticon-briefcase";

      return (
        <div
          key={key}
          className={`category-block-two at-home22 ${columnClass}`}
        >
          <div className="inner-box text-start">
            <div className="content justify-content-start d-block">
              <span className={`icon ${iconClass}`}></span>
              <p>
                ({category.count} open position
                {category.count !== 1 ? "s" : ""})
              </p>
              <h4>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  {category.categoryname}
                </a>
              </h4>
              <p className="text">
                Explore the latest opportunities
                <br className="d-none d-xl-block" /> in this growing field.
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <section className="job-categories border-bottom-0 pt-0">
      <div className="auto-container">
        <div className="d-flex align-items-center justify-content-between wow fadeInUp">
          <div className="sec-title">
            <h2>Popular Job Categories</h2>
            <div className="text">
              Discover the most sought-after job categories
            </div>
          </div>
        </div>

        <div className="row wow fadeInUp">{renderCategoryBlocks()}</div>
      </div>
    </section>
  );
};
