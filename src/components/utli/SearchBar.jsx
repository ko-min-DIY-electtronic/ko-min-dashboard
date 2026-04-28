import { useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ placeholder, onSearch, onClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(searchTerm);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(searchTerm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`
        relative flex items-center w-full
        bg-white border rounded-lg shadow-sm transition-all duration-200
        ${
          isFocused
            ? "border-orange-300 ring-2 ring-orange-100 shadow-md"
            : "border-gray-300 hover:border-gray-400"
        }
      `}
      >
        {/* Search Icon */}
        <div
          className={`absolute left-3 items-center pointer-events-none ${
            isFocused ? "hidden" : "flex"
          }`}
        >
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full h-10 text-sm text-gray-900 placeholder-gray-500
            bg-transparent border-none rounded-lg focus:outline-none
            ${isFocused ? "pl-3" : "pl-10"}
          `}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClick}
            className={`
              absolute right-3 flex items-center justify-center
              w-5 h-5 text-gray-400 hover:text-gray-600
              transition-colors duration-200
            `}
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
