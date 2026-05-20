import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ChecklistPage } from "@/pages/ChecklistPage";
import { useThemePreference } from "@/hooks/useThemePreference";

export default function App() {
  const { isDark, toggleTheme } = useThemePreference();

  return (
    <Routes>
      <Route path="/" element={<HomePage isDark={isDark} onToggleTheme={toggleTheme} />} />
      <Route
        path="/:slug"
        element={<ChecklistRoute isDark={isDark} onToggleTheme={toggleTheme} />}
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

interface ChecklistRouteProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

function ChecklistRoute({ isDark, onToggleTheme }: ChecklistRouteProps) {
  const { slug = "" } = useParams();
  return <ChecklistPage isDark={isDark} key={slug} onToggleTheme={onToggleTheme} slug={slug} />;
}
