import { createContext, useCallback, useContext, useState } from "react";

const DemoModeContext = createContext({
  isDemo: false,
  toggleDemo: () => {},
  exitDemo: () => {},
});

export function DemoModeProvider({ children, isAdmin }) {
  const [isDemo, setIsDemo] = useState(false);

  const toggleDemo = useCallback(() => {
    if (!isAdmin) return;
    setIsDemo((v) => !v);
  }, [isAdmin]);

  const exitDemo = useCallback(() => {
    setIsDemo(false);
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemo, toggleDemo, exitDemo }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
