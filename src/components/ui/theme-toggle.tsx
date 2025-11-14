import { Sun, Moon } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
      className="h-9 w-9"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
