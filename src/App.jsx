import React from "react";
import "./App.css";
import MyCalendar from "./MyCalendar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a theme with light mode
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline /> {/* Ensures consistent light theme styling */}
      <MyCalendar />
    </ThemeProvider>
  );
}

export default App;
