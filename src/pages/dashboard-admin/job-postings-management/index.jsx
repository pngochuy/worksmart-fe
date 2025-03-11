import * as React from "react";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllJobs } from "@/services/adminServices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "jobID",
    header: "Job ID",
    cell: ({ row }) => <div>{row.getValue("jobID")}</div>,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "education",
    header: "Education",
    cell: ({ row }) => <div>{row.getValue("education")}</div>,
  },
  {
    accessorKey: "workType",
    header: "Work Type",
    cell: ({ row }) => <div>{row.getValue("workType")}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <div>{row.getValue("location")}</div>,
  },
  {
    accessorKey: "salary",
    header: "Salary (VND)",
    cell: ({ row }) => {
      const salary = parseFloat(row.getValue("salary"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "decimal",
        currency: "VND",
      }).format(salary);

      return <div className="text-left font-medium">{formatted}</div>; // Ensure text is aligned left
    },
  },
  {
    accessorKey: "exp",
    header: "Experience (Years)",
    cell: ({ row }) => <div> {row.getValue("exp")}</div>,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <div>{row.getValue("priority") ? "Yes" : "No"}</div>,
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("deadline")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("updatedAt")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false, // ko xuất hiện trong button Columns
    cell: ({ row }) => {
      const job = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.jobID)}
            >
              Copy Job ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Job Details</DropdownMenuItem>
            <DropdownMenuItem>View Company</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const Index = () => {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  //   const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({
    jobID: false,
    title: true,
    education: false,
    workType: true,
    location: true,
    salary: true,
    exp: false,
    priority: false,
    deadline: true,
    createdAt: true,
    updatedAt: false,
    actions: true,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [jobData, setJobData] = React.useState([]); // State to store the API data

  // Fetch job data from API
  React.useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await getAllJobs();

        setJobData(response);
      } catch (err) {
        console.error("Error fetching job data:", err);
      }
    };

    fetchJobData();
  }, []);

  const table = useReactTable({
    data: jobData,
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
    // Thiết lập số dòng mặc định mỗi trang
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });
  console.log("table", table.getRowModel());
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h2 className="text-3xl">Job Postings Management</h2>
                    <div className="w-full">
                      <div className="flex items-center py-4">
                        <Input
                          placeholder="Filter titles..."
                          value={
                            table.getColumn("title")?.getFilterValue() || ""
                          }
                          onChange={(event) =>
                            table
                              .getColumn("title")
                              ?.setFilterValue(event.target.value)
                          }
                          className="max-w-sm"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                              Columns <ChevronDown />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {table
                              .getAllColumns()
                              .filter((column) => column.getCanHide()) // lấy hết columns
                              .map((column) => (
                                <DropdownMenuCheckboxItem
                                  key={column.id}
                                  className="capitalize"
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                  }
                                >
                                  {column.id}
                                </DropdownMenuCheckboxItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table.getRowModel().rows.length ? (
                              table.getRowModel().rows.map((row) => (
                                <TableRow
                                  key={row.id}
                                  data-state={row.getIsSelected() && "selected"}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={columns.length}
                                  className="h-24 text-center"
                                >
                                  No results.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                          {table.getFilteredSelectedRowModel().rows.length} of{" "}
                          {table.getFilteredRowModel().rows.length} row(s)
                          selected.
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">Rows per page</p>
                          <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                              table.setPageSize(Number(value));
                            }}
                          >
                            <SelectTrigger className="h-8 w-[70px]">
                              <SelectValue
                                placeholder={
                                  table.getState().pagination.pageSize
                                }
                              />
                            </SelectTrigger>
                            <SelectContent side="top">
                              {[5, 10, 20, 30, 40].map((pageSize) => (
                                <SelectItem
                                  key={pageSize}
                                  value={`${pageSize}`}
                                >
                                  {pageSize}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              className="hidden h-8 w-8 p-0 lg:flex"
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                            >
                              <span className="sr-only">Go to first page</span>
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => table.previousPage()}
                              disabled={!table.getCanPreviousPage()}
                            >
                              <span className="sr-only">
                                Go to previous page
                              </span>
                              <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                console.log("Previous page");
                                table.nextPage();
                              }}
                              disabled={!table.getCanNextPage()}
                            >
                              <span className="sr-only">Go to next page</span>
                              <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="hidden h-8 w-8 p-0 lg:flex"
                              onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                              }
                              disabled={!table.getCanNextPage()}
                            >
                              <span className="sr-only">Go to last page</span>
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
