const MODELS = [
  {
    id: 'opus-4.6',
    name: 'Claude Opus 4.6',
    desc: 'Extended thinking • Most thorough',
    badge: 'PRIMARY',
    badgeColor: 'text-accent-red',
  },
  {
    id: 'sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    desc: 'Fast analysis • Good balance',
    badge: 'FAST',
    badgeColor: 'text-accent-amber',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    desc: 'Alternative perspective',
    badge: 'ALT',
    badgeColor: 'text-accent-green',
  },
];

export default function ModelSelector({ value, onChange, disabled }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="traffic-lights">
            <div className="traffic-dot red" />
            <div className="traffic-dot amber" />
            <div className="traffic-dot green" />
          </div>
          <span className="text-xs text-text-muted font-mono">model_config</span>
        </div>
      </div>
      <div className="panel-body space-y-2">
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => !disabled && onChange(model.id)}
            disabled={disabled}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
              value === model.id
                ? 'bg-accent-red/5 border-accent-red/30 shadow-sm'
                : 'border-border hover:border-border-hover hover:bg-bg-hover'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    value === model.id ? 'bg-accent-red' : 'bg-border'
                  }`}
                />
                <span className="text-sm font-medium text-text-primary">
                  {model.name}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold ${model.badgeColor}`}>
                {model.badge}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 ml-4">{model.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
