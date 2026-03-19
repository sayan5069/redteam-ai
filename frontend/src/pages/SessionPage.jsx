import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AttackLog from '../components/AttackLog';
import RiskChart from '../components/RiskChart';
import CoverageChart from '../components/CoverageChart';
import ReportExport from '../components/ReportExport';
import { redteamAPI } from '../api/client';

export default function SessionPage({ addToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await redteamAPI.getSession(id);
        setSession(response.data);
      } catch (err) {
        addToast('Error', 'Session not found or access denied.', 'error');
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="panel shimmer h-16" />
        <div className="panel shimmer h-32" />
        <div className="panel shimmer h-64" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-text-muted hover:text-text-primary transition-colors mb-2 flex items-center gap-1"
          >
            ← Back to History
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            Session Details
          </h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted flex-wrap">
            <span className="font-mono">{session.id.slice(0, 8)}...</span>
            <span className="text-border">•</span>
            <span>{modelLabels[session.model_used] || session.model_used}</span>
            <span className="text-border">•</span>
            <span className="capitalize">{session.attack_category?.replace(/_/g, ' ')}</span>
            <span className="text-border">•</span>
            <span className={`uppercase font-semibold font-mono ${intensityColors[session.intensity] || ''}`}>
              {session.intensity}
            </span>
            <span className="text-border">•</span>
            <span>{formatDate(session.created_at)}</span>
          </div>
        </div>
        <ReportExport session={session} attacks={session.attacks || []} />
      </div>

      {/* Target prompt */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <div className="traffic-lights">
              <div className="traffic-dot red" />
              <div className="traffic-dot amber" />
              <div className="traffic-dot green" />
            </div>
            <span className="text-xs text-text-muted font-mono">target_system_prompt</span>
          </div>
        </div>
        <div className="panel-body">
          <p className="mono-text text-sm text-text-primary/80">
            {session.target_system_prompt}
          </p>
        </div>
      </div>

      {/* Charts */}
      {session.attacks && session.attacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskChart attacks={session.attacks} />
          <CoverageChart attacks={session.attacks} />
        </div>
      )}

      {/* Attack log */}
      <AttackLog
        attacks={session.attacks || []}
        loading={false}
        animate={false}
      />
    </div>
  );
}
