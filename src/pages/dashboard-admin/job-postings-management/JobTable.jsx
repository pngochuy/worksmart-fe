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
import { createColumns } from "./JobTableColumns";
import { TableToolbar } from "./TableToolbar";
import "react-toastify/dist/ReactToastify.css";

export const JobTable = ({
  data: initialData,
  isLoading: initialIsLoading,
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    jobID: false,
    title: true,
    education: false,
    workType: true,
    location: true,
    salary: true,
    exp: false,
    status: true,
    priority: false,
    deadline: false,
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

  // Callback function để cập nhật status của job
  const handleStatusChange = useCallback((jobId, newStatus) => {
    setData((currentData) =>
      currentData.map((job) =>
        job.jobID === jobId ? { ...job, status: newStatus } : job
      )
    );
  }, []);

  // Tạo columns với callback function
  const columns = createColumns(handleStatusChange);

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
