import * as React from "react";
import dayjs from "dayjs";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const MyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [clockIn, setClockIn] = useState(null);
  const [clockOut, setClockOut] = useState(null);
  const [breakTime, setBreakTime] = useState("");
  const [savedAnimation, setSavedAnimation] = useState(false); // ✅ New state for animation
  const [storedData, setStoredData] = useState(() => {
    const savedData = localStorage.getItem("storedData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const dateKey = newDate.format("YYYY-MM-DD");

    if (storedData[dateKey]) {
      setClockIn(dayjs(`${dateKey}T${storedData[dateKey].clockIn}`));
      setClockOut(dayjs(`${dateKey}T${storedData[dateKey].clockOut}`));
      setBreakTime(storedData[dateKey].breakTime);
    } else {
      setClockIn(null);
      setClockOut(null);
      setBreakTime("");
    }
  };

  const renderDay = (dayProps) => {
    const timestamp = dayProps["data-timestamp"];
    if (!timestamp) return null;

    const dayJsDay = dayjs(Number(timestamp));
    if (!dayJsDay.isValid()) return null;

    const dateKey = dayJsDay.format("YYYY-MM-DD");
    const hasData = !!storedData[dateKey];

    return (
      <PickersDay
        {...dayProps}
        day={dayJsDay}
        onClick={() => handleDateChange(dayJsDay)}
        selected={dayJsDay.isSame(selectedDate, "day")}
        sx={{
          backgroundColor: hasData ? "#90caf9" : "inherit",
          borderRadius: "50%",
          "&.Mui-selected": {
            backgroundColor: hasData ? "#1976d2" : "#1976d2",
            color: "white",
          },
          "&:hover": {
            backgroundColor: hasData ? "#64b5f6" : "#f0f0f0",
          },
        }}
      />
    );
  };

  const handleSave = () => {
    const dateKey = selectedDate.format("YYYY-MM-DD");

    if (clockIn && clockOut) {
      const newStoredData = {
        ...storedData,
        [dateKey]: {
          clockIn: clockIn.format("HH:mm"),
          clockOut: clockOut.format("HH:mm"),
          breakTime: breakTime || "",
        },
      };

      setStoredData(newStoredData);

      // Save to localStorage
      localStorage.setItem("storedData", JSON.stringify(newStoredData));

      setSavedAnimation(true);
      setTimeout(() => setSavedAnimation(false), 1500);
    }
  };

  const handleClear = () => {
    const dateKey = selectedDate.format("YYYY-MM-DD");
    const updatedData = { ...storedData };
    delete updatedData[dateKey];
    setStoredData(updatedData);

    // Update localStorage
    localStorage.setItem("storedData", JSON.stringify(updatedData));

    setClockIn(null);
    setClockOut(null);
    setBreakTime("");
  };

  const downloadReport = (reportText) => {
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Work_Report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const reportLines = Object.keys(storedData)
      .map((dateKey) => {
        const data = storedData[dateKey];
        if (data.clockIn && data.clockOut) {
          const clockIn = dayjs(`${dateKey}T${data.clockIn}`);
          const clockOut = dayjs(`${dateKey}T${data.clockOut}`);

          // Calculate the total duration between clockIn and clockOut
          const totalMinutesWorked = clockOut.diff(clockIn, "minute");

          const formattedDuration = dayjs.duration(
            totalMinutesWorked,
            "minutes"
          );
          const hours = Math.floor(formattedDuration.asHours());
          const minutes = formattedDuration.minutes();

          const breakString = data.breakTime
            ? `, ${data.breakTime} min break`
            : "";

          // Format each line exactly as you want
          return `${clockIn.format("dddd Do MMMM")}\n${clockIn.format(
            "H:mm"
          )} - ${clockOut.format(
            "H:mm"
          )} (${hours} hrs ${minutes} mins${breakString})\n`;
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");

    if (reportLines.length === 0) {
      alert("No valid entries to generate a report.");
      return;
    }

    downloadReport(reportLines);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Button
        variant="contained"
        onClick={generateReport}
        style={{ marginBottom: "10px", width: "100%" }}
      >
        Generate Report & Download
      </Button>
      <div>
        <StaticDatePicker
          value={selectedDate}
          onChange={handleDateChange}
          slots={{ day: renderDay, actionBar: () => null }}
          slotProps={{ toolbar: { hidden: true } }}
        />

        <Box
          sx={{
            mt: -5,
            mb: 1,
            textAlign: "center",
            transition: "background-color 0.5s",
            backgroundColor: savedAnimation ? "#4caf50" : "transparent",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h5">
            {selectedDate.format("ddd, MMM D")}
          </Typography>
        </Box>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <TimePicker
            label="Clock In"
            value={clockIn}
            onChange={setClockIn}
            renderInput={(params) => <TextField {...params} fullWidth />}
            slotProps={{ textField: { size: "small" } }}
          />
          <TimePicker
            label="Clock Out"
            value={clockOut}
            onChange={setClockOut}
            renderInput={(params) => <TextField {...params} fullWidth />}
            slotProps={{ textField: { size: "small" } }}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Break Time (Minutes)</InputLabel>
            <Select
              value={breakTime}
              onChange={(e) => setBreakTime(e.target.value)}
              label="Break Time (Minutes)"
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40].map((time) => (
                <MenuItem key={time} value={time}>
                  {time} minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSave}
            style={{ marginTop: "20px" }}
          >
            Save Data
          </Button>

          {(clockIn || clockOut || breakTime) && (
            <Button
              variant="outlined"
              onClick={handleClear}
              style={{ color: "red", borderColor: "red" }}
            >
              Clear Data
            </Button>
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default MyCalendar;
