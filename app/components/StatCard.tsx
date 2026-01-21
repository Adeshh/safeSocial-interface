interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

export function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeColors = {
    positive: "text-status-success",
    negative: "text-status-error",
    neutral: "text-text-muted",
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-bg-tertiary">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary mb-1">{title}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}
