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
    { value: "Other", label: "Other" },
  ]);

  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");
  const handleChange = (selected) => {
    if (selected?.value === "Other") {
      setCustomInput("");
      setSelectedOption({ value: "Other", label: "" });
      setSearchParams((prev) => ({
        ...prev,
        WorkType: "",
        PageIndex: 1,
      }));
    } else {
      setSelectedOption(selected);
      setCustomInput("");
      setSearchParams((prev) => ({
        ...prev,
        WorkType: selected?.value || "",
        PageIndex: 1,
      }));
    }
  };
  const handleInputBlur = (e) => {
    const newValue = customInput.trim();
    setSelectedOption({ value: newValue, label: newValue });
    setSearchParams((prev) => ({
      ...prev,
      WorkType: newValue,
      PageIndex: 1,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newValue = customInput.trim();
      setSelectedOption({ value: newValue, label: newValue });
      setSearchParams((prev) => ({
        ...prev,
        WorkType: newValue,
        PageIndex: 1,
      }));
    } else if (e.key === " ") {
      e.stopPropagation();
    }
  };
  const handleCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomInput(value);
  };
  const customInputStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    background: "transparent",
    fontSize: "1rem",
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "200px",
    }),
    control: (provided) => ({
      ...provided,
      width: "200px",
      minWidth: "200px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "200px",
      minWidth: "200px",
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
      value={
        selectedOption?.value === "Other"
          ? {
              value: "Other",
              label: (
                <input
                  type="text"
                  style={customInputStyle}
                  placeholder="Enter WorkType"
                  autoFocus
                  className="chosen-select"
                  value={customInput}
                  onChange={handleCustomInputChange}
                  onClick={(e) => e.stopPropagation()} // Ngăn dropdown đóng khi click vào input
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                />
              ),
            }
          : selectedOption
      }
      onChange={handleChange}
      placeholder="WorkType"
      isSearchable
    />
  );
};

export default WorkTypeDropdown;
