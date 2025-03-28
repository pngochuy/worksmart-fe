/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { CalendarDatePicker } from "@/components/CalendarDatePicker";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { RefreshCcwIcon } from "lucide-react";
import { getAllUsers } from "@/services/adminServices";

export const userRoles = [
  { value: "Admin", label: "Admin" },
  { value: "Employer", label: "Employer" },
  { value: "Candidate", label: "Candidate" },
];

export const verificationLevels = [
  { value: 1, label: "Basic Verification" },
  { value: 2, label: "Tax Verified" },
  { value: 3, label: "Fully Verified" },
];

export const userStatuses = [
  { value: true, label: "Banned" },
  { value: false, label: "Active" },
];

export const taxStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const licenseStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const UserToolbar = ({ table, onRefreshData }) => {
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
  const [showEmployerFilters, setShowEmployerFilters] = useState(false);

  // Kiểm tra xem filter Role có chọn Employer không
  useEffect(() => {
    const roleFilter = table
      .getState()
      .columnFilters.find((filter) => filter.id === "role");
    if (roleFilter && roleFilter.value.includes("Employer")) {
      setShowEmployerFilters(true);
    } else {
      setShowEmployerFilters(false);

      // Nếu đang bỏ filter role=Employer, cần clear các filter liên quan đến Employer
      const taxStatusFilter = table
        .getColumn("taxVerificationStatus")
        ?.getFilterValue();
      const licenseStatusFilter = table
        .getColumn("licenseVerificationStatus")
        ?.getFilterValue();
      const verificationFilter = table
        .getColumn("verificationLevel")
        ?.getFilterValue();

      if (taxStatusFilter) {
        table.getColumn("taxVerificationStatus")?.setFilterValue(undefined);
      }

      if (licenseStatusFilter) {
        table.getColumn("licenseVerificationStatus")?.setFilterValue(undefined);
      }

      if (verificationFilter) {
        table.getColumn("verificationLevel")?.setFilterValue(undefined);
      }
    }
  }, [table.getState().columnFilters]);

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
    setShowEmployerFilters(false);

    // Reset dateRange state to update CalendarDatePicker UI
    setDateRange({
      from: beginningOfYear,
      to: today,
    });
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await getAllUsers();

      // Make sure onRefreshData is a function before calling it
      if (onRefreshData && typeof onRefreshData === "function") {
        onRefreshData(response);
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
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
            placeholder="Search email..."
            value={table.getColumn("email")?.getFilterValue() ?? ""}
            onChange={(event) => {
              table.getColumn("email")?.setFilterValue(event.target.value);
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />

          {table.getColumn("role") && (
            <DataTableFacetedFilter
              column={table.getColumn("role")}
              title="Role"
              options={userRoles}
            />
          )}

          {/* Employer-specific filters */}
          {showEmployerFilters && (
            <>
              {table.getColumn("verificationLevel") && (
                <DataTableFacetedFilter
                  column={table.getColumn("verificationLevel")}
                  title="Verification Level"
                  options={verificationLevels}
                />
              )}

              {table.getColumn("taxVerificationStatus") && (
                <DataTableFacetedFilter
                  column={table.getColumn("taxVerificationStatus")}
                  title="Tax Status"
                  options={taxStatuses}
                />
              )}

              {table.getColumn("licenseVerificationStatus") && (
                <DataTableFacetedFilter
                  column={table.getColumn("licenseVerificationStatus")}
                  title="License Status"
                  options={licenseStatuses}
                />
              )}
            </>
          )}

          {table.getColumn("isBanned") && (
            <DataTableFacetedFilter
              column={table.getColumn("isBanned")}
              title="Account Status"
              options={userStatuses}
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
            <span className="ml-1 hidden sm:inline">Refresh</span>
          </Button>
        </div>
        <div className="flex-none ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  );
};
