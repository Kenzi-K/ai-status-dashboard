import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, CheckCircle2, CircleHelp, ExternalLink, RefreshCw } from 'lucide-react';
import './style.css';

const SOURCES = [
  {
    id: 'openai',
    name: 'OpenAI',
    services: ['ChatGPT', 'API', 'Sora'],
    statusUrl: 'https://status.openai.com/',
    jsonUrl: 'https://status.openai.com/api/v2/summary.json'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    services: ['Claude', 'API'],
    statusUrl: 'https://status.anthropic.com/',
    jsonUrl: 'https://status.anthropic.com/api/v2/summary.json'
  },
  {
    id: 'google-ai',
    name: 'Google AI / Gemini',
    services: ['Gemini API', 'AI Studio'],
    statusUrl: 'https://aistudio.google.com/status',
    jsonUrl: null
  },
  {
    id: 'github',
    name: 'GitHub',
    services: ['GitHub', 'Actions', 'Pages'],
    statusUrl: 'https://www.githubstatus.com/',
    jsonUrl: 'https://www.githubstatus.com/api/v2/summary.json'
  }
];

const stateLabels = {
  operational: ['正常', 'ok'],
  degraded_performance: ['遅延/性能低下', 'warn'],
  partial_outage: ['一部障害', 'bad'],
  major_outage: ['大規模障害', 'bad'],
  under_maintenance: ['メンテナンス', 'warn'],
  unknown: ['不明', 'unknown']
};

function normalizeIndicator(indicator) {
  if (!indicator) return 'unknown';
  if (indicator === 'none') return 'operational';
  if (indicator === 'minor') return 'degraded_performance';
  if (indicator === 'major') return 'partial_outage';
  if (indicator === 'critical') return 'major_outage';
  return 'unknown';
}

function StatusIcon({ level }) {
  if (level === 'ok') return <CheckCircle2 />;
  if (level === 'warn') return <AlertTriangle />;
  if (level === 'bad') return <AlertTriangle />;
  return <CircleHelp />;
}

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  async function refresh() {
    setLoading(true);
    const results = await Promise.all(SOURCES.map(async (source) => {
      if (!source.jsonUrl) {
        return {
          ...source,
          status: 'unknown',
          detail: '公式JSON未設定。リンク先で手動確認。',
          components: []
        };
      }
      try {
        const res = await fetch(source.jsonUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const status = normalizeIndicator(json?.status?.indicator);
        return {
          ...source,
          status,
          detail: json?.status?.description ?? '状態説明なし',
          components: (json?.components ?? []).slice(0, 8).map(c => ({
            name: c.name,
            status: c.status
          }))
        };
      } catch (error) {
        return {
          ...source,
          status: 'unknown',
          detail: `取得失敗: ${error.message}`,
          components: []
        };
      }
    }));
    setItems(results);
    setLastChecked(new Date());
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  const summary = useMemo(() => {
    const total = items.length;
    const bad = items.filter(i => ['partial_outage', 'major_outage'].includes(i.status)).length;
    const warn = items.filter(i => i.status === 'degraded_performance').length;
    const unknown = items.filter(i => i.status === 'unknown').length;
    return { total, bad, warn, unknown };
  }, [items]);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">AI Watcher</p>
          <h1>AI Status Dashboard</h1>
          <p className="lead">主要AI・開発基盤の公式ステータスをまとめて見るための軽量ダッシュボード。</p>
        </div>
        <button onClick={refresh} disabled={loading}>
          <RefreshCw className={loading ? 'spin' : ''} />
          更新
        </button>
      </section>

      <section className="summary">
        <div><strong>{summary.total}</strong><span>監視対象</span></div>
        <div><strong>{summary.bad}</strong><span>障害</span></div>
        <div><strong>{summary.warn}</strong><span>警告</span></div>
        <div><strong>{summary.unknown}</strong><span>不明</span></div>
      </section>

      <p className="timestamp">最終確認: {lastChecked ? lastChecked.toLocaleString('ja-JP') : '未取得'}</p>

      <section className="grid">
        {items.map((item) => {
          const [label, level] = stateLabels[item.status] ?? stateLabels.unknown;
          return (
            <article key={item.id} className={`card ${level}`}>
              <div className="cardHeader">
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.services.join(' / ')}</p>
                </div>
                <div className="statusBadge">
                  <StatusIcon level={level} />
                  {label}
                </div>
              </div>
              <p className="detail">{item.detail}</p>
              {item.components.length > 0 && (
                <ul className="components">
                  {item.components.map((component) => (
                    <li key={component.name}>
                      <span>{component.name}</span>
                      <code>{component.status}</code>
                    </li>
                  ))}
                </ul>
              )}
              <a href={item.statusUrl} target="_blank" rel="noreferrer">
                公式ステータスを見る <ExternalLink size={14} />
              </a>
            </article>
          );
        })}
      </section>

      <footer>
        <Activity size={16} />
        GitHub Pages向け。CORSで取得できない公式ページは、後続でGitHub Actions側の取得に切り替える。
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
