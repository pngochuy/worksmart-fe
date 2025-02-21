import React, { useState } from "react";
import Select from "react-select";

const EducationDropdown = ({ setSearchParams }) => {
  const [educationOptions] = useState([
    { value: "", label: "Education Level" },
    { value: "Associate", label: "Associate" },
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
    { value: "Doctor", label: "Doctor" },
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
        Education: "",
        PageIndex: 1,
      }));
    } else {
      setSelectedOption(selected);
      setCustomInput("");
      setSearchParams((prev) => ({
        ...prev,
        Education: selected?.value || "",
        PageIndex: 1,
      }));
    }
  };
  const handleInputBlur = (e) => {
    const newValue = customInput.trim();
    setSelectedOption({ value: newValue, label: newValue });
    setSearchParams((prev) => ({
      ...prev,
      Education: newValue,
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
        Education: newValue,
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
      options={educationOptions}
      styles={customStyles}
      value={
        selectedOption?.value === "Other"
          ? {
              value: "Other",
              label: (
                <input
                  type="text"
                  style={customInputStyle}
                  placeholder="Enter Education"
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
      placeholder="Education Level"
      isSearchable
    />
  );
};

export default EducationDropdown;
