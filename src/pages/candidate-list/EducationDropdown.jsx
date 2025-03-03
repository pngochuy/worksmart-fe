import React, { useState } from "react";
import Select from "react-select";

const EducationDropdown = ({ setSearchParams }) => {
  const [educationOptions] = useState([
    { value: "", label: "Education Level" },
    { value: "Associate", label: "Associate" },
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
    { value: "Doctor", label: "Doctor" },
  ]);

  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (selected) => {
    setSelectedOption(selected);
    setSearchParams((prev) => ({
      ...prev,
      Education: selected?.value || "",
      PageIndex: 1,
    }));
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "170px",
    }),
    control: (provided) => ({
      ...provided,
      width: "170px",
      minWidth: "170px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "170px",
      minWidth: "170px",
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
      value={selectedOption}
      onChange={handleChange}
      placeholder="Education Level"
      isSearchable
    />
  );
};

export default EducationDropdown;
