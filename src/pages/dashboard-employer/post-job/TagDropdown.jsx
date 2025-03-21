/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import Select from "react-select";
import { fetchTagsByCategory } from "../../../services/tagServices";

const TagDropdown = ({ setSearchParams, searchParams }) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const getTags = async () => {
    if (searchParams && searchParams.categoryID) {
      try {
        const data = await fetchTagsByCategory(searchParams.categoryID);
        const options = data.map((tag) => ({
          value: tag.tagID,
          label: tag.tagName,
        }));
        setTagOptions(options);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTagOptions([]);
      }
    } else {
      setTagOptions([]); // Reset options when no category
    }
  };

  useEffect(() => {
    setSelectedTags([]);
    getTags();
  }, [searchParams?.categoryID]);

  const handleChange = (selected) => {
    setSelectedTags(selected);
    setSearchParams((prev) => ({
      ...prev,
      jobTagID: selected.map((tag) => tag.value),
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
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e6e6e6",
      borderRadius: "2px",
      margin: "2px 4px 2px 0",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#333",
      fontSize: "12px",
      padding: "0 4px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#666",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#d1d1d1",
        color: "#333",
      },
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
      options={tagOptions}
      styles={customStyles}
      value={selectedTags}
      onChange={handleChange}
      placeholder={
        !searchParams?.categoryID ||
        searchParams?.categoryID === "All Categories"
          ? "Select a category first"
          : "Select Tags"
      }
      isMulti
      isSearchable
      isDisabled={
        !searchParams?.categoryID ||
        searchParams?.categoryID === "All Categories"
      }
    />
  );
};

export default TagDropdown;
