interface ToggleGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ToggleGroup({ label, value, onChange }: ToggleGroupProps) {
  return (
    <div className="toggle-row">
      <div className="toggle-label">{label}</div>
      <div className="toggle-group">
        {["Conforme", "Non Conforme", "SO"].map((option) => {
          const activeClass =
            option === value
              ? option === "Conforme"
                ? "active-conform"
                : option === "Non Conforme"
                  ? "active-nonconf"
                  : "active-so"
              : "";

          return (
            <button key={option} className={`tog-btn ${activeClass}`} onClick={() => onChange(option)}>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
