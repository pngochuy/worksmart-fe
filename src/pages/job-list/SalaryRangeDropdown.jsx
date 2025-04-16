import React, { useState } from "react";
import Select from "react-select";

const SalaryRangeDropdown = ({ setSearchParams }) => {
  const [salaryOptions] = useState([
    { value: "", label: "Salary Range" },
    { value: "5000000-10000000", label: "5,000,000 - 10,000,000" },
    { value: "10000000-15000000", label: "10,000,000 - 15,000,000" },
    { value: "15000000-20000000", label: "15,000,000 - 20,000,000" },
    { value: "20000000-30000000", label: "20,000,000 - 30,000,000" },
    { value: "30000000-50000000", label: "30,000,000 - 50,000,000" },
    { value: "50000000-70000000", label: "50,000,000 - 70,000,000" },
    { value: "70000000-100000000", label: "70,000,000 - 100,000,000" },
  ]);

  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = (selected) => {
    setSelectedOption(selected);

    // Tách min và max từ value (VNĐ -> USD)
    const [minVND, maxVND] = selected?.value
      ? selected.value.split("-").map(Number)
      : ["", ""];

    const exchangeRate = 25600; // 1 USD = 24,000 VND (có thể chỉnh sửa)
    const minSalaryUSD = minVND ? (minVND / exchangeRate).toFixed(2) : "";
    const maxSalaryUSD = maxVND ? (maxVND / exchangeRate).toFixed(2) : "";

    setSearchParams((prev) => ({
      ...prev,
      MinSalary: minVND,
      MaxSalary: maxVND,
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
    <Select
      options={salaryOptions}
      styles={customStyles}
      value={selectedOption}
      onChange={handleChange}
      placeholder="Salary Range"
      isSearchable
    />
  );
};

export default SalaryRangeDropdown;
