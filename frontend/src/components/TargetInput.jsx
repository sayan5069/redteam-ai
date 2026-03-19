import { useState } from 'react';
import { redteamAPI } from '../api/client';

export default function TargetInput({ value, onChange, disabled }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const topic = value.length > 0 && value.length < 200 ? value : '';
      const res = await redteamAPI.generateTarget(topic);
      if (res.data?.prompt) {
        onChange(res.data.prompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="traffic-lights">
            <div className="traffic-dot red" />
            <div className="traffic-dot amber" />
            <div className="traffic-dot green" />
          </div>
          <span className="text-xs text-text-muted font-mono">target_system_prompt.txt</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={handleAutoGenerate}
            disabled={disabled || isGenerating}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-accent-amber hover:text-accent-amber/80 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            )}
            <span>Auto-Generate</span>
          </button>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            {value.length} / 10,000 chars
          </span>
        </div>
      </div>
      <div className="panel-body">
        <textarea
          id="target-system-prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Paste the target AI system prompt here...\n\nOr, type a brief idea (e.g., "Bank Customer Service" or "Internal Code Assistant") and click Auto-Generate to create a testing prompt based on your topic!`}
          className="w-full bg-transparent text-text-primary font-mono text-sm leading-relaxed resize-none outline-none min-h-[200px] placeholder:text-text-muted/50"
          maxLength={10000}
        />
      </div>
    </div>
  );
}
