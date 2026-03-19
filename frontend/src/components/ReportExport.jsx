export default function ReportExport({ session, attacks }) {
  const handleExport = () => {
    const report = {
      session: {
        id: session.id,
        target_system_prompt: session.target_system_prompt,
        attack_category: session.attack_category,
        intensity: session.intensity,
        model_used: session.model_used,
        created_at: session.created_at,
      },
      attacks: attacks.map((a) => ({
        technique: a.technique,
        category: a.category,
        risk: a.risk,
        attack_prompt: a.attack_prompt,
        goal: a.goal,
        mitigation: a.mitigation,
      })),
      metadata: {
        exported_at: new Date().toISOString(),
        tool: 'RedTeam AI',
        version: '1.0.0',
        frameworks: ['MITRE ATLAS', 'OWASP Top 10 for LLMs'],
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redteam-report-${session.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="btn-secondary flex items-center gap-2 text-xs"
      title="Download session report as JSON"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>Export JSON</span>
    </button>
  );
}
