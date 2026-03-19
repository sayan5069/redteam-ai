import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  prompt_injection: '#e24b4a',
  jailbreak: '#ef9f27',
  data_extraction: '#639922',
  role_confusion: '#7c6cef',
  indirect_injection: '#4ac1e2',
};

const CATEGORY_LABELS = {
  prompt_injection: 'Prompt Injection',
  jailbreak: 'Jailbreak',
  data_extraction: 'Data Extraction',
  role_confusion: 'Role Confusion',
  indirect_injection: 'Indirect Injection',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-surface border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-text-primary">{data.label}</p>
        <p className="text-xs text-text-muted mt-1">{data.count} attack{data.count !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function CoverageChart({ attacks }) {
  if (!attacks || attacks.length === 0) return null;

  const categoryCounts = {};
  attacks.forEach((a) => {
    const cat = a.category || 'prompt_injection';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const data = Object.entries(categoryCounts).map(([key, count]) => ({
    name: key,
    label: CATEGORY_LABELS[key] || key,
    count,
    color: CATEGORY_COLORS[key] || '#6b6b7e',
  }));

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="traffic-lights">
            <div className="traffic-dot red" />
            <div className="traffic-dot amber" />
            <div className="traffic-dot green" />
          </div>
          <span className="text-xs text-text-muted font-mono">category_coverage</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-text-muted flex-1 truncate">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-text-primary">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
