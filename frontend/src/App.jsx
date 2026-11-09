import React, { useEffect, useState } from "react";

const API = "http://localhost:8000";

function Icon({ type }) {
  const common = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round"
  };
  const paths = {
    bus: <><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14"/><path d="M7 17v3"/><path d="M17 17v3"/><path d="M8 7h.01M16 7h.01"/><path d="M7 14h2M15 14h2"/></>,
    route: <><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8 18c5 0 2-8 8-8"/><path d="M10 6h3"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
    crowd: <><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M4 19c0-3 2-5 5-5s5 2 5 5"/><path d="M14 15c3 0 5 1.5 5 4"/></>,
    trend: <><path d="M4 16l5-5 3 3 7-8"/><path d="M14 6h5v5"/></>,
    spark: <><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6"/></>,
    shield: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    alert: <><path d="M12 4l8 15H4L12 4Z"/><path d="M12 9v4M12 16h.01"/></>,
  };
  return <svg {...common}>{paths[type]}</svg>;
}

function App() {
  const [tab, setTab] = useState("Passenger");
  const [routes, setRoutes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [origin, setOrigin] = useState("JP Nagar");
  const [destination, setDestination] = useState("Silk Institute");
  const [hour, setHour] = useState(8);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(API + "/api/routes").then(r => r.json()),
      fetch(API + "/api/locations").then(r => r.json()),
      fetch(API + "/api/analytics").then(r => r.json())
    ]).then(([routesData, locationsData, analyticsData]) => {
      setRoutes(routesData);
      setLocations(locationsData);
      setAnalytics(analyticsData);
    }).catch(() => {});
  }, []);

  async function recommend() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(API + "/api/recommend", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          origin,
          destination,
          hour: Number(hour),
          traffic_level: "Medium",
          weather: "Clear"
        })
      });
      setResult(await r.json());
    } catch {
      setResult({found: false, message: "Backend is not reachable. Start FastAPI on port 8000."});
    } finally {
      setLoading(false);
    }
  }

  const crowdClass = (value) => value >= 90 ? "danger" : value >= 70 ? "warning" : "good";

  return (
    <div className="shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-icon"><Icon type="bus" /></div>
          <div>
            <div className="brand">SmartTransit <span>AI</span></div>
            <div className="brand-sub">Intelligent mobility platform</div>
          </div>
        </div>

        <nav className="nav-pills">
          {["Passenger", "Authority"].map(x => (
            <button key={x} className={tab === x ? "nav-pill active" : "nav-pill"} onClick={() => setTab(x)}>
              <Icon type={x === "Passenger" ? "user" : "shield"} />
              {x}
            </button>
          ))}
        </nav>
      </header>

      {tab === "Passenger" ? (
        <main>
          <section className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow green">AI-POWERED PUBLIC TRANSPORT</div>
              <h1>Smarter routes.<br/><span>Better journeys.</span></h1>
              <p className="hero-text">
                SmartTransit AI compares transport conditions to predict ETA, crowd levels and delays — then recommends the best route for you.
              </p>

              <div className="feature-row">
                <div className="feature-mini">
                  <div className="mini-icon green-icon"><Icon type="clock" /></div>
                  <span>AI Predicted<br/>ETA</span>
                </div>
                <div className="feature-mini">
                  <div className="mini-icon blue-icon"><Icon type="crowd" /></div>
                  <span>Crowd<br/>Prediction</span>
                </div>
                <div className="feature-mini">
                  <div className="mini-icon amber-icon"><Icon type="alert" /></div>
                  <span>Delay<br/>Estimation</span>
                </div>
              </div>

              <div className="route-illustration">
                <div className="city-line city-a" />
                <div className="city-line city-b" />
                <div className="route-dot start" />
                <div className="route-dot end" />
                <div className="route-path" />
                <div className="bus-illustration"><Icon type="bus" /></div>
                <div className="city-card left-card">JP Nagar</div>
                <div className="city-card right-card">Silk Institute</div>
              </div>
            </div>

            <div className="planner-card">
              <div className="planner-heading">
                <div className="planner-icon"><Icon type="route" /></div>
                <div>
                  <h2>Plan Your Journey</h2>
                  <p>Find the best route based on predictions</p>
                </div>
              </div>

              <label>FROM</label>
              <div className="field">
                <span className="status-dot green-dot" />
                <select value={origin} onChange={e => setOrigin(e.target.value)}>
                  {locations.map(x => <option key={x}>{x}</option>)}
                </select>
              </div>

              <label>TO</label>
              <div className="field">
                <span className="status-dot red-dot" />
                <select value={destination} onChange={e => setDestination(e.target.value)}>
                  {locations.map(x => <option key={x}>{x}</option>)}
                </select>
              </div>

              <div className="time-head">
                <label>TRAVEL HOUR</label>
                <div className="time-badge">{String(hour).padStart(2, "0")}:00 <Icon type="clock" /></div>
              </div>

              <input className="range-input" type="range" min="6" max="22" value={hour} onChange={e => setHour(e.target.value)} />
              <div className="range-labels"><span>6 AM</span><strong>{hour >= 12 ? `${hour}:00` : `${hour}:00`}</strong><span>10 PM</span></div>

              <button className="primary-cta" onClick={recommend} disabled={loading}>
                <Icon type="spark" />
                {loading ? "Analyzing..." : "Find Best Route"}
                <span>→</span>
              </button>

              <div className="planner-note">Powered by your trained ML prediction models</div>
            </div>
          </section>

          {result?.found && (
            <section className="result-panel">
              <div className="result-main">
                <div className="eyebrow">AI RECOMMENDATION</div>
                <div className="result-title-row">
                  <h2>{result.recommendation}</h2>
                  <span className={`status-chip ${result.crowd_pct >= 90 ? "danger" : "success"}`}>
                    {result.crowd_pct >= 90 ? "High Crowd" : "Good Choice"}
                  </span>
                </div>
                <div className="result-route">{result.route_id} <span>·</span> {result.origin} <span>→</span> {result.destination}</div>
                <p>{result.reason}</p>
              </div>
              <div className="result-stat"><div className="stat-value">{result.eta_min}</div><div>MINUTES ETA</div></div>
              <div className="result-stat"><div className={`stat-value ${crowdClass(result.crowd_pct)}`}>{result.crowd_pct}%</div><div>PREDICTED CROWD</div></div>
              <div className="result-stat"><div className="stat-value amber">{result.delay_min}</div><div>EXPECTED DELAY</div></div>
            </section>
          )}

          {result && !result.found && (
            <section className="result-panel error-panel">
              <div className="eyebrow">AI RESULT</div>
              <h2>No direct demo route</h2>
              <p>{result.message}</p>
            </section>
          )}

          <section className="route-section">
            <div className="section-head">
              <div>
                <div className="eyebrow">NETWORK OVERVIEW</div>
                <h2>Live routes</h2>
              </div>
              <div className="live-pill"><span /> Demo transport data</div>
            </div>
            <div className="route-grid">
              {routes.map(r => (
                <div className="route-card" key={r.route_id}>
                  <div className="route-card-top">
                    <span className="route-id">{r.route_id}</span>
                    <span className={`crowd-chip ${crowdClass(r.crowd_pct)}`}>{Math.round(r.crowd_pct)}% crowd</span>
                  </div>
                  <h3>{r.origin} <span>→</span> {r.destination}</h3>
                  <div className="metric-grid">
                    <div><b>{r.eta_min}</b><span>ETA</span></div>
                    <div><b>{r.delay_min}</b><span>DELAY</span></div>
                    <div><b>{r.crowd_pct}%</b><span>CROWD</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main>
          <section className="authority-hero">
            <div>
              <div className="eyebrow green">TRANSPORT AUTHORITY</div>
              <h1>Operations<br/><span>control center.</span></h1>
              <p>See network performance and respond to AI-generated insights.</p>
            </div>
            <div className="authority-badge"><Icon type="trend" /><div><strong>AI Network Insight</strong><span>Real-time demo analytics</span></div></div>
          </section>

          {analytics && (
            <>
              <div className="kpi-grid">
                {[["245","Total buses","bus"],["218","Active buses","trend"],["17","Delayed buses","clock"],["12","High-crowd routes","crowd"]].map(([value,label,icon]) => (
                  <div className="kpi-card" key={label}>
                    <div className="kpi-icon"><Icon type={icon} /></div>
                    <div><strong>{value}</strong><span>{label}</span></div>
                  </div>
                ))}
              </div>
              <section className="authority-grid">
                <div className="panel-card">
                  <div className="panel-title"><h2>AI alerts</h2><span>{analytics.ai_alerts.length} active</span></div>
                  {analytics.ai_alerts.map((a,i) => <div className="alert-row" key={a}><div className={`alert-icon ${i===0?"red":i===1?"amber":"green"}`}><Icon type="alert"/></div><p>{a}</p></div>)}
                </div>
                <div className="panel-card">
                  <div className="panel-title"><h2>Route demand</h2><span>Peak forecast</span></div>
                  {analytics.top_routes.map(r => <div className="bar-row" key={r.route}><div className="bar-label"><span>{r.route}</span><b>{r.demand}%</b></div><div className="bar-track"><i style={{width: `${r.demand}%`}} /></div></div>)}
                </div>
              </section>
            </>
          )}
        </main>
      )}

      <footer>SmartTransit AI · Hackathon prototype · Synthetic demo dataset</footer>
    </div>
  );
}

export default App;