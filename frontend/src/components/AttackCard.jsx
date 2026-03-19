import { useState, useEffect, useRef } from 'react';
import RiskBadge from './RiskBadge';

export default function AttackCard({ attack, index, animate = true }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(!animate);
  const [typedPrompt, setTypedPrompt] = useState('');
  const typingRef = useRef(null);

  // Staggered fade-in
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setVisible(true), index * 100);
      return () => clearTimeout(timer);
    }
  }, [animate, index]);

  // Typing effect for attack prompt when expanded
  useEffect(() => {
    if (expanded && attack.attack_prompt) {
      setTypedPrompt('');
      let i = 0;
      const text = attack.attack_prompt;
      typingRef.current = setInterval(() => {
        if (i < text.length) {
          setTypedPrompt(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingRef.current);
        }
      }, 8);
      return () => clearInterval(typingRef.current);
    }
  }, [expanded, attack.attack_prompt]);

  if (!visible) return null;

  const categoryLabels = {
    prompt_injection: 'PI',
    jailbreak: 'JB',
    data_extraction: 'DE',
    role_confusion: 'RC',
    indirect_injection: 'II',
  };

  return (
    <div
      className={`panel cursor-pointer transition-all duration-300 hover:border-border-hover group ${
        animate ? 'animate-fade-in' : ''
      } ${expanded ? 'glow-red' : ''}`}
      onClick={() => setExpanded(!expanded)}
      style={{ animationDelay: animate ? `${index * 100}ms` : '0ms' }}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded bg-black/20 shadow-inner flex items-center justify-center border border-border shrink-0 mt-0.5">
            <span className="text-xs font-mono font-bold text-text-muted">
              {categoryLabels[attack.category] || 'ATK'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-text-primary">
                {attack.technique}
              </h3>
              <RiskBadge risk={attack.risk} />
            </div>
            <p className="text-xs text-text-muted mt-1 capitalize">
              {attack.category?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <span
          className={`text-text-muted text-xs transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4 animate-fade-in">
          {/* Goal */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-semibold">
              Attack Goal
            </h4>
            <p className="text-sm text-text-primary">{attack.goal}</p>
          </div>

          {/* Attack Prompt */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-semibold">
              Attack Prompt
            </h4>
            <div className="bg-black/30 backdrop-blur-md shadow-inner rounded-xl p-3 border border-border">
              <p className="mono-text text-accent-red/90 typing-text">
                {typedPrompt}
                {typedPrompt.length < (attack.attack_prompt?.length || 0) && (
                  <span className="animate-blink text-accent-red">▋</span>
                )}
              </p>
            </div>
          </div>

          {/* Mitigation */}
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-semibold">
              Mitigation
            </h4>
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3">
              <p className="text-sm text-accent-green">{attack.mitigation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
