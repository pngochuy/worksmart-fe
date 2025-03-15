import React, { useState, useEffect } from "react";
import Select from "react-select";
import { vietnamProvinces } from "../../../helpers/getLocationVN";

const LocationDropdown = ({ setSearchParams, initialLocation = "" }) => {
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Set up location options from vietnamProvinces
  useEffect(() => {
    const options = vietnamProvinces.map((location) => ({
      value: location.name,
      label: location.name,
    }));
    setLocationOptions(options);

    // Xử lý initialLocation khi có options
    processInitialLocation(options, initialLocation);
  }, []);

  // Update selected locations when initialLocation changes
  useEffect(() => {
    if (locationOptions.length > 0) {
      processInitialLocation(locationOptions, initialLocation);
    }
  }, [initialLocation, locationOptions]);

  // Hàm xử lý initialLocation
  const processInitialLocation = (options, locationString) => {
    if (locationString) {
      console.log("Processing initialLocation:", locationString);
      
      // Trường hợp 1: locationString là chuỗi các địa điểm cách nhau bởi dấu phẩy
      let locationArray = [];
      if (typeof locationString === 'string') {
        locationArray = locationString.split(",").map(loc => loc.trim());
      } 
      // Trường hợp 2: locationString là một mảng
      else if (Array.isArray(locationString)) {
        locationArray = locationString;
      }
      
      console.log("Location array:", locationArray);
      
      // Tìm các option tương ứng
      const initialSelectedOptions = options.filter(option => 
        locationArray.includes(option.value) || locationArray.includes(option.label)
      );
      
      console.log("Selected location options:", initialSelectedOptions);
      
      if (initialSelectedOptions.length > 0) {
        setSelectedLocations(initialSelectedOptions);
        
        // Cập nhật parent component với danh sách các địa điểm đã chọn
        updateParentComponent(initialSelectedOptions);
      }
    }
  };

  const updateParentComponent = (selected) => {
    // Convert selected locations to a comma-separated string
    const locationString = selected.map(location => location.value).join(", ");
    
    // Update parent component's state with the location string
    setSearchParams((prev) => ({
      ...prev,
      location: locationString,
    }));
  };

  const handleChange = (selected) => {
    const newSelected = selected || [];
    setSelectedLocations(newSelected);
    updateParentComponent(newSelected);
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
      options={locationOptions}
      styles={customStyles}
      value={selectedLocations}
      defaultValue={selectedLocations}
      onChange={handleChange}
      placeholder="Select Locations"
      isMulti
      isSearchable
    />
  );
};

export default LocationDropdown;