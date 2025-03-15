/* eslint-disable react/prop-types */
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
// import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarDatePicker({
  id = "calendar-date-picker",
  className,
  date,
  closeOnSelect = false,
  numberOfMonths = 2,
  yearsRange = 10,
  onDateSelect,
  variant = "default",
}) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState(
    numberOfMonths === 2 ? "This Year" : "Today"
  );
  const [monthFrom, setMonthFrom] = React.useState(date?.from);
  const [yearFrom, setYearFrom] = React.useState(date?.from?.getFullYear());
  const [monthTo, setMonthTo] = React.useState(
    numberOfMonths === 2 ? date?.to : date?.from
  );
  const [yearTo, setYearTo] = React.useState(
    numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
  );
  const [highlightedPart, setHighlightedPart] = React.useState(null);

  const handleClose = () => setIsPopoverOpen(false);
  const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

  const selectDateRange = (from, to, range) => {
    const startDate = startOfDay(from);
    const endDate = numberOfMonths === 2 ? endOfDay(to) : startDate;
    onDateSelect({ from: startDate, to: endDate });
    setSelectedRange(range);
    setMonthFrom(from);
    setYearFrom(from.getFullYear());
    setMonthTo(to);
    setYearTo(to.getFullYear());
    closeOnSelect && setIsPopoverOpen(false);
  };

  const handleDateSelect = (range) => {
    if (range) {
      let from = startOfDay(range.from);
      let to = range.to ? endOfDay(range.to) : from;
      if (numberOfMonths === 1) {
        if (range.from !== date.from) {
          to = from;
        } else {
          from = startOfDay(range.to);
        }
      }
      onDateSelect({ from, to });
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
    }
    setSelectedRange(null);
  };

  const handleMonthChange = (newMonthIndex, part) => {
    setSelectedRange(null);
    if (part === "from") {
      if (yearFrom !== undefined) {
        if (newMonthIndex < 0 || newMonthIndex > 11) return;
        const newMonth = new Date(yearFrom, newMonthIndex, 1);
        const from =
          numberOfMonths === 2
            ? startOfMonth(newMonth)
            : date?.from
            ? new Date(
                date.from.getFullYear(),
                newMonth.getMonth(),
                date.from.getDate()
              )
            : newMonth;
        const to =
          numberOfMonths === 2
            ? date.to
              ? endOfDay(date.to)
              : endOfMonth(newMonth)
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setMonthFrom(newMonth);
          setMonthTo(date.to);
        }
      }
    } else {
      if (yearTo !== undefined) {
        if (newMonthIndex < 0 || newMonthIndex > 11) return;
        const newMonth = new Date(yearTo, newMonthIndex, 1);
        const from = date.from ? startOfDay(date.from) : startOfMonth(newMonth);
        const to = numberOfMonths === 2 ? endOfMonth(newMonth) : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setMonthTo(newMonth);
          setMonthFrom(date.from);
        }
      }
    }
  };

  const handleYearChange = (newYear, part) => {
    setSelectedRange(null);
    if (part === "from") {
      if (years.includes(newYear)) {
        const newMonth = monthFrom
          ? new Date(newYear, monthFrom.getMonth(), 1)
          : new Date(newYear, 0, 1);
        const from =
          numberOfMonths === 2
            ? startOfMonth(newMonth)
            : date.from
            ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
            : newMonth;
        const to =
          numberOfMonths === 2
            ? date.to
              ? endOfDay(date.to)
              : endOfMonth(newMonth)
            : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setYearFrom(newYear);
          setMonthFrom(newMonth);
          setYearTo(date.to?.getFullYear());
          setMonthTo(date.to);
        }
      }
    } else {
      if (years.includes(newYear)) {
        const newMonth = monthTo
          ? new Date(newYear, monthTo.getMonth(), 1)
          : new Date(newYear, 0, 1);
        const from = date.from ? startOfDay(date.from) : startOfMonth(newMonth);
        const to = numberOfMonths === 2 ? endOfMonth(newMonth) : from;
        if (from <= to) {
          onDateSelect({ from, to });
          setYearTo(newYear);
          setMonthTo(newMonth);
          setYearFrom(date.from?.getFullYear());
          setMonthFrom(date.from);
        }
      }
    }
  };

  const today = new Date();

  const years = Array.from(
    { length: yearsRange + 1 },
    (_, i) => today.getFullYear() - Math.floor(yearsRange / 2) + i
  );

  const dateRanges = [
    { label: "Today", start: today, end: today },
    { label: "Yesterday", start: subDays(today, 1), end: subDays(today, 1) },
    {
      label: "This Week",
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    },
    {
      label: "Last Week",
      start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
      end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
    },
    { label: "Last 7 Days", start: subDays(today, 6), end: today },
    {
      label: "This Month",
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    {
      label: "Last Month",
      start: startOfMonth(subDays(today, today.getDate())),
      end: endOfMonth(subDays(today, today.getDate())),
    },
    { label: "This Year", start: startOfYear(today), end: endOfYear(today) },
    {
      label: "Last Year",
      start: startOfYear(subDays(today, 365)),
      end: endOfYear(subDays(today, 365)),
    },
  ];

  const handleMouseOver = (part) => {
    setHighlightedPart(part);
  };

  const handleMouseLeave = () => {
    setHighlightedPart(null);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    setSelectedRange(null);
    if (highlightedPart === "firstDay") {
      const newDate = new Date(date.from);
      const increment = event.deltaY > 0 ? -1 : 1;
      newDate.setDate(newDate.getDate() + increment);
      if (newDate <= date.to) {
        numberOfMonths === 2
          ? onDateSelect({ from: newDate, to: new Date(date.to) })
          : onDateSelect({ from: newDate, to: newDate });
        setMonthFrom(newDate);
      } else if (newDate > date.to && numberOfMonths === 1) {
        onDateSelect({ from: newDate, to: newDate });
        setMonthFrom(newDate);
      }
    } else if (highlightedPart === "firstMonth") {
      const currentMonth = monthFrom ? monthFrom.getMonth() : 0;
      const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
      handleMonthChange(newMonthIndex, "from");
    } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
      const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1);
      handleYearChange(newYear, "from");
    } else if (highlightedPart === "secondDay") {
      const newDate = new Date(date.to);
      const increment = event.deltaY > 0 ? -1 : 1;
      newDate.setDate(newDate.getDate() + increment);
      if (newDate >= date.from) {
        onDateSelect({ from: new Date(date.from), to: newDate });
        setMonthTo(newDate);
      }
    } else if (highlightedPart === "secondMonth") {
      const currentMonth = monthTo ? monthTo.getMonth() : 0;
      const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
      handleMonthChange(newMonthIndex, "to");
    } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
      const newYear = yearTo + (event.deltaY > 0 ? -1 : 1);
      handleYearChange(newYear, "to");
    }
  };

  React.useEffect(() => {
    const firstDayElement = document.getElementById(`firstDay-${id}`);
    const firstMonthElement = document.getElementById(`firstMonth-${id}`);
    const firstYearElement = document.getElementById(`firstYear-${id}`);
    const secondDayElement = document.getElementById(`secondDay-${id}`);
    const secondMonthElement = document.getElementById(`secondMonth-${id}`);
    const secondYearElement = document.getElementById(`secondYear-${id}`);

    const elements = [
      firstDayElement,
      firstMonthElement,
      firstYearElement,
      secondDayElement,
      secondMonthElement,
      secondYearElement,
    ];

    const addPassiveEventListener = (element) => {
      if (element) {
        element.addEventListener(
          "wheel",
          (e) => handleWheel(e, element.id.split("-")[0]),
          {
            passive: false,
          }
        );
      }
    };

    elements.forEach(addPassiveEventListener);

    return () => {
      elements.forEach((element) => {
        if (element) {
          element.removeEventListener("wheel", (e) =>
            handleWheel(e, element.id.split("-")[0])
          );
        }
      });
    };
  }, [highlightedPart, date, id]);

  return (
    <>
      <style>
        {`
          .date-part {
            touch-action: none;
          }
        `}
      </style>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={variant}
            className={cn(
              "w-auto justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            onClick={handleTogglePopover}
            suppressHydrationWarning
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {date?.from ? (
                date.to ? (
                  <>
                    <span
                      id={`firstDay-${id}`}
                      className={cn(
                        "date-part",
                        highlightedPart === "firstDay" && "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("firstDay")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "dd")}
                    </span>{" "}
                    <span
                      id={`firstMonth-${id}`}
                      className={cn(
                        "date-part",
                        highlightedPart === "firstMonth" &&
                          "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("firstMonth")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "LLL")}
                    </span>
                    ,{" "}
                    <span
                      id={`firstYear-${id}`}
                      className={cn(
                        "date-part",
                        highlightedPart === "firstYear" && "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("firstYear")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "y")}
                    </span>
                    {numberOfMonths === 2 && (
                      <>
                        {" - "}
                        <span
                          id={`secondDay-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "secondDay" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("secondDay")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {format(date.to, "dd")}
                        </span>{" "}
                        <span
                          id={`secondMonth-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "secondMonth" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("secondMonth")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {format(date.to, "LLL")}
                        </span>
                        ,{" "}
                        <span
                          id={`secondYear-${id}`}
                          className={cn(
                            "date-part",
                            highlightedPart === "secondYear" &&
                              "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("secondYear")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {format(date.to, "y")}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      id="day"
                      className={cn(
                        "date-part",
                        highlightedPart === "day" && "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("day")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "dd")}
                    </span>{" "}
                    <span
                      id="month"
                      className={cn(
                        "date-part",
                        highlightedPart === "month" && "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("month")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "LLL")}
                    </span>
                    ,{" "}
                    <span
                      id="year"
                      className={cn(
                        "date-part",
                        highlightedPart === "year" && "underline font-bold"
                      )}
                      onMouseOver={() => handleMouseOver("year")}
                      onMouseLeave={handleMouseLeave}
                    >
                      {format(date.from, "y")}
                    </span>
                  </>
                )
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        {isPopoverOpen && (
          <PopoverContent
            className="w-auto"
            // align="start"
            align="center" // Thay đổi từ "start" thành "center"
            side="bottom" // Thêm thuộc tính này để nó hiển thị ở dưới button
            avoidCollisions={true} // Đổi thành true để tránh trường hợp tràn ra ngoài màn hình
            alignOffset={-50} // Thêm offset để dịch nó sang trái một chút
            // avoidCollisions={false}
            onInteractOutside={handleClose}
            onEscapeKeyDown={handleClose}
            style={{
              maxHeight: "var(--radix-popover-content-available-height)",
              overflowY: "auto",
            }}
          >
            <div className="flex">
              {numberOfMonths === 2 && (
                <div className="flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                  {dateRanges.map(({ label, start, end }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start hover:bg-primary/90 hover:text-background",
                        selectedRange === label &&
                          "bg-primary text-background hover:bg-primary/90 hover:text-background"
                      )}
                      onClick={() => {
                        selectDateRange(start, end, label);
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 ml-3">
                    <Select
                      onValueChange={(value) => {
                        handleMonthChange(months.indexOf(value), "from");
                        setSelectedRange(null);
                      }}
                      value={
                        monthFrom ? months[monthFrom.getMonth()] : undefined
                      }
                    >
                      <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, idx) => (
                          <SelectItem key={idx} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => {
                        handleYearChange(Number(value), "from");
                        setSelectedRange(null);
                      }}
                      value={yearFrom ? yearFrom.toString() : undefined}
                    >
                      <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year, idx) => (
                          <SelectItem key={idx} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {numberOfMonths === 2 && (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          handleMonthChange(months.indexOf(value), "to");
                          setSelectedRange(null);
                        }}
                        value={monthTo ? months[monthTo.getMonth()] : undefined}
                      >
                        <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, idx) => (
                            <SelectItem key={idx} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => {
                          handleYearChange(Number(value), "to");
                          setSelectedRange(null);
                        }}
                        value={yearTo ? yearTo.toString() : undefined}
                      >
                        <SelectTrigger className="w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year, idx) => (
                            <SelectItem key={idx} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex">
                  <Calendar
                    mode="range"
                    defaultMonth={monthFrom}
                    month={monthFrom}
                    onMonthChange={setMonthFrom}
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={numberOfMonths}
                    showOutsideDays={false}
                    className="custom-calendar"
                    classNames={{
                      day_selected:
                        "bg-gray-900 text-white hover:bg-gray-900 hover:text-white",
                      day_today: "bg-gray-100 text-gray-900",
                      day_range_middle: "bg-gray-100",
                      day_range_end:
                        "bg-gray-900 text-white hover:bg-gray-900 hover:text-white",
                      day_range_start:
                        "bg-gray-900 text-white hover:bg-gray-900 hover:text-white",
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
}

CalendarDatePicker.displayName = "CalendarDatePicker";
