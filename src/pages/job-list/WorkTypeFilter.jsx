import { useState } from "react";

const WorkTypeFilter = ({ searchParams, setSearchParams }) => {
  const allTypes = ["Freelance", "Full Time", "Internship", "Part-time"];
  const workTypes = searchParams.WorkTypes || [];

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let updatedWorkTypes = checked
      ? [...workTypes, value]
      : workTypes.filter((type) => type !== value);

    // Nếu không chọn gì thì đặt WorkTypes thành null
    if (updatedWorkTypes.length === 0) {
      updatedWorkTypes = null;
    }

    setSearchParams((prev) => ({
      ...prev,
      WorkTypes: updatedWorkTypes,
    }));
  };

  return (
    <div className="switchbox-outer"> 
      <h4>Work Type</h4>
      <ul className="switchbox at-jlv16">
        {allTypes.map((type) => (
          <li className="mb-0" key={type}>
            <label className="switch">
              <input
                type="checkbox"
                value={type}
                checked={workTypes.includes(type)}
                onChange={handleCheckboxChange}
              />
              <span className="slider round"></span>
              <span className="title">{type}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkTypeFilter;
