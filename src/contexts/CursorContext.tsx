import { createContext, useState, useContext, ReactNode } from "react";

interface CursorContextType {
  cursorType: string;
  cursorChangeHandler: (type: string) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [cursorType, setCursorType] = useState("default");

  const cursorChangeHandler = (type: string) => {
    setCursorType(type);
  };

  return (
    <CursorContext.Provider value={{ cursorType, cursorChangeHandler }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
