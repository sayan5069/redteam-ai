import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RISK_COLORS = {
  HIGH: '#e24b4a',
  MEDIUM: '#ef9f27',
  LOW: '#639922',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-surface border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-text-primary">{data.name} Risk</p>
        <p className="text-xs text-text-muted mt-1">{data.count} attack{data.count !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function RiskChart({ attacks }) {
  if (!attacks || attacks.length === 0) return null;

  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  attacks.forEach((a) => {
    const risk = (a.risk || 'MEDIUM').toUpperCase();
    if (riskCounts[risk] !== undefined) riskCounts[risk]++;
  });

  const data = [
    { name: 'HIGH', count: riskCounts.HIGH, color: RISK_COLORS.HIGH },
    { name: 'MEDIUM', count: riskCounts.MEDIUM, color: RISK_COLORS.MEDIUM },
    { name: 'LOW', count: riskCounts.LOW, color: RISK_COLORS.LOW },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="traffic-lights">
            <div className="traffic-dot red" />
            <div className="traffic-dot amber" />
            <div className="traffic-dot green" />
          </div>
          <span className="text-xs text-text-muted font-mono">risk_distribution</span>
        </div>
      </div>
      <div className="panel-body">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b6b7e', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#1e1e2e' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b6b7e', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
