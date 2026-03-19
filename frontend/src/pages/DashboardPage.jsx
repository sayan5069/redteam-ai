import { useState } from 'react';
import TargetInput from '../components/TargetInput';
import ModelSelector from '../components/ModelSelector';
import AttackLog from '../components/AttackLog';
import RiskChart from '../components/RiskChart';
import CoverageChart from '../components/CoverageChart';
import ReportExport from '../components/ReportExport';
import { redteamAPI } from '../api/client';

const ATTACK_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'prompt_injection', label: 'Prompt Injection' },
  { value: 'jailbreak', label: 'Jailbreak' },
  { value: 'data_extraction', label: 'Data Extraction' },
  { value: 'role_confusion', label: 'Role Confusion' },
  { value: 'indirect_injection', label: 'Indirect Injection' },
];

const INTENSITIES = [
  { value: 'high', label: 'High', color: 'text-accent-red' },
  { value: 'medium', label: 'Medium', color: 'text-accent-amber' },
  { value: 'low', label: 'Low', color: 'text-accent-green' },
];

export default function DashboardPage({ addToast }) {
  const [targetPrompt, setTargetPrompt] = useState('');
  const [attackCategory, setAttackCategory] = useState('all');
  const [intensity, setIntensity] = useState('high');
  const [model, setModel] = useState('opus-4.6');
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleRun = async () => {
    if (!targetPrompt.trim() || targetPrompt.trim().length < 10) {
      addToast('Invalid Input', 'System prompt must be at least 10 characters.', 'error');
      return;
    }

    setLoading(true);
    setAttacks([]);
    setSessionData(null);

    try {
      const response = await redteamAPI.run({
        target_system_prompt: targetPrompt,
        attack_category: attackCategory,
        intensity,
        model,
      });

      setAttacks(response.data.attacks);
      setSessionData(response.data);
      addToast(
        'Analysis Complete',
        `Generated ${response.data.attacks.length} attack vectors`,
        'success'
      );
    } catch (err) {
      const detail = err.response?.data?.detail || 'Analysis failed. Please try again.';
      addToast('Error', detail, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Red Team Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Analyze AI systems for adversarial vulnerabilities
          </p>
        </div>
        {sessionData && (
          <ReportExport
            session={{
              id: sessionData.session_id,
              target_system_prompt: targetPrompt,
              attack_category: attackCategory,
              intensity,
              model_used: model,
              created_at: new Date().toISOString(),
            }}
            attacks={attacks}
          />
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Config */}
        <div className="lg:col-span-1 space-y-4">
          <TargetInput
            value={targetPrompt}
            onChange={setTargetPrompt}
            disabled={loading}
          />

          {/* Attack category dropdown */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex items-center gap-3">
                <div className="traffic-lights">
                  <div className="traffic-dot red" />
                  <div className="traffic-dot amber" />
                  <div className="traffic-dot green" />
                </div>
                <span className="text-xs text-text-muted font-mono">attack_config</span>
              </div>
            </div>
            <div className="panel-body space-y-3">
              <div>
                <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">
                  Attack Category
                </label>
                <select
                  id="attack-category"
                  value={attackCategory}
                  onChange={(e) => setAttackCategory(e.target.value)}
                  className="select-field"
                  disabled={loading}
                >
                  {ATTACK_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">
                  Intensity
                </label>
                <div className="flex gap-2">
                  {INTENSITIES.map((int) => (
                    <button
                      key={int.value}
                      onClick={() => !loading && setIntensity(int.value)}
                      disabled={loading}
                      className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg border transition-all uppercase ${
                        intensity === int.value
                          ? `${int.color} border-current bg-current/5`
                          : 'text-text-muted border-border hover:border-border-hover'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ModelSelector
            value={model}
            onChange={setModel}
            disabled={loading}
          />

          {/* Run button */}
          <button
            id="run-analysis"
            onClick={handleRun}
            disabled={loading || !targetPrompt.trim()}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right column — Results */}
        <div className="lg:col-span-2 space-y-4">
          <AttackLog attacks={attacks} loading={loading} animate={true} />

          {attacks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RiskChart attacks={attacks} />
              <CoverageChart attacks={attacks} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
