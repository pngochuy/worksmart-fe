import React, { useState, useEffect } from "react";
import Select from "react-select";
import { fetchTags } from "../../../services/tagServices";

const TagDropdown = ({ setSearchParams, initialTags = [] }) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Set up tag options from API
  useEffect(() => {
    const getTags = async () => {
      try {
        const data = await fetchTags();
        const options = data.map((tag) => ({
          value: tag.tagID,
          label: tag.tagName,
        }));
        setTagOptions(options);

        // Xử lý initialTags khi có options
        processInitialTags(options, initialTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    getTags();
  }, []);

  // Update selected tags when initialTags changes
  useEffect(() => {
    if (tagOptions.length > 0) {
      processInitialTags(tagOptions, initialTags);
    }
  }, [initialTags, tagOptions]);

  // Hàm xử lý initialTags
  const processInitialTags = (options, tags) => {
    if (tags && tags.length > 0) {
      // Chuyển đổi nếu tags không phải array
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      
      // Tìm các tags đã chọn từ options
      // Khớp theo cả value và label
      let initialSelectedOptions = options.filter(option => 
        tagsArray.includes(option.value) || 
        tagsArray.includes(option.label)
      );
      
      // Nếu có tags đã chọn
      if (initialSelectedOptions.length > 0) {
        setSelectedTags(initialSelectedOptions);
      }
    }
  };

  const handleChange = (selected) => {
    const newSelected = selected || [];
    setSelectedTags(newSelected);
    
    // Cập nhật giá trị vào component cha
    setSearchParams((prev) => ({
      ...prev,
      jobTagID: newSelected.map((tag) => tag.value),
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
      '&::-webkit-scrollbar': {
        height: '6px',
        width: '0',  // Hide vertical scrollbar
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#a8a8a8',
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#f5f5f5" : state.isFocused ? "#f8f8f8" : null,
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
      display: "none"
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#f5f5f5",
      borderRadius: "2px",
      margin: "2px 4px 2px 0",
      flexShrink: 0,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#333",
      padding: "2px 4px",
      fontSize: "13px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#666",
      padding: "0 4px",
      ':hover': {
        backgroundColor: '#e0e0e0',
        color: '#333',
      },
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
      defaultValue={selectedTags}
      onChange={handleChange}
      placeholder="Select Tags"
      isMulti
      isSearchable
    />
  );
};

export default TagDropdown;