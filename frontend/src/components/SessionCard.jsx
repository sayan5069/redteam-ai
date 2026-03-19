import { useNavigate } from 'react-router-dom';

export default function SessionCard({ session, onDelete }) {
  const navigate = useNavigate();

  const categoryLabels = {
    prompt_injection: 'PI',
    jailbreak: 'JB',
    data_extraction: 'DE',
    role_confusion: 'RC',
    indirect_injection: 'II',
    all: 'ALL',
  };

  const modelLabels = {
    'opus-4.6': 'Claude Opus 4.6',
    'sonnet-4.6': 'Claude Sonnet 4.6',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
  };

  const intensityColors = {
    high: 'text-accent-red',
    medium: 'text-accent-amber',
    low: 'text-accent-green',
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncatePrompt = (text, maxLen = 120) => {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  };

  return (
    <div
      className="panel cursor-pointer transition-all duration-200 hover:border-border-hover group"
      onClick={() => navigate(`/session/${session.id}`)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black/20 shadow-inner flex items-center justify-center border border-border">
              <span className="text-xs font-mono font-bold text-accent-red">
                {categoryLabels[session.attack_category] || 'ATK'}
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-text-muted capitalize">
                {session.attack_category?.replace(/_/g, ' ')}
              </span>
              <span className="mx-2 text-border">•</span>
              <span className={`text-xs font-mono uppercase font-semibold ${intensityColors[session.intensity] || 'text-text-muted'}`}>
                {session.intensity}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all text-sm px-2 py-1 rounded border border-transparent hover:border-accent-red/20"
            title="Delete session"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 bg-black/30 backdrop-blur-md shadow-inner rounded-xl p-3 border border-border">
          <p className="mono-text text-xs text-text-muted">
            {truncatePrompt(session.target_system_prompt)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span>{modelLabels[session.model_used] || session.model_used}</span>
            <span className="text-border">•</span>
            <span>{session.attack_count || 0} attacks</span>
          </div>
          <span>{formatDate(session.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
