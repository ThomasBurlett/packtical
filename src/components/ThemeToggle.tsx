import { Switch } from "@heroui/react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ThemeToggle({ isDark, onToggleTheme }: ThemeToggleProps) {
  return (
    <div className="theme-toggle-shell">
      <span className="theme-toggle-title">Theme</span>
      <Switch
        aria-label={`Activate ${isDark ? "light" : "dark"} theme`}
        className="theme-switch"
        isSelected={isDark}
        onChange={onToggleTheme}
        size="sm"
      >
        <Switch.Content className="theme-switch-copy">
          <span className="theme-switch-mode">{isDark ? "Dark" : "Light"}</span>
          <span aria-hidden="true" className="theme-switch-icon">
            {isDark ? "☾" : "☀"}
          </span>
        </Switch.Content>
        <Switch.Control className="theme-switch-control">
          <Switch.Thumb className="theme-switch-thumb" />
        </Switch.Control>
      </Switch>
    </div>
  );
}
