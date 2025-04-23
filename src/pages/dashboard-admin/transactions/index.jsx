import { useState, useEffect } from "react";
import axios from "axios";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "./TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { formatDateTime } from "@/helpers/formatDateTime";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const Index = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch transactions data
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BACKEND_API_URL}/transactions/getAll`
      );

      setAllTransactions(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again later.");
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />,
      },
      PENDING: {
        color: "bg-amber-100 text-amber-800",
        icon: <Clock className="h-4 w-4" />,
      },
      FAILED: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4" />,
      },
    };

    return (
      <Badge
        className={`w-1/2 rounded-md ${statusConfig[status].color} flex items-center gap-1 hover:bg-opacity-80 transition duration-200`}
      >
        {statusConfig[status].icon}
        {status}
      </Badge>
    );
  };

  // Export transactions to Excel
  const handleExportExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Format data for Excel
      const formattedData = allTransactions.map((transaction) => ({
        "Order Code": `#${transaction.orderCode}`,
        "User ID": transaction.userID,
        Content: transaction.content,
        "Amount (VND)": transaction.price,
        Status: transaction.status,
        Date: formatDateTime(transaction.createdAt),
      }));

      // Create a worksheet from the formatted data
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Set column widths
      ws["!cols"] = [
        { wch: 15 }, // Order Code
        { wch: 15 }, // User ID
        { wch: 40 }, // Content
        { wch: 15 }, // Amount
        { wch: 15 }, // Status
        { wch: 15 }, // Date
      ];

      // Style the header row
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;

        ws[address].s = {
          fill: { fgColor: { rgb: "4472C4" }, patternType: "solid" },
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } },
          },
        };
      }

      // Style data rows with alternating colors
      for (let R = 1; R <= range.e.r; ++R) {
        const isAlternateRow = R % 2 === 1;
        const rowColor = isAlternateRow ? "F2F2F2" : "FFFFFF";

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;

          ws[cellAddress].s = {
            fill: { fgColor: { rgb: rowColor }, patternType: "solid" },
            alignment: { vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
          };

          // Special formatting for status cells
          if (C === 4) {
            // Status column
            const status = ws[cellAddress].v;
            let fillColor;

            if (status === "Completed") {
              fillColor = "92D050"; // Green
            } else if (status === "Pending") {
              fillColor = "FFC000"; // Amber
            } else if (status === "Failed") {
              fillColor = "FF9999"; // Light red
            }

            if (fillColor) {
              ws[cellAddress].s = {
                ...ws[cellAddress].s,
                fill: { fgColor: { rgb: fillColor }, patternType: "solid" },
                font: { bold: true, color: { rgb: "FFFFFF" } },
                alignment: { vertical: "center", horizontal: "center" },
              };
            }
          }
        }
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      // Generate filename with current date
      const currentDate = format(new Date(), "yyyy-MM-dd");
      const fileName = `Transactions_${currentDate}.xlsx`;

      // Export the Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      // Show success notification
      toast.success(
        `Exported ${allTransactions.length} transactions to Excel successfully`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export transactions to Excel. Please try again.");
    }
  };

  // Define columns for the table
  const columns = [
    {
      accessorKey: "orderCode",
      header: "Order Code",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original.orderCode}</span>
      ),
    },
    {
      accessorKey: "userID",
      header: "User ID",
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.content}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Amount (VND)",
      cell: ({ row }) => (
        <span>{new Intl.NumberFormat("en-US").format(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ];

  // Đảm bảo state pagination được thiết lập đúng
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Create table instance with TanStack Table
  const table = useReactTable({
    data: allTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: {
      rowSelection,
      pagination, // Sử dụng state pagination
    },
    onPaginationChange: setPagination,
  });

  return (
    <>
      <section className="report-dashboard">
        <div className="dashboard-outer" style={{ padding: "30px 30px" }}>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className=" mb-4" style={{ padding: "20px 30px 30px" }}>
                    <h2 className="text-3xl font-bold mb-4">Transactions</h2>
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-6">
                        {/* Last Updated Date Display */}
                        <div className="text-sm text-gray-500">
                          {lastUpdated && (
                            <>
                              Last updated:{" "}
                              {format(lastUpdated, "MMM d, yyyy, HH:mm:ss")}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={fetchTransactions}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button onClick={handleExportExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                          </Button>
                        </div>
                      </div>

                      {error ? (
                        <div className="bg-red-50 p-4 rounded-md border border-red-200">
                          <p className="text-red-600">{error}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                {table.getHeaderGroups().map((headerGroup) =>
                                  headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                                    >
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </th>
                                  ))
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {isLoading ? (
                                Array(5)
                                  .fill(0)
                                  .map((_, index) => (
                                    <tr key={index}>
                                      {Array(6)
                                        .fill(0)
                                        .map((_, i) => (
                                          <td key={i} className="px-4 py-3">
                                            <Skeleton className="h-4 w-[100px]" />
                                          </td>
                                        ))}
                                    </tr>
                                  ))
                              ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={columns.length}
                                    className="px-4 py-6 text-center text-gray-500"
                                  >
                                    No transactions found
                                  </td>
                                </tr>
                              ) : (
                                table.getRowModel().rows.map((row) => (
                                  <tr
                                    key={row.id}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    {row.getVisibleCells().map((cell) => (
                                      <td
                                        key={cell.id}
                                        className="px-4 py-3 text-sm"
                                      >
                                        {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>

                          {/* Pagination */}
                          <TablePagination table={table} />
                        </div>
                      )}
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
