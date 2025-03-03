import React, { useState } from "react";
import Select from "react-select";

const WorkTypeDropdown = ({ setSearchParams }) => {
  const [workTypeOptions] = useState([
    { value: "", label: "Work Type" },
    { value: "Part-Time", label: "Part Time" },
    { value: "Internship", label: "Internship" },
    { value: "Freelance", label: "Freelance" },
    { value: "Full-Time", label: "Full Time" },
    { value: "Remote", label: "Remote" },
  ]);

  const [selectedOption, setSelectedOption] = useState("");
  const handleChange = (selected) => {
    setSelectedOption(selected);
    setSearchParams((prev) => ({
      ...prev,
      WorkType: selected?.value || "",
      PageIndex: 1,
    }));
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "150px",
    }),
    control: (provided) => ({
      ...provided,
      width: "150px",
      minWidth: "150px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "150px",
      minWidth: "150px",
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
    <Select
      options={workTypeOptions}
      styles={customStyles}
      value={selectedOption}
      onChange={handleChange}
      placeholder="WorkType"
      isSearchable
    />
  );
};

export default WorkTypeDropdown;
