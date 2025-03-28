/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { CalendarDatePicker } from "@/components/CalendarDatePicker";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { RefreshCcwIcon } from "lucide-react";
import { getAllReportPosts } from "@/services/adminServices";

export const reportStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

export const ReportPostToolbar = ({ table, onRefreshData }) => {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Set date range from beginning of current year to today
  const today = new Date();
  const beginningOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year

  const [dateRange, setDateRange] = useState({
    from: beginningOfYear, // Beginning of year
    to: today, // Current date
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);

  const handleDateSelect = ({ from, to }) => {
    setDateRange({ from, to });
    // Only apply the filter when user selects a date
    table.getColumn("createdAt")?.setFilterValue([from, to]);
    setIsDateFilterApplied(true);
  };

  const handleResetFilters = () => {
    // Reset all table filters
    table.resetColumnFilters();
    setIsDateFilterApplied(false);

    // Reset dateRange state to update CalendarDatePicker UI
    setDateRange({
      from: beginningOfYear,
      to: today,
    });
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await getAllReportPosts();
      onRefreshData(response);
    } catch (err) {
      console.error("Error refreshing report data:", err);
      // Optionally, you could add a toast or error notification here
    } finally {
      setIsRefreshing(false);
    }
  };

  // Monitor if the date filter is removed manually (e.g., through another UI interaction)
  useEffect(() => {
    const filters = table.getState().columnFilters;
    const dateFilter = filters.find((filter) => filter.id === "createdAt");

    if (!dateFilter && isDateFilterApplied) {
      setIsDateFilterApplied(false);
    }
  }, [table.getState().columnFilters, isDateFilterApplied]);

  return (
    <div className="py-4">
      <div className="flex flex-wrap justify-between items-start">
        <div className="flex-1 flex flex-wrap items-center gap-2 max-w-[85%] md:max-w-[90%] pr-2">
          <Input
            placeholder="Search content..."
            value={table.getColumn("content")?.getFilterValue() ?? ""}
            onChange={(event) => {
              table.getColumn("content")?.setFilterValue(event.target.value);
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={reportStatuses}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}

          <CalendarDatePicker
            date={dateRange}
            onDateSelect={handleDateSelect}
            className="w-[150px] sm:w-[180px] md:w-[220px] lg:w-[250px] h-9"
            variant="outline"
            numberOfMonths={2}
            id="table-date-picker"
            closeOnSelect={true}
            yearsRange={10}
          />

          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="h-8 px-2 lg:px-3"
          >
            {isRefreshing ? (
              <RefreshCcwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcwIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-none ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  );
};
