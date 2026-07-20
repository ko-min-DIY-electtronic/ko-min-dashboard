import React, { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
    key: string;
  }>({
    startDate: startDate || new Date(),
    endDate: endDate || new Date(),
    key: "selection",
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange({
        startDate,
        endDate,
        key: "selection",
      });
    }
  }, [startDate, endDate]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (selection.startDate && selection.endDate) {
      setDateRange({
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: "selection",
      });
    }
  };

  const handleApply = () => {
    onChange(dateRange.startDate, dateRange.endDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null, null);
    setDateRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });
    setIsOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date range";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-primary outline-none w-full h-10 bg-white"
      >
        <Calendar className="w-4 h-4 text-slate-600" />
        <span className="text-sm text-slate-700">
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "Select date range"}
        </span>
        {(startDate || endDate) && (
          <X
            className="w-4 h-4 text-slate-400 hover:text-slate-600 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-auto right-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-2 bg-white rounded-xl shadow-lg border z-50 p-2 sm:p-4 w-[95vw] sm:w-auto max-h-[90vh] sm:max-h-none overflow-y-auto sm:overflow-visible">
            <DateRange
              ranges={[dateRange]}
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              months={1}
              direction={isMobile ? "vertical" : "horizontal"}
              rangeColors={["#3b82f6"]}
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
