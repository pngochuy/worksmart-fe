import React, { useEffect, useState } from "react";
import Cate from "../../jsons/Category.json";
import Select from "react-select";
import { Tags } from "lucide-react";

const CategoryDropdown = ({ setSearchParams }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState(null);
  useEffect(() => {
    // Chuyển đổi dữ liệu JSON thành format của react-select
    const options = [
      { value: "0", label: "All Categories" }, // Thêm option đầu tiên
      ...Cate.categories.map((cate) => ({
        value: cate.id,
        label: cate.label,
      })),
    ];
    setCategoryOptions(options);
  }, []);

  const handleCategoryChange = (selectedCategories) => {
    console.log(selectedCategories);
    setSelectedCategoryOption(selectedCategories);
    setSearchParams((prev) => ({
      ...prev,
      Category: selectedCategories?.label || "",
      Tags: [],
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
