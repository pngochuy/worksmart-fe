import React, { useEffect, useState } from "react";
import Select from "react-select";
import Major from "../../jsons/Major.json";
const MajorDropdown = ({ setSearchParams }) => {
  const [majorOptions, setMajorOptions] = useState([]);

  useEffect(() => {
    // Chuyển đổi dữ liệu JSON thành format của react-select
    const options = Major.majors.map((major) => ({
      value: major.value,
      label: major.name,
    }));
    setMajorOptions(options);
  }, []);

  const [selectedMajorOption, setSelectedMajorOption] = useState("");

  const handleChange = (selected) => {
    setSelectedMajorOption(selected);
    setSearchParams((prev) => ({
      ...prev,
      Major: selected?.value || "",
      PageIndex: 1,
    }));
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "220px",
    }),
    control: (provided) => ({
      ...provided,
      width: "220px",
      minWidth: "220px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "220px",
      minWidth: "220px",
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
      value={selectedMajorOption}
      onChange={handleChange}
      placeholder="Major"
      isSearchable
    />
  );
};

export default MajorDropdown;
