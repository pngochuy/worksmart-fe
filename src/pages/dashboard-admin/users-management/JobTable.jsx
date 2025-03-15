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
import { TableToolbar } from "./TableToolbar";
import "react-toastify/dist/ReactToastify.css";

export const UserTable = ({
  data: initialData,
  isLoading: initialIsLoading,
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    userID: false,
    fullName: true,
    email: true,
    role: true,
    verificationLevel: true,
    isEmailConfirmed: true,
    isBanned: true,
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
  const handleRefreshData = useCallback((newData) => {
    setData(newData || []);
    setIsLoading(false);
  }, []);

  // Callback function to update user status
  const handleStatusChange = useCallback((userId, isBanned) => {
    setData((currentData) =>
      currentData.map((user) =>
        user.userID === userId ? { ...user, isBanned } : user
      )
    );
  }, []);

  // Create columns with callback function
  const columns = createColumns(handleStatusChange);

  // Default filter for createdAt - last week
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  // Set default filter for createdAt
  useEffect(() => {
    setColumnFilters((prev) => {
      // Check if there's already a filter for createdAt
      const hasDateFilter = prev.some((filter) => filter.id === "createdAt");

      if (!hasDateFilter) {
        // Add new filter for one week
        return [
          ...prev,
          {
            id: "createdAt",
            value: [oneWeekAgo, today],
          },
        ];
      }

      return prev;
    });
  }, []);

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
      <TableToolbar table={table} onRefreshData={handleRefreshData} />
      <TableContent table={table} isLoading={isLoading} />
      <TablePagination table={table} />
    </div>
  );
};
