/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { TableContent } from "./TableContent";
import { TablePagination } from "./TablePagination";
import { createColumns } from "./UserTableColumns";
import { UserToolbar } from "./UserToolbar";
import "react-toastify/dist/ReactToastify.css";

export const UserTable = ({
  data: initialData,
  isLoading: initialIsLoading,
  onStatusChange,
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    userID: false,
    userName: false,
    fullName: true,
    email: true,
    role: true,
    verificationLevel: true,
    phoneNumber: false,
    isBanned: true,
    gender: false,
    address: false,
    createdAt: true,
    updatedAt: false,
    actions: true,
  });
  const [rowSelection, setRowSelection] = useState({});

  // Update data and loading state when initialData changes
  useEffect(() => {
    setData(initialData || []);
    setIsLoading(initialIsLoading);
  }, [initialData, initialIsLoading]);

  // Callback function to handle manual data refresh
  const handleRefreshData = useCallback(
    (newData) => {
      setData(newData || []);
      setIsLoading(false);

      // Notify parent component (Index.jsx) about the refreshed data
      if (newData && newData.length > 0 && onStatusChange) {
        // Pass a special flag to indicate this is a full refresh with new data
        onStatusChange(newData[0].userID, { refreshAll: true, newData });
      }
    },
    [onStatusChange]
  );

  // Create columns with callback function
  const columns = createColumns(onStatusChange);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="w-full">
      <UserToolbar table={table} onRefreshData={handleRefreshData} />
      <TableContent table={table} isLoading={isLoading} />
      <TablePagination table={table} />
    </div>
  );
};
