import AttackCard from './AttackCard';

export default function AttackLog({ attacks, loading, animate = true }) {
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <div className="traffic-lights">
              <div className="traffic-dot red" />
              <div className="traffic-dot amber" />
              <div className="traffic-dot green" />
            </div>
            <span className="text-xs text-text-muted font-mono">attack_log</span>
          </div>
        </div>
        <div className="panel-body flex flex-col items-center justify-center py-12">
          <div className="flex items-center gap-2 text-accent-red">
            <span className="text-sm font-mono">Analyzing vulnerabilities</span>
            <span className="cursor-blink" />
          </div>
          <p className="text-xs text-text-muted mt-2">
            AI is reasoning about attack vectors...
          </p>
          <div className="flex gap-2 mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-accent-red/40 animate-pulse-slow"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!attacks || attacks.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <div className="traffic-lights">
              <div className="traffic-dot red" />
              <div className="traffic-dot amber" />
              <div className="traffic-dot green" />
            </div>
            <span className="text-xs text-text-muted font-mono">attack_log</span>
          </div>
        </div>
        <div className="panel-body flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center border border-border mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-sm text-text-muted">No target loaded</p>
          <p className="text-xs text-text-muted/60 mt-1">
            Paste a system prompt and run analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="traffic-lights">
            <div className="traffic-dot red" />
            <div className="traffic-dot amber" />
            <div className="traffic-dot green" />
          </div>
          <span className="text-xs text-text-muted font-mono">attack_log</span>
        </div>
        <span className="text-xs text-text-muted">
          {attacks.length} attack{attacks.length !== 1 ? 's' : ''} found
        </span>
      </div>
      <div className="panel-body space-y-3">
        {attacks.map((attack, index) => (
          <AttackCard
            key={index}
            attack={attack}
            index={index}
            animate={animate}
          />
        ))}
      </div>
    </div>
  );
}
