import { useState, useEffect } from 'react';
import SessionCard from '../components/SessionCard';
import { redteamAPI } from '../api/client';

export default function HistoryPage({ addToast }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await redteamAPI.getHistory();
      setSessions(response.data);
    } catch (err) {
      addToast('Error', 'Failed to load session history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (sessionId) => {
    try {
      await redteamAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      addToast('Deleted', 'Session removed successfully.', 'success');
    } catch (err) {
      addToast('Error', 'Failed to delete session.', 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          📋 Session History
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review past red team analysis sessions
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel shimmer h-32" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel">
          <div className="panel-body flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center border border-border mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm text-text-muted">No sessions yet</p>
            <p className="text-xs text-text-muted/60 mt-1">
              Run your first red team analysis from the dashboard
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-muted font-mono">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
          </p>
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SessionCard session={session} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
