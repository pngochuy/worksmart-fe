import React, { useEffect, useState } from "react";
import Cate from "../../../jsons/Category.json";
import Select from "react-select";
import { Tags } from "lucide-react";

const CategoryDropdown = ({ setSearchParams, initialCategory }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);

  useEffect(() => {
    console.log("initialCategory", initialCategory)
    // Chuyển đổi dữ liệu JSON thành format của react-select
    const options = [
      { value: "0", label: "All Categories" },
      ...Cate.categories.map((cate) => ({
        value: cate.id,
        label: cate.label,
      })),
    ];
    setCategoryOptions(options);

    //init category 
    if (initialCategory) {
      const matchingOption = options.find(option => option.label === initialCategory);
      if (matchingOption) {
        setSelectedCategoryOption(matchingOption);
      }
    }
  }, [initialCategory, setSearchParams]);

  const handleCategoryChange = (selectedCategories) => {
    console.log(selectedCategories);
    setSelectedCategoryOption(selectedCategories);
    setSearchParams((prev) => ({
      ...prev,
      categoryID: selectedCategories?.label || "",
      tags: [],
    }));
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      minHeight: "36px",
      borderRadius: "4px",
      boxShadow: "none",
      border: "1px solid #F0F5F7",
      padding: "0",
      fontSize: "14px",
      backgroundColor: "#F0F5F7",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 8px",
      maxWidth: "100%",
      overflowX: "auto",
      overflowY: "hidden",
      flexWrap: "nowrap",
      scrollbarWidth: "thin",
      "&::-webkit-scrollbar": {
        height: "6px",
        width: "0", // Hide vertical scrollbar
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#c1c1c1",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#a8a8a8",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f5f5f5"
        : state.isFocused
        ? "#f8f8f8"
        : null,
      color: "#333",
      padding: "8px 12px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
      fontSize: "14px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#666",
      fontSize: "14px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#888",
      padding: "0 8px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: "0 8px",
      color: "#888",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };

  return (
    <Select
      placeholder="All Categories"
      styles={customStyles}
      options={categoryOptions}
      onChange={handleCategoryChange}
      value={selectedCategoryOption}
      isSearchable
    />
  );
};

export default CategoryDropdown;