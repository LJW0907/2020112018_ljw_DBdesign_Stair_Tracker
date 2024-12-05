import { createContext, useContext, useState } from "react";

const PointContext = createContext();

export function PointProvider({ children }) {
  const [totalPoints, setTotalPoints] = useState(0);

  const updatePoints = (newTotal) => {
    setTotalPoints(newTotal);
  };

  return (
    <PointContext.Provider value={{ totalPoints, updatePoints }}>
      {children}
    </PointContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointContext);
}
