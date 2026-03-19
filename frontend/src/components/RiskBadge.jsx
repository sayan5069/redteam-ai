export default function RiskBadge({ risk }) {
  const level = (risk || 'MEDIUM').toUpperCase();
  const cls =
    level === 'HIGH'
      ? 'high'
      : level === 'LOW'
      ? 'low'
      : 'medium';

  return (
    <span className={`risk-badge ${cls}`}>
      {level}
    </span>
  );
}
