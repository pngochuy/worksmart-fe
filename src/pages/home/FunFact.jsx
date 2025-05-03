import { useState, useEffect, useRef } from 'react';
import { getCountDashboard } from '../../services/dashboardServices';

export const FunFact = () => {
  const [countData, setCountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const countersInitialized = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCountDashboard();
        console.log('Count data:', response);
        // Filter out Messages and keep only Posted Jobs, Users, and Revenue
        const filteredData = response.filter(item =>
          item.title !== 'Messages'
        ).slice(0, 3);
        setCountData(filteredData);
      } catch (error) {
        console.error('Error fetching count data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize counters after data is loaded
  useEffect(() => {
    if (!loading && countData.length > 0 && !countersInitialized.current) {
      initializeCounters();
      countersInitialized.current = true;
    }
  }, [loading, countData]);

  // Format data for display
  const formatForDisplay = (title, count) => {
    if (title === 'Revenue') {
      if (count >= 1000000) {
        return { value: (count / 1000000).toFixed(1), suffix: 'M' };
      } else if (count >= 1000) {
        return { value: (count / 1000).toFixed(1), suffix: 'k' };
      }
    }
    return { value: count, suffix: '' };
  };

  // Get descriptive text based on title
  const getDescription = (title) => {
    switch (title.toLowerCase()) {
      case 'posted jobs':
        return 'Open job positions available';
      case 'users':
        return 'Active users on our platform';
      case 'revenue':
        return 'Total revenue generated';
      default:
        return 'Amazing achievements';
    }
  };

  // Initialize counter animation
  const initializeCounters = () => {
    const countElements = document.querySelectorAll('.count-text');

    countElements.forEach((countElement) => {
      const finalValue = parseInt(countElement.getAttribute('data-stop'));
      const duration = parseInt(countElement.getAttribute('data-speed'));

      animateValue(countElement, 0, finalValue, duration);
    });
  };

  // Animation function
  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);

      element.textContent = currentValue;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  return (
    <div className="fun-fact-section style-two">
      <div className="auto-container">
        <div className="row wow fadeInUp">
          {loading ? (
            <div className="text-center col-12">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            countData.map((item, index) => {
              const { value, suffix } = formatForDisplay(item.title, item.count);

              return (
                <div
                  key={index}
                  className="counter-column col-lg-4 col-md-6 col-sm-12 wow fadeInUp"
                  data-wow-delay={`${index * 400}ms`}
                >
                  <div className="count-box dark-color">
                    <span
                      className="count-text"
                      data-speed="3000"
                      data-stop={value}
                    >
                      {value}
                    </span>
                    {suffix}
                  </div>
                  <h4 className="counter-title">
                    {getDescription(item.title)}
                  </h4>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FunFact;