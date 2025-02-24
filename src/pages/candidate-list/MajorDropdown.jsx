import React, { useState } from "react";
import Select from "react-select";

const MajorDropdown = ({ setSearchParams }) => {
  const [majorOptions] = useState([
    { value: "", label: "Major" },
    { value: "IT", label: "IT" },
    { value: "Designer", label: "Designer" },
    { value: "Other", label: "Other" },
  ]);

  const [selectedMajorOption, setSelectedMajorOption] = useState("");
  const [customMajorInput, setCustomMajorInput] = useState("");

  const handleChange = (selected) => {
    if (selected?.value === "Other") {
      setCustomMajorInput("");
      setSelectedMajorOption({ value: "Other", label: "" });
      setSearchParams((prev) => ({
        ...prev,
        Major: "",
        PageIndex: 1,
      }));
    } else {
      setSelectedMajorOption(selected);
      setCustomMajorInput("");
      setSearchParams((prev) => ({
        ...prev,
        Major: selected?.value || "",
        PageIndex: 1,
      }));
    }
  };

  const handleMajorInputBlur = (e) => {
    const newValue = customMajorInput.trim();
    setSelectedMajorOption({ value: newValue, label: newValue });
    setSearchParams((prev) => ({
      ...prev,
      Major: newValue,
      PageIndex: 1,
    }));
  };

  const handleMajorKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newValue = customMajorInput.trim();
      setSelectedMajorOption({ value: newValue, label: newValue });
      setSearchParams((prev) => ({
        ...prev,
        Major: newValue,
        PageIndex: 1,
      }));
    } else if (e.key === " ") {
      e.stopPropagation();
    }
  };

  const handleMajorCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomMajorInput(value);
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
      options={majorOptions}
      styles={customStyles}
      value={
        selectedMajorOption?.value === "Other"
          ? {
              value: "Other",
              label: (
                <input
                  type="text"
                  style={customInputStyle}
                  placeholder="Enter your major"
                  autoFocus
                  className="chosen-select"
                  value={customMajorInput}
                  onChange={handleMajorCustomInputChange}
                  onClick={(e) => e.stopPropagation()} // Ngăn dropdown đóng khi click vào input
                  onKeyDown={handleMajorKeyDown}
                  onBlur={handleMajorInputBlur}
                />
              ),
            }
          : selectedMajorOption
      }
      onChange={handleChange}
      placeholder="Major"
      isSearchable
    />
  );
};

export default MajorDropdown;
