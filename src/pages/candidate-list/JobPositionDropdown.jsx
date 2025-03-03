import React, { useEffect, useState } from "react";
import Select from "react-select";
import Job from "../../jsons/JobTag.json";
const JobPositionDropdown = ({ setSearchParams }) => {
  const [jobPositionOptions, setJobPositionOptions] = useState([]);

  useEffect(() => {
    // Chuyển đổi dữ liệu JSON thành format của react-select
    const options = Job.jobs.map((job) => ({
      value: job.value,
      label: job.name,
    }));
    setJobPositionOptions(options);
  }, []);

  const [selectedJobPositionOption, setSelectedJobPositionOption] =
    useState("");
  const [expValue, setExpValue] = useState("");
  const handleChange = (selected) => {
    setSelectedJobPositionOption(selected);
    setSearchParams((prev) => ({
      ...prev,
      JobPosition: selected?.value || "",
      PageIndex: 1,
    }));
  };
  const handleExpChange = (e) => {
    setExpValue(e.target.value);

    setSearchParams((prev) => ({
      ...prev,
      Exp: e.target.value || "",
      PageIndex: 1,
    }));
  };
  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "250px",
    }),
    control: (provided) => ({
      ...provided,
      width: "250px",
      minWidth: "250px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "250px",
      minWidth: "250px",
    }),
    option: (provided) => ({
      ...provided,
      width: "100%",
    }),
    singleValue: (provided) => ({
      ...provided,
      width: "100%",
    }),
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Select
        options={jobPositionOptions}
        styles={customStyles}
        value={selectedJobPositionOption}
        onChange={handleChange}
        placeholder="All Job Position"
        isSearchable
      />
      <input
        type="number"
        placeholder="Years Exp"
        min="0"
        onChange={handleExpChange}
        value={expValue}
        style={{
          height: "42px",
          width: "120px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          fontSize: "16px",
          outline: "none",
        }}
      />
    </div>
  );
};

export default JobPositionDropdown;
