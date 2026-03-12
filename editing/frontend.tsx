import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";

// === API Helper ===
async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// === Auth Context ===
interface User {
  id: string; email: string; name: string; plan: string;
  manuscripts_this_month: number; created_at: string;
}

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: async () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/auth/me").then(d => setUser(d.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const d = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(d.user);
  };
  const register = async (email: string, password: string, name: string) => {
    const d = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) });
    setUser(d.user);
  };
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

// === Toast ===
function useToast() {
  const [msg, setMsg] = useState("");
  const show = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  const Toast = () => msg ? <div className="toast">{msg}</div> : null;
  return { show, Toast };
}

// === Auth Pages ===
function LoginPage() {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name);
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-title">Manuscript Editor</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          {err && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>{err}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
          {isLogin ? "No account? " : "Already have an account? "}
          <a href="#" onClick={e => { e.preventDefault(); setIsLogin(!isLogin); }} style={{ color: "var(--primary)" }}>
            {isLogin ? "Sign up" : "Sign in"}
          </a>
        </p>
      </div>
    </div>
  );
}

// === Upload Component ===
function UploadPage({ onUploaded }: { onUploaded: (ms: any) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/manuscripts/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUploaded(data.manuscript);
    } catch (e: any) { setErr(e.message); }
    setUploading(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Upload Manuscript</h2>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]); }}
      >
        {uploading ? (
          <div><div className="spinner" style={{ margin: "0 auto 1rem" }} /><p>Uploading and parsing...</p></div>
        ) : (
          <>
            <div className="dropzone-icon">+</div>
            <p className="dropzone-text">Drop your manuscript here or click to browse</p>
            <p className="dropzone-formats">Supported: .docx, .txt, .md, .html, .epub, .zip</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" hidden accept=".docx,.txt,.md,.html,.htm,.epub,.zip" onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]); }} />
      {err && <p style={{ color: "var(--danger)", marginTop: "1rem" }}>{err}</p>}
    </div>
  );
}

// === Consultation Wizard ===
const WIZARD_STEPS = ["Basics", "Tone & Style", "Genre Details", "Priorities", "Review"];

function ConsultationWizard({ manuscriptId, onComplete }: { manuscriptId: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    genre: "", subgenre: "", target_audience: "", tone_profile: "", style_guide: "chicago",
    sensitivity_flags: [] as string[], is_fiction: false,
    fiction_characters: [] as string[], fiction_timeline: "", fiction_worldbuilding: "",
    nonfiction_claim_priority: "medium", nonfiction_citation_style: "",
    priority_modules: [] as string[], custom_instructions: "",
  });
  const [charInput, setCharInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: any) => setData(d => ({ ...d, [key]: val }));

  const submit = async () => {
    setSaving(true);
    try {
      await api(`/api/manuscripts/${manuscriptId}/consultation`, { method: "POST", body: JSON.stringify(data) });
      onComplete();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  const sensitivityOptions = ["Cultural representation", "Religious content", "Political themes", "Racial identity", "Gender & sexuality", "Mental health", "Violence & trauma", "Disability representation"];
  const genres = ["Literary Fiction", "Mystery/Thriller", "Science Fiction", "Fantasy", "Romance", "Horror", "Historical Fiction", "Memoir", "Self-Help", "Business", "History", "Science", "Biography", "Academic", "Children's", "Young Adult", "Poetry", "Other"];
  const tones = ["Formal & Academic", "Professional but Warm", "Conversational", "Literary & Lyrical", "Direct & Punchy", "Humorous", "Inspirational", "Journalistic", "Clinical/Technical"];

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Consultation Wizard</h2>
      <div className="wizard-steps">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className={`wizard-step ${i === step ? "active" : i < step ? "done" : ""}`}>{s}</div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select className="form-select" value={data.genre} onChange={e => { set("genre", e.target.value); set("is_fiction", ["Literary Fiction","Mystery/Thriller","Science Fiction","Fantasy","Romance","Horror","Historical Fiction","Young Adult","Poetry"].includes(e.target.value)); }}>
                <option value="">Select genre...</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subgenre</label>
              <input className="form-input" value={data.subgenre} onChange={e => set("subgenre", e.target.value)} placeholder="e.g., Cozy mystery, Hard sci-fi, Narrative nonfiction" />
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input className="form-input" value={data.target_audience} onChange={e => set("target_audience", e.target.value)} placeholder="e.g., General adult, Young adult, Academic professionals" />
            </div>
            <div className="form-group">
              <label className="form-label">Is this fiction?</label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label className="form-checkbox"><input type="radio" checked={data.is_fiction} onChange={() => set("is_fiction", true)} /> Fiction</label>
                <label className="form-checkbox"><input type="radio" checked={!data.is_fiction} onChange={() => set("is_fiction", false)} /> Nonfiction</label>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Tone Profile</label>
              <select className="form-select" value={data.tone_profile} onChange={e => set("tone_profile", e.target.value)}>
                <option value="">Select tone...</option>
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <p className="form-hint">How should your manuscript read? The editor will flag deviations from this tone.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Style Guide</label>
              <select className="form-select" value={data.style_guide} onChange={e => set("style_guide", e.target.value)}>
                <option value="chicago">Chicago Manual of Style</option>
                <option value="ap">AP Stylebook</option>
                <option value="mla">MLA Handbook</option>
                <option value="apa">APA Style</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sensitivity Areas</label>
              <p className="form-hint">Select topics the sensitivity reviewer should pay extra attention to.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                {sensitivityOptions.map(s => (
                  <label key={s} className="form-checkbox">
                    <input type="checkbox" checked={data.sensitivity_flags.includes(s)} onChange={e => {
                      if (e.target.checked) set("sensitivity_flags", [...data.sensitivity_flags, s]);
                      else set("sensitivity_flags", data.sensitivity_flags.filter(f => f !== s));
                    }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {data.is_fiction ? (
              <>
                <div className="form-group">
                  <label className="form-label">Characters</label>
                  <p className="form-hint">Add main characters so the continuity checker can track them.</p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <input className="form-input" value={charInput} onChange={e => setCharInput(e.target.value)} placeholder="Character name" onKeyDown={e => { if (e.key === "Enter" && charInput.trim()) { set("fiction_characters", [...data.fiction_characters, charInput.trim()]); setCharInput(""); } }} />
                    <button className="btn btn-primary btn-sm" onClick={() => { if (charInput.trim()) { set("fiction_characters", [...data.fiction_characters, charInput.trim()]); setCharInput(""); } }}>Add</button>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {data.fiction_characters.map((c, i) => (
                      <span key={i} className="badge badge-primary" style={{ cursor: "pointer" }} onClick={() => set("fiction_characters", data.fiction_characters.filter((_, j) => j !== i))}>{c} x</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Timeline Notes</label>
                  <textarea className="form-textarea" value={data.fiction_timeline} onChange={e => set("fiction_timeline", e.target.value)} placeholder="Key dates, time spans, chronological notes..." />
                </div>
                <div className="form-group">
                  <label className="form-label">World-Building Notes</label>
                  <textarea className="form-textarea" value={data.fiction_worldbuilding} onChange={e => set("fiction_worldbuilding", e.target.value)} placeholder="Setting details, rules of the world, geography..." />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Claim Verification Priority</label>
                  <select className="form-select" value={data.nonfiction_claim_priority} onChange={e => set("nonfiction_claim_priority", e.target.value)}>
                    <option value="low">Low — Focus on major claims only</option>
                    <option value="medium">Medium — Check significant assertions</option>
                    <option value="high">High — Verify all factual claims</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Citation Style</label>
                  <input className="form-input" value={data.nonfiction_citation_style} onChange={e => set("nonfiction_citation_style", e.target.value)} placeholder="e.g., Footnotes, Endnotes, In-text (Author, Year)" />
                </div>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-group">
              <label className="form-label">Priority Modules</label>
              <p className="form-hint">Which editing areas matter most? These will be highlighted in results.</p>
              <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                {["grammar", "style_guide", "tone_voice", "fact_check", "readability", "dialogue", "continuity", "sensitivity", "structure", "final_polish"].map(id => {
                  const names: Record<string,string> = { grammar: "Grammar & Spelling", style_guide: "Style Guide", tone_voice: "Tone & Voice", fact_check: "Fact-Checking", readability: "Readability & Pacing", dialogue: "Dialogue Quality", continuity: "Continuity", sensitivity: "Sensitivity Review", structure: "Structure Analysis", final_polish: "Final Polish" };
                  return (
                    <label key={id} className="form-checkbox">
                      <input type="checkbox" checked={data.priority_modules.includes(id)} onChange={e => {
                        if (e.target.checked) set("priority_modules", [...data.priority_modules, id]);
                        else set("priority_modules", data.priority_modules.filter(m => m !== id));
                      }} />
                      {names[id]}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Custom Instructions</label>
              <textarea className="form-textarea" value={data.custom_instructions} onChange={e => set("custom_instructions", e.target.value)} placeholder="Any specific instructions for the editor? e.g., 'I intentionally use sentence fragments for effect in chapter 3'" />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 style={{ marginBottom: "1rem" }}>Review Your Settings</h3>
            <table className="table">
              <tbody>
                <tr><td><strong>Genre</strong></td><td>{data.genre} {data.subgenre && `/ ${data.subgenre}`}</td></tr>
                <tr><td><strong>Audience</strong></td><td>{data.target_audience || "—"}</td></tr>
                <tr><td><strong>Tone</strong></td><td>{data.tone_profile || "—"}</td></tr>
                <tr><td><strong>Style Guide</strong></td><td>{data.style_guide.toUpperCase()}</td></tr>
                <tr><td><strong>Type</strong></td><td>{data.is_fiction ? "Fiction" : "Nonfiction"}</td></tr>
                {data.is_fiction && data.fiction_characters.length > 0 && <tr><td><strong>Characters</strong></td><td>{data.fiction_characters.join(", ")}</td></tr>}
                {data.sensitivity_flags.length > 0 && <tr><td><strong>Sensitivity</strong></td><td>{data.sensitivity_flags.join(", ")}</td></tr>}
                {data.priority_modules.length > 0 && <tr><td><strong>Priorities</strong></td><td>{data.priority_modules.join(", ")}</td></tr>}
              </tbody>
            </table>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button className="btn" onClick={() => setStep(s => s - 1)} disabled={step === 0}>Back</button>
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next</button>
          ) : (
            <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Start Editing"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// === Editing Dashboard ===
function EditingDashboard({ manuscriptId }: { manuscriptId: string }) {
  const [manuscript, setManuscript] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningModule, setRunningModule] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<Record<string, string>>({});
  const { show, Toast } = useToast();

  const refresh = useCallback(async () => {
    try {
      const [msData, modsData, runsData] = await Promise.all([
        api(`/api/manuscripts/${manuscriptId}`),
        api("/api/modules"),
        api(`/api/manuscripts/${manuscriptId}/runs`),
      ]);
      setManuscript(msData.manuscript);
      setModules(modsData.modules);
      setRuns(runsData.runs);
    } catch (e: any) { console.error(e); }
    setLoading(false);
  }, [manuscriptId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll for running modules
  useEffect(() => {
    const running = runs.find(r => r.status === "running");
    if (!running) return;
    const interval = setInterval(async () => {
      const { run } = await api(`/api/runs/${running.id}`);
      if (run.status !== "running") { refresh(); clearInterval(interval); }
      else setRuns(prev => prev.map(r => r.id === run.id ? run : r));
    }, 3000);
    return () => clearInterval(interval);
  }, [runs, refresh]);

  const loadSuggestions = async (runId: string) => {
    setSelectedRun(runId);
    const data = await api(`/api/runs/${runId}/suggestions`);
    setSuggestions(data.suggestions);
  };

  const runModule = async (moduleId: string) => {
    setRunningModule(moduleId);
    try {
      await api(`/api/manuscripts/${manuscriptId}/run`, { method: "POST", body: JSON.stringify({ module_id: moduleId }) });
      show("Module started");
      await refresh();
    } catch (e: any) { show(e.message); }
    setRunningModule(null);
  };

  const handleSuggestion = async (id: string, action: "accept" | "reject" | "edit") => {
    try {
      if (action === "edit") {
        const text = editingText[id];
        if (!text) return;
        await api(`/api/suggestions/${id}/edit`, { method: "POST", body: JSON.stringify({ text }) });
      } else {
        await api(`/api/suggestions/${id}/${action}`, { method: "POST" });
      }
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: action === "edit" ? "edited" : `${action}ed` } : s));
      show(`Suggestion ${action === "edit" ? "edited" : `${action}ed`}`);
    } catch (e: any) { show(e.message); }
  };

  const batchAction = async (action: "accept" | "reject") => {
    const pendingIds = suggestions.filter(s => s.status === "pending").map(s => s.id);
    if (pendingIds.length === 0) return;
    try {
      await api(`/api/suggestions/batch/${action}`, { method: "POST", body: JSON.stringify({ suggestion_ids: pendingIds }) });
      setSuggestions(prev => prev.map(s => s.status === "pending" ? { ...s, status: `${action}ed` } : s));
      show(`${pendingIds.length} suggestions ${action}ed`);
    } catch (e: any) { show(e.message); }
  };

  const loadScore = async () => {
    const data = await api(`/api/manuscripts/${manuscriptId}/score`);
    setScore(data);
  };

  if (loading) return <div className="empty-state"><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  if (!manuscript) return <div className="empty-state">Manuscript not found</div>;

  const getRunForModule = (moduleId: string) => runs.find(r => r.module_id === moduleId);

  const confidenceClass = (score: number) => score >= 0.8 ? "confidence-high" : score >= 0.6 ? "confidence-medium" : "confidence-low";

  const pendingCount = suggestions.filter(s => s.status === "pending").length;
  const acceptedCount = suggestions.filter(s => s.status === "accepted" || s.status === "edited").length;
  const rejectedCount = suggestions.filter(s => s.status === "rejected").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2>{manuscript.title}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {manuscript.word_count?.toLocaleString()} words &middot; {manuscript.chapters?.length || 0} chapters
          </p>
        </div>
        <div className="btn-group">
          <button className="btn btn-sm" onClick={loadScore}>Readiness Score</button>
        </div>
      </div>

      {score && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="readiness-score">
            <div className="score-number" style={{ color: score.overall >= 80 ? "var(--success)" : score.overall >= 50 ? "var(--warning)" : "var(--danger)" }}>
              {score.overall}
            </div>
            <div className="score-label">Publication Readiness Score</div>
          </div>
          {score.byModule?.map((m: any) => (
            <div key={m.module} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.85rem" }}>
              <span>{m.module}</span>
              <span className={`badge ${m.score >= 80 ? "badge-success" : m.score >= 50 ? "badge-warning" : "badge-danger"}`}>{m.score}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1rem" }}>
        {/* Module list */}
        <div>
          <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>EDITING MODULES</h3>
          {modules.map(m => {
            const run = getRunForModule(m.id);
            const status = run?.status || "pending";
            return (
              <div key={m.id} className={`module-item ${status} ${selectedRun && run?.id === selectedRun ? "active" : ""}`}
                onClick={() => run?.id && run.status === "completed" ? loadSuggestions(run.id) : undefined}>
                <div className={`module-status status-${status}`}>
                  {status === "completed" ? "\u2713" : status === "running" ? "\u25CB" : status === "failed" ? "!" : m.order}
                </div>
                <div className="module-info">
                  <div className="module-name">{m.name}</div>
                  {run?.status === "running" && (
                    <div style={{ marginTop: "0.25rem" }}>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${run.progress_pct}%` }} /></div>
                    </div>
                  )}
                  {run?.status === "completed" && (
                    <div className="module-desc">{run.total_suggestions} suggestions</div>
                  )}
                  {!run && (
                    <button className="btn btn-sm btn-primary" style={{ marginTop: "0.25rem" }}
                      onClick={e => { e.stopPropagation(); runModule(m.id); }}
                      disabled={runningModule === m.id}>
                      {runningModule === m.id ? "Starting..." : "Run"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestions panel */}
        <div>
          {selectedRun ? (
            <>
              <div className="card-header" style={{ marginBottom: "1rem" }}>
                <div>
                  <span className="badge badge-primary" style={{ marginRight: "0.5rem" }}>{pendingCount} pending</span>
                  <span className="badge badge-success" style={{ marginRight: "0.5rem" }}>{acceptedCount} accepted</span>
                  <span className="badge badge-danger">{rejectedCount} rejected</span>
                </div>
                <div className="btn-group">
                  <button className="btn btn-sm btn-success" onClick={() => batchAction("accept")} disabled={pendingCount === 0}>Accept All Pending</button>
                  <button className="btn btn-sm btn-danger" onClick={() => batchAction("reject")} disabled={pendingCount === 0}>Reject All Pending</button>
                </div>
              </div>

              {suggestions.length === 0 ? (
                <div className="empty-state">No suggestions found for this module.</div>
              ) : (
                suggestions.map(s => (
                  <div key={s.id} className={`suggestion ${s.status}`}>
                    <div className="suggestion-header">
                      <span className="suggestion-location">Ch.{s.chapter_number} P{s.paragraph_number} S{s.sentence_number}</span>
                      <span className={`suggestion-confidence ${confidenceClass(s.confidence_score)}`}>
                        {Math.round(s.confidence_score * 100)}%
                      </span>
                    </div>
                    <div className="suggestion-diff">
                      <div className="diff-original">{s.original_text}</div>
                      <div className="diff-suggested">{s.suggested_edit}</div>
                    </div>
                    <div className="suggestion-rationale">{s.rationale}</div>
                    {s.rule_or_source && <div className="suggestion-rule">{s.rule_or_source}</div>}

                    {s.status === "pending" && (
                      <div className="suggestion-actions">
                        <button className="btn btn-sm btn-success" onClick={() => handleSuggestion(s.id, "accept")}>Accept</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleSuggestion(s.id, "reject")}>Reject</button>
                        <input
                          className="form-input"
                          style={{ flex: 1, fontSize: "0.8rem" }}
                          placeholder="Your own edit..."
                          value={editingText[s.id] || ""}
                          onChange={e => setEditingText(prev => ({ ...prev, [s.id]: e.target.value }))}
                        />
                        <button className="btn btn-sm" onClick={() => handleSuggestion(s.id, "edit")} disabled={!editingText[s.id]}>Apply Edit</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">&#9998;</div>
              <p>Select a completed module to review suggestions</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Run modules from the list on the left, then click to view results</p>
            </div>
          )}
        </div>
      </div>
      <Toast />
    </div>
  );
}

// === Versions Page ===
function VersionsPage({ manuscriptId }: { manuscriptId: string }) {
  const [versions, setVersions] = useState<any[]>([]);
  const { show, Toast } = useToast();

  useEffect(() => {
    api(`/api/manuscripts/${manuscriptId}/versions`).then(d => setVersions(d.versions)).catch(console.error);
  }, [manuscriptId]);

  const rollback = async (versionId: string) => {
    if (!confirm("Roll back to this version? Current changes will be preserved as a new version.")) return;
    try {
      await api(`/api/manuscripts/${manuscriptId}/rollback`, { method: "POST", body: JSON.stringify({ version_id: versionId }) });
      show("Rolled back successfully");
      const d = await api(`/api/manuscripts/${manuscriptId}/versions`);
      setVersions(d.versions);
    } catch (e: any) { show(e.message); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Version History</h2>
      {versions.length === 0 ? (
        <div className="empty-state">No versions yet</div>
      ) : (
        versions.map(v => (
          <div key={v.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Version {v.version_number}</strong>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{v.change_summary}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{new Date(v.created_at).toLocaleString()}</p>
            </div>
            <button className="btn btn-sm" onClick={() => rollback(v.id)}>Rollback</button>
          </div>
        ))
      )}
      <Toast />
    </div>
  );
}

// === Export Page ===
function ExportPage({ manuscriptId }: { manuscriptId: string }) {
  const formats = [
    { id: "docx", label: "Word Document (.docx)", icon: "W" },
    { id: "epub", label: "EPUB (.epub)", icon: "E" },
    { id: "html", label: "HTML (.html)", icon: "H" },
    { id: "md", label: "Markdown (.md)", icon: "M" },
    { id: "txt", label: "Plain Text (.txt)", icon: "T" },
  ];

  const download = (format: string) => {
    window.open(`/api/manuscripts/${manuscriptId}/export/${format}`, "_blank");
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Export Manuscript</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {formats.map(f => (
          <div key={f.id} className="card" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => download(f.id)}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.5rem" }}>{f.icon}</div>
            <div style={{ fontWeight: 600 }}>{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Chapter Editor ===
function ChapterEditor({ manuscriptId }: { manuscriptId: string }) {
  const [manuscript, setManuscript] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { show, Toast } = useToast();

  useEffect(() => {
    api(`/api/manuscripts/${manuscriptId}`)
      .then(d => {
        setManuscript(d.manuscript);
        setChapters(d.chapters || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [manuscriptId]);

  const loadChapter = async (chapterId: string) => {
    if (hasChanges && !confirm("You have unsaved changes. Discard them?")) return;
    setLoadingContent(true);
    try {
      const d = await api(`/api/manuscripts/${manuscriptId}/chapters/${chapterId}`);
      setSelectedChapterId(chapterId);
      setChapterContent(d.chapter.content);
      setChapterTitle(d.chapter.title);
      setOriginalContent(d.chapter.content);
      setHasChanges(false);
    } catch (e: any) { show(e.message); }
    setLoadingContent(false);
  };

  const saveChapter = async () => {
    if (!selectedChapterId) return;
    setSaving(true);
    try {
      const d = await api(`/api/manuscripts/${manuscriptId}/chapters/${selectedChapterId}`, {
        method: "PUT",
        body: JSON.stringify({ content: chapterContent, title: chapterTitle }),
      });
      setOriginalContent(chapterContent);
      setHasChanges(false);
      // Update chapter word count in list
      setChapters(prev => prev.map(c =>
        c.id === selectedChapterId ? { ...c, word_count: d.chapter.word_count, title: chapterTitle || c.title } : c
      ));
      show("Chapter saved");
    } catch (e: any) { show(e.message); }
    setSaving(false);
  };

  const revertChanges = () => {
    if (!confirm("Discard all changes to this chapter?")) return;
    setChapterContent(originalContent);
    setHasChanges(false);
  };

  const wordCount = chapterContent.trim().split(/\s+/).filter(Boolean).length;

  if (loading) return <div className="empty-state"><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  if (!manuscript) return <div className="empty-state">Manuscript not found</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2>{manuscript.title}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {chapters.length} chapters &middot; {manuscript.word_count?.toLocaleString()} words total
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1rem" }}>
        {/* Chapter list */}
        <div>
          <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>CHAPTERS</h3>
          {chapters.map(ch => (
            <div
              key={ch.id}
              className={`chapter-item ${selectedChapterId === ch.id ? "active" : ""}`}
              onClick={() => loadChapter(ch.id)}
            >
              <div className="chapter-number">{ch.chapter_number}</div>
              <div className="chapter-info">
                <div className="chapter-title">{ch.title || `Chapter ${ch.chapter_number}`}</div>
                <div className="chapter-words">{ch.word_count?.toLocaleString()} words</div>
              </div>
            </div>
          ))}
          {chapters.length === 0 && (
            <div className="empty-state" style={{ padding: "1rem" }}>No chapters found</div>
          )}
        </div>

        {/* Editor panel */}
        <div>
          {selectedChapterId ? (
            loadingContent ? (
              <div className="empty-state"><div className="spinner" style={{ margin: "0 auto" }} /></div>
            ) : (
              <div className="chapter-editor-panel">
                <div className="chapter-editor-toolbar">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    <input
                      className="form-input chapter-title-input"
                      value={chapterTitle}
                      onChange={e => { setChapterTitle(e.target.value); setHasChanges(true); }}
                      placeholder="Chapter title"
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="btn-group">
                    {hasChanges && (
                      <button className="btn btn-sm" onClick={revertChanges}>Discard</button>
                    )}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={saveChapter}
                      disabled={saving || !hasChanges}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
                <textarea
                  className="chapter-editor-textarea"
                  value={chapterContent}
                  onChange={e => { setChapterContent(e.target.value); setHasChanges(true); }}
                  placeholder="Chapter content..."
                  spellCheck
                />
                {hasChanges && (
                  <div className="chapter-editor-status">Unsaved changes</div>
                )}
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">&#9997;</div>
              <p>Select a chapter to start editing</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Click any chapter from the list on the left</p>
            </div>
          )}
        </div>
      </div>
      <Toast />
    </div>
  );
}

// === Billing Page ===
function BillingPage() {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState<any>(null);

  useEffect(() => {
    api("/api/billing/plans").then(d => setPlans(d.plans)).catch(console.error);
  }, []);

  const checkout = async (plan: string) => {
    try {
      const { url } = await api("/api/billing/checkout", { method: "POST", body: JSON.stringify({ plan }) });
      window.location.href = url;
    } catch (e: any) { alert(e.message); }
  };

  if (!plans) return <div className="spinner" style={{ margin: "2rem auto" }} />;

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Plans & Billing</h2>
      <div className="plans-grid">
        {Object.entries(plans).map(([key, plan]: [string, any]) => (
          <div key={key} className={`plan-card ${user?.plan === key ? "current" : ""}`}>
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price}<span>/mo</span></div>
            <ul className="plan-features">
              {plan.features.map((f: string) => <li key={f}>{f}</li>)}
            </ul>
            {user?.plan === key ? (
              <span className="badge badge-success">Current Plan</span>
            ) : key !== "free" ? (
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => checkout(key)}>Upgrade</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

// === Settings Page (API Keys) ===
function SettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    default_provider: "openai",
    openai_api_key: "",
    anthropic_api_key: "",
    mistral_api_key: "",
    ollama_base_url: "",
    openai_model: "gpt-4o",
    anthropic_model: "claude-sonnet-4-20250514",
    mistral_model: "mistral-large-latest",
    ollama_model: "llama3",
  });
  const { show, Toast } = useToast();

  useEffect(() => {
    api("/api/settings/llm").then(d => {
      setConfig(d.config);
      setForm(f => ({
        ...f,
        default_provider: d.config.default_provider,
        ollama_base_url: d.config.ollama_base_url || "",
        openai_model: d.config.openai_model,
        anthropic_model: d.config.anthropic_model,
        mistral_model: d.config.mistral_model,
        ollama_model: d.config.ollama_model,
      }));
    }).catch(console.error);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = { default_provider: form.default_provider };
      if (form.openai_api_key) payload.openai_api_key = form.openai_api_key;
      if (form.anthropic_api_key) payload.anthropic_api_key = form.anthropic_api_key;
      if (form.mistral_api_key) payload.mistral_api_key = form.mistral_api_key;
      payload.ollama_base_url = form.ollama_base_url;
      payload.openai_model = form.openai_model;
      payload.anthropic_model = form.anthropic_model;
      payload.mistral_model = form.mistral_model;
      payload.ollama_model = form.ollama_model;

      const d = await api("/api/settings/llm", { method: "POST", body: JSON.stringify(payload) });
      setConfig(d.config);
      setForm(f => ({ ...f, openai_api_key: "", anthropic_api_key: "", mistral_api_key: "" }));
      show("Settings saved");
    } catch (e: any) { show(e.message); }
    setSaving(false);
  };

  const deleteKey = async (provider: string) => {
    try {
      await api("/api/settings/llm/delete-key", { method: "POST", body: JSON.stringify({ provider }) });
      const d = await api("/api/settings/llm");
      setConfig(d.config);
      show(`${provider} key deleted`);
    } catch (e: any) { show(e.message); }
  };

  const providers = [
    { id: "openai", name: "OpenAI (ChatGPT)", keyField: "openai_api_key", modelField: "openai_model", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"], configKey: config?.openai_api_key },
    { id: "anthropic", name: "Anthropic (Claude)", keyField: "anthropic_api_key", modelField: "anthropic_model", models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-3-5-haiku-20241022"], configKey: config?.anthropic_api_key },
    { id: "mistral", name: "Mistral AI", keyField: "mistral_api_key", modelField: "mistral_model", models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"], configKey: config?.mistral_api_key },
    { id: "ollama", name: "Ollama (Local)", keyField: null, modelField: "ollama_model", models: ["llama3", "llama3:70b", "mixtral", "codellama"], configKey: null },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>AI Provider Settings</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Configure your API keys for the LLM providers you want to use. Keys are encrypted and stored securely.
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Default Provider</label>
          <select className="form-select" value={form.default_provider} onChange={e => setForm(f => ({ ...f, default_provider: e.target.value }))}>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="form-hint">Which AI provider to use by default when running editing modules.</p>
        </div>
      </div>

      {providers.map(p => (
        <div key={p.id} className="card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>{p.name}</h3>

          {p.keyField && (
            <div className="form-group">
              <label className="form-label">API Key</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="form-input"
                  type="password"
                  placeholder={p.configKey ? `Current: ${p.configKey}` : "Enter API key..."}
                  value={(form as any)[p.keyField] || ""}
                  onChange={e => setForm(f => ({ ...f, [p.keyField!]: e.target.value }))}
                />
                {p.configKey && (
                  <button className="btn btn-sm btn-danger" onClick={() => deleteKey(p.id)}>Remove</button>
                )}
              </div>
            </div>
          )}

          {p.id === "ollama" && (
            <div className="form-group">
              <label className="form-label">Ollama Base URL</label>
              <input className="form-input" value={form.ollama_base_url} onChange={e => setForm(f => ({ ...f, ollama_base_url: e.target.value }))} placeholder="http://localhost:11434" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Model</label>
            <select className="form-select" value={(form as any)[p.modelField]} onChange={e => setForm(f => ({ ...f, [p.modelField]: e.target.value }))}>
              {p.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      ))}

      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
      <Toast />
    </div>
  );
}

// === Main App ===
type Page = "manuscripts" | "upload" | "consultation" | "editing" | "chapters" | "versions" | "export" | "billing" | "settings";

function App() {
  const { user, loading, logout } = useContext(AuthContext);
  const [page, setPage] = useState<Page>("manuscripts");
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [activeManuscript, setActiveManuscript] = useState<string | null>(null);
  const [loadingMs, setLoadingMs] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingMs(true);
    api("/api/manuscripts").then(d => setManuscripts(d.manuscripts)).catch(console.error).finally(() => setLoadingMs(false));
  }, [user]);

  if (loading) return <div className="auth-page"><div className="spinner" /></div>;
  if (!user) return <LoginPage />;

  const openManuscript = (ms: any) => {
    setActiveManuscript(ms.id);
    if (ms.status === "uploaded") setPage("consultation");
    else setPage("editing");
  };

  const deleteManuscript = async (id: string) => {
    if (!confirm("Delete this manuscript? This cannot be undone.")) return;
    await api(`/api/manuscripts/${id}`, { method: "DELETE" });
    setManuscripts(prev => prev.filter(m => m.id !== id));
    if (activeManuscript === id) { setActiveManuscript(null); setPage("manuscripts"); }
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-logo">Manuscript Editor</div>
        <nav className="sidebar-nav">
          <a className={page === "manuscripts" ? "active" : ""} onClick={() => setPage("manuscripts")} href="#">Manuscripts</a>
          <a className={page === "upload" ? "active" : ""} onClick={() => setPage("upload")} href="#">Upload New</a>
          {activeManuscript && (
            <>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />
              <a className={page === "editing" ? "active" : ""} onClick={() => setPage("editing")} href="#">Editing Dashboard</a>
              <a className={page === "chapters" ? "active" : ""} onClick={() => setPage("chapters")} href="#">Edit Chapters</a>
              <a className={page === "versions" ? "active" : ""} onClick={() => setPage("versions")} href="#">Version History</a>
              <a className={page === "export" ? "active" : ""} onClick={() => setPage("export")} href="#">Export</a>
            </>
          )}
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />
          <a className={page === "billing" ? "active" : ""} onClick={() => setPage("billing")} href="#">Plans & Billing</a>
          <a className={page === "settings" ? "active" : ""} onClick={() => setPage("settings")} href="#">AI Settings</a>
        </nav>
        <div className="sidebar-user">
          <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
          <div><span className="badge badge-primary">{user.plan}</span></div>
          <button className="btn btn-sm" style={{ marginTop: "0.5rem", width: "100%" }} onClick={logout}>Sign Out</button>
        </div>
      </div>

      <div className="main-content">
        {page === "manuscripts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2>Your Manuscripts</h2>
              <button className="btn btn-primary" onClick={() => setPage("upload")}>Upload New</button>
            </div>
            {loadingMs ? <div className="spinner" style={{ margin: "2rem auto" }} /> : manuscripts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">+</div>
                <p>No manuscripts yet. Upload your first one to get started.</p>
              </div>
            ) : (
              manuscripts.map(ms => (
                <div key={ms.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => openManuscript(ms)}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ms.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {ms.word_count?.toLocaleString()} words &middot; {ms.file_format.toUpperCase()} &middot;
                      <span className={`badge ${ms.status === "completed" ? "badge-success" : ms.status === "editing" ? "badge-warning" : "badge-primary"}`} style={{ marginLeft: "0.5rem" }}>{ms.status}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{new Date(ms.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); deleteManuscript(ms.id); }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {page === "upload" && (
          <UploadPage onUploaded={(ms) => {
            setManuscripts(prev => [ms, ...prev]);
            setActiveManuscript(ms.id);
            setPage("consultation");
          }} />
        )}

        {page === "consultation" && activeManuscript && (
          <ConsultationWizard manuscriptId={activeManuscript} onComplete={() => setPage("editing")} />
        )}

        {page === "editing" && activeManuscript && (
          <EditingDashboard manuscriptId={activeManuscript} />
        )}

        {page === "chapters" && activeManuscript && (
          <ChapterEditor manuscriptId={activeManuscript} />
        )}

        {page === "versions" && activeManuscript && (
          <VersionsPage manuscriptId={activeManuscript} />
        )}

        {page === "export" && activeManuscript && (
          <ExportPage manuscriptId={activeManuscript} />
        )}

        {page === "billing" && <BillingPage />}

        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}

// Mount
const root = createRoot(document.getElementById("root")!);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
