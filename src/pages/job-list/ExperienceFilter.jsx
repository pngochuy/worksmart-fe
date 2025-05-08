import React, { useState } from "react";
import Select from "react-select";
import { GraduationCap } from "lucide-react";

const ExperienceFilter = ({ setSearchParams }) => {
  const [selectedExperience, setSelectedExperience] = useState(null);

  const experienceOptions = [
    { value: "0", label: "Any Experience" },
    { value: "1", label: "1+ Year" },
    { value: "2", label: "2+ Years" },
    { value: "3", label: "3+ Years" },
    { value: "5", label: "5+ Years" },
    { value: "7", label: "7+ Years" },
    { value: "10", label: "10+ Years" },
  ];

  const handleExperienceChange = (selectedOption) => {
    setSelectedExperience(selectedOption);
    setSearchParams((prev) => ({
      ...prev,
      Exp: parseInt(selectedOption?.value || 0),
      PageIndex: 1, // Reset to first page when filter changes
    }));
  };

  // Custom styles to match other dropdowns
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

  // Custom format for the selected value with icon
  const formatOptionLabel = ({ label }) => (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-4 w-4 text-gray-500" />
      <span>{label}</span>
    </div>
  );

  return (
    <Select
      placeholder="Experience Level"
      options={experienceOptions}
      onChange={handleExperienceChange}
      value={selectedExperience}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      isSearchable={false}
    />
  );
};

export default ExperienceFilter;
