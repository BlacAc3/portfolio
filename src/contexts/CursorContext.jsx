import React, { createContext, useState, useContext } from "react";

const CursorContext = createContext();

export const CursorProvider = ({ children }) => {
  const [cursorType, setCursorType] = useState("default");

  const cursorChangeHandler = (type) => {
    setCursorType(type);
  };

  return (
    <CursorContext.Provider value={{ cursorType, cursorChangeHandler }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => useContext(CursorContext);
