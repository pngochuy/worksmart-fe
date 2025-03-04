import { useEffect, useState } from "react";
import Select from "react-select";
import { fetchTags } from "../../services/tagServices";

const TagDropdown = ({ setSearchParams }) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const getTags = async () => {
    const data = await fetchTags();
    const options = data.map((tag) => ({
      value: tag.tagID,
      label: tag.tagName,
    }));
    setTagOptions(options);
  };

  useEffect(() => {
    getTags();
  }, []);

  const handleChange = (selected) => {
    setSelectedTags(selected);
    setSearchParams((prev) => ({
      ...prev,
      Tags: selected.map((tag) => tag.value),
      PageIndex: 1,
    }));
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "65vh",
      minHeight: "40px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      border: "1px solid #e0e0e0",
      position: "relative", // Ensure proper positioning
    }),
    valueContainer: (provided) => ({
      ...provided,
      display: "flex",
      flexWrap: "nowrap",
      overflowX: "auto", // Ensure horizontal scrolling is enabled
      overflowY: "hidden",
      maxWidth: "100%",
      padding: "4px 8px",
      scrollbarWidth: "auto", // Show scrollbar in Firefox
      msOverflowStyle: "auto", // Show scrollbar in IE/Edge
      WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS

      // Custom scrollbar for WebKit browsers
      "&::-webkit-scrollbar": {
        height: "8px", // Height of the scrollbar
        width: "8px", // Width of the scrollbar
        backgroundColor: "transparent",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "rgba(0,0,0,0.06)",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#f0f0f0",
      borderRadius: "6px",
      padding: "4px 6px",
      margin: "2px 4px 2px 0",
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      border: "1px solid #e0e0e0",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      fontSize: "12px",
      maxWidth: "200px",
      overflow: "visible",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      cursor: "pointer",
      marginLeft: "4px",
      borderRadius: "4px",
      ":hover": {
        backgroundColor: "#ff4d4d",
        color: "white",
      },
    }),
  };

  return (
    <Select
      options={tagOptions}
      styles={customStyles}
      value={selectedTags}
      onChange={handleChange}
      placeholder="Select Tags"
      isMulti
      isSearchable
    />
  );
};

export default TagDropdown;
