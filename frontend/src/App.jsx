import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const roles = [
  'frontend developer', 'backend developer', 'full stack developer', 'python developer',
  'java developer', 'data analyst', 'machine learning engineer', 'ui ux designer',
  'android developer', 'software tester', 'devops engineer', 'general fresher'
];

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    alert: <><path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function scoreTone(score) {
  if (score >= 75) return 'good';
  if (score >= 50) return 'mid';
  return 'low';
}

function App() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('full stack developer');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const hasJobDescription = jobDescription.trim().length > 0;

  const scoreColor = useMemo(() => {
    if (!result) return 'var(--accent)';
    return result.match_score >= 75 ? 'var(--green)' : result.match_score >= 50 ? 'var(--amber)' : 'var(--rose)';
  }, [result]);

  function chooseFile(candidate) {
    setError('');
    if (!candidate) return;
    const extension = candidate.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx'].includes(extension)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setError('Your file is larger than 5 MB. Please choose a smaller file.');
      return;
    }
    setFile(candidate);
    setResult(null);
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    if (!file) return setError('Upload your resume to get started.');
    if (!role && !hasJobDescription) return setError('Choose a target role or paste a job description.');
    if (hasJobDescription && jobDescription.trim().length < 30) return setError('Please paste a fuller job description (at least 30 characters).');

    const data = new FormData();
    data.append('file', file);
    if (role) data.append('role', role);
    if (hasJobDescription) data.append('job_description', jobDescription.trim());
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/analyze`, data, { timeout: 60000 });
      setResult(response.data);
      window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Could not analyze this resume. Check that the API is running and try again.');
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    if (!result) return;
    const lines = [
      'RESUMEIQ — RESUME MATCH REPORT',
      `Target: ${result.target_role}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Match score: ${result.match_score}% — ${result.match_label}`,
      '', 'SCORE BREAKDOWN',
      `Detected-skill coverage: ${result.score_breakdown.skill_coverage}%`,
      `Text similarity: ${result.score_breakdown.text_similarity}%`,
      `Formula: ${result.score_breakdown.formula}`,
      '', 'SKILLS DETECTED IN RESUME', ...(result.resume_skills.length ? result.resume_skills : ['No supported skills detected']),
      '', 'MATCHED REQUIREMENTS', ...(result.found_skills.length ? result.found_skills : ['None detected']),
      '', 'NOT DETECTED IN RESUME', ...(result.missing_skills.length ? result.missing_skills : ['No missing requirements detected']),
      '', 'SUGGESTIONS', ...result.suggestions.map((s, i) => `${i + 1}. ${s}`),
      '', 'NOTE', result.disclaimer
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resumeiq-analysis-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setFile(null); setResult(null); setError(''); setJobDescription('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ResumeIQ home"><span className="brand-mark"><Icon name="spark" size={21} /></span><span>resume<span className="brand-accent">iq</span></span></a>
        <nav className="topnav"><a href="#how-it-works">How it works</a><a href="#analysis">What you get</a><span className="privacy-note"><Icon name="shield" size={14}/> Private by design</span></nav>
      </header>

      <main id="top" className="main-wrap">
        <section className="hero">
          
          <h1>Make your next move<br/><span className="gradient-text">a smarter one.</span></h1>
          <p className="hero-copy">See how your resume lines up with the role you want. Get a clear match breakdown, skill gaps, and practical ways to improve.</p>
          <div className="hero-points"><span><Icon name="check" size={15}/> Explainable match score</span><span><Icon name="check" size={15}/> Actionable skill insights</span><span><Icon name="check" size={15}/> No official ATS claims</span></div>
        </section>

        <section className="workspace-grid" aria-label="Resume analysis form">
          <form className="panel form-panel" onSubmit={handleAnalyze}>
            <div className="panel-heading"><div><span className="step-label">STEP 01</span><h2>Start with your resume</h2><p>Upload a recent version to get a more useful comparison.</p></div><div className="heading-icon"><Icon name="file" size={22}/></div></div>
            <div className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files?.[0]); }}>
              <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => chooseFile(e.target.files?.[0])} aria-label="Upload resume" />
              <div className="upload-icon"><Icon name={file ? 'check' : 'upload'} size={24}/></div>
              {file ? <><strong className="file-name">{file.name}</strong><span className="muted-text">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</span><button className="text-button" type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}>Choose another file</button></> : <><strong>Drop your resume here</strong><span className="muted-text">or browse files from your device</span><button className="browse-button" type="button" onClick={() => inputRef.current?.click()}>Browse files <Icon name="arrow" size={15}/></button><span className="file-hint">PDF or DOCX · Up to 5 MB</span></>}
            </div>

            <div className="form-divider"><span>THEN, SET YOUR TARGET</span></div>
            <label className="field-label" htmlFor="role-select">Target role <span className="optional">Optional if you add a job description</span></label>
            <div className="select-wrap"><Icon name="briefcase" size={17}/><select id="role-select" value={role} onChange={(e) => setRole(e.target.value)}><option value="">Choose a role template</option>{roles.map((item) => <option key={item} value={item}>{item.replace(/\b\w/g, c => c.toUpperCase())}</option>)}</select></div>
            <div className="or-divider"><span>OR GET MORE PRECISE</span></div>
            <label className="field-label" htmlFor="job-description">Paste a job description <span className="optional">Recommended</span></label>
            <textarea id="job-description" className="job-textarea" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} maxLength={20000} placeholder="Paste the job responsibilities and requirements here. We'll compare the resume against the skills and wording in this description…" />
            <div className="textarea-meta"><span>Use the full description for better context</span><span>{jobDescription.length.toLocaleString()} / 20,000</span></div>
            {error && <div className="error-banner" role="alert"><Icon name="alert" size={18}/><span>{error}</span></div>}
            <button className="primary-button" type="submit" disabled={loading}>{loading ? <><span className="spinner"/> Analyzing your resume…</> : <><Icon name="spark" size={18}/> Analyze my match <Icon name="arrow" size={17}/></>}</button>
            <p className="privacy-caption"><Icon name="shield" size={14}/> Your resume is processed for this request and is not saved by this demo.</p>
          </form>

          <aside className="side-column">
            <div className="panel why-panel"><span className="step-label">BUILT FOR CLARITY</span><h2>More than a number.</h2><p className="muted-paragraph">Understand where you align with a role—and what to review before you apply.</p><div className="benefit-list"><div className="benefit"><span className="benefit-icon violet"><Icon name="target"/></span><div><strong>Transparent scoring</strong><p>See skill coverage and text similarity separately.</p></div></div><div className="benefit"><span className="benefit-icon green"><Icon name="check"/></span><div><strong>Evidence-led gaps</strong><p>Requirements not found in the document are clearly identified.</p></div></div><div className="benefit"><span className="benefit-icon amber"><Icon name="spark"/></span><div><strong>Practical next steps</strong><p>Get suggestions to tailor your resume honestly.</p></div></div></div></div>
            <div className="mini-note"><div className="note-icon"><Icon name="shield" size={18}/></div><div><strong>Your experience stays yours.</strong><p>Missing keywords don't prove missing skills. Only add details that accurately reflect your experience.</p></div></div>
          </aside>
        </section>

        {result && <section id="results" className="results-section">
          <div className="results-heading"><div><span className="step-label">YOUR RESULTS</span><h2>Here’s your match snapshot.</h2><p>Use this as a guide for tailoring—not as a hiring decision.</p></div><button className="secondary-button" onClick={downloadReport}><Icon name="download" size={17}/> Download report</button></div>
          <div className="results-grid">
            <div className="panel score-panel"><div className="result-card-title"><span className="small-icon"><Icon name="target"/></span><span>Overall match</span><span className={`status-pill ${scoreTone(result.match_score)}`}>{result.match_label}</span></div><div className="score-ring-wrap"><div className="score-ring" style={{'--score': `${result.match_score * 3.6}deg`, '--score-color': scoreColor}}><div className="score-ring-inner"><strong>{result.match_score}<small>%</small></strong><span>match score</span></div></div></div><p className="score-explain">An indicative score based on detected skill coverage and text similarity.</p><div className="score-breakdown"><div className="breakdown-line"><div><span>Detected skill coverage</span><strong>{result.score_breakdown.skill_coverage}%</strong></div><div className="meter"><span style={{width: `${result.score_breakdown.skill_coverage}%`}}/></div></div><div className="breakdown-line"><div><span>Text similarity</span><strong>{result.score_breakdown.text_similarity}%</strong></div><div className="meter meter-blue"><span style={{width: `${result.score_breakdown.text_similarity}%`}}/></div></div></div></div>
            <div className="panel summary-panel"><div className="result-card-title"><span className="small-icon"><Icon name="briefcase"/></span><span>Analysis overview</span></div><div className="target-box"><span>Compared against</span><strong>{result.target_role?.replace(/\b\w/g, c => c.toUpperCase())}</strong><small>{result.analysis_mode === 'job_description' ? 'Custom job description' : 'Role skill template'}</small></div><div className="stats-row"><div className="stat"><strong>{result.found_skills.length}</strong><span>Matched</span></div><div className="stat"><strong>{result.missing_skills.length}</strong><span>Not detected</span></div><div className="stat"><strong>{result.resume_skills.length}</strong><span>Resume skills</span></div></div><div className="predicted-role"><span>Classifier estimate</span><strong>{result.predicted_role?.replace(/\b\w/g, c => c.toUpperCase()) || 'Not available'}</strong><small>This is a separate model estimate, not a recommendation or hiring decision.</small></div></div>
          </div>

          <div className="skills-grid"><div className="panel skills-panel"><div className="section-title-row"><div><span className="section-kicker">WHAT ALIGNS</span><h3>Matched requirements</h3></div><span className="count-pill green-count">{result.found_skills.length}</span></div>{result.found_skills.length ? <div className="skill-chips">{result.found_skills.map((skill) => <span className="skill-chip matched" key={skill}><Icon name="check" size={13}/>{skill}</span>)}</div> : <p className="empty-state">No required skills were detected in the resume text.</p>}</div><div className="panel skills-panel"><div className="section-title-row"><div><span className="section-kicker">WHAT TO REVIEW</span><h3>Not detected in resume</h3></div><span className="count-pill rose-count">{result.missing_skills.length}</span></div>{result.missing_skills.length ? <div className="skill-chips">{result.missing_skills.map((skill) => <span className="skill-chip missing" key={skill}>{skill}</span>)}</div> : <p className="empty-state">All recognized requirements were detected. Review the quality of your supporting examples.</p>}</div></div>

          <div className="panel recommendations-panel"><div className="recommendations-head"><span className="recommendation-icon"><Icon name="spark" size={20}/></span><div><span className="section-kicker">YOUR NEXT STEPS</span><h3>Make your resume work harder.</h3></div></div><div className="recommendation-list">{result.suggestions.map((suggestion, index) => <div className="recommendation-item" key={suggestion}><span>{String(index + 1).padStart(2, '0')}</span><p>{suggestion}</p></div>)}</div><div className="disclaimer"><Icon name="shield" size={16}/><p>{result.disclaimer}</p></div></div>
          <div className="results-footer"><span><Icon name="history" size={15}/> This demo does not save analysis history.</span><button className="text-button" onClick={reset}>Start a new analysis <Icon name="arrow" size={14}/></button></div>
        </section>}

        <section id="how-it-works" className="how-section"><div className="section-intro"><span className="step-label">A CLEARER PROCESS</span><h2>Three steps to more focused applications.</h2></div><div className="steps-grid"><div className="step-card"><span className="step-number">01</span><h3>Upload</h3><p>Share a text-based PDF or DOCX resume.</p></div><div className="step-card"><span className="step-number">02</span><h3>Compare</h3><p>Choose a role or paste the job description you care about.</p></div><div className="step-card"><span className="step-number">03</span><h3>Improve</h3><p>Review matched skills, gaps and grounded suggestions.</p></div></div></section>
        <section id="analysis" className="method-note"><div className="method-icon"><Icon name="shield" size={20}/></div><div><strong>Built to explain its reasoning</strong><p>The score combines detected-skill coverage and TF-IDF text similarity. It is an indicative comparison, not an official ATS score, and does not judge candidate quality or guarantee interview outcomes.</p></div></section>
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="spark" size={17}/></span><span>resume<span className="brand-accent">iq</span></span></a><span>Thoughtful tools for your next career step.</span><span>Built by Jahnvi Srivastava</span></footer>
    </div>
  );
}

export default App;
