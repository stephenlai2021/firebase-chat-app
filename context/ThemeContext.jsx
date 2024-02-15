"use client";

import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  //  const [theme, setTheme] = useState(
  //   () => global?.localStorage?.getItem("theme") || "light"
  // );

  // useEffect(() => {
  //   localStorage.setItem("theme", theme);
  // }, [theme]);

  // const changeTheme = (event) => {
  //   const nextTheme = event.target.value || null;
  //   if (nextTheme) setTheme(nextTheme);
  //   else setTheme((prev) => (prev === "light" ? "dark" : "light"));
  // };

  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // const storedTheme = JSON.parse(localStorage.getItem("theme")) || "light"
    const storedTheme = localStorage.getItem("theme") || "light"
    setTheme(storedTheme)
  }, []);

  const changeTheme = theme => {
    setTheme(theme)
    localStorage.setItem("theme", theme)
  }  
  
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
