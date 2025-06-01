import React, { useState, useRef } from "react";
import './global-fullscreen.css';

function App() {
  const [inputText, setInputText] = useState("");
  const [formatted, setFormatted] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef();

  const handleTextChange = (e) => {
    setInputText(e.target.value);
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setInputText("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormatted("");
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", inputText);
    }
    const res = await fetch("https://apa-formatter-backend.onrender.com/format-apa/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFormatted(data.formatted || data.error || "");
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    setDownloadUrl("");
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", inputText);
    }
    formData.append("output_format", "docx");
    const res = await fetch("https://apa-formatter-backend.onrender.com/format-apa/", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      // Trigger download automatically
      const a = document.createElement("a");
      a.href = url;
      a.download = "formatted.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    }
    setLoading(false);
  };

  const unifiedDark = '#181a1b';
  const highlight = darkMode ? '#42a5f5' : '#1976d2';
  const boxShadowHighlight = darkMode
    ? '0 0 0 2px #42a5f5, 0 2px 8px rgba(66,165,245,0.18)'
    : '0 0 0 2px #1976d2, 0 2px 8px rgba(25,118,210,0.10)';
  const boxShadowSoft = darkMode
    ? '0 2px 16px rgba(66,165,245,0.12)'
    : '0 2px 16px rgba(25,118,210,0.07)';
  const baseButtonStyle = {
    background: darkMode ? 'linear-gradient(90deg,#181a1b,#181a1b)' : 'linear-gradient(90deg,#1976d2,#64b5f6)',
    color: '#fff',
    border: `2px solid ${highlight}`,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 16,
    padding: '10px 28px',
    boxShadow: boxShadowHighlight,
    cursor: 'pointer',
    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    marginTop: 8,
    marginBottom: 8
  };
  const disabledButtonStyle = {
    ...baseButtonStyle,
    background: darkMode ? '#181a1b' : '#b0c4de',
    border: `2px solid ${darkMode ? '#333' : '#b0c4de'}`,
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.7
  };
  const smallButtonStyle = {
    ...baseButtonStyle,
    fontSize: 15,
    padding: '7px 18px',
    boxShadow: boxShadowHighlight
  };
  const closeButtonStyle = {
    background: darkMode ? 'linear-gradient(90deg,#181a1b,#181a1b)' : 'linear-gradient(90deg,#1976d2,#64b5f6)',
    color: '#fff',
    border: `2px solid ${highlight}`,
    borderRadius: '50%',
    width: 32,
    height: 32,
    fontSize: 22,
    cursor: 'pointer',
    boxShadow: boxShadowHighlight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
    outline: 'none',
    position: 'relative'
  };
  const appBg = darkMode ? unifiedDark : '#fff';
  const panelBg = darkMode ? unifiedDark : '#fff';
  const borderCol = darkMode ? unifiedDark : '#ddd';
  const textCol = darkMode ? '#f3f6fa' : '#222';
  const modalBg = darkMode ? unifiedDark : '#fff';
  const overlayBg = darkMode ? 'rgba(20,22,25,0.8)' : 'rgba(0,0,0,0.6)';
  const buttonCss = `
    button, a[role=button] {
      outline: none;
    }
    button:focus-visible, a[role=button]:focus-visible {
      box-shadow: 0 0 0 3px #90caf9;
    }
    button:hover:not(:disabled), a[role=button]:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 16px rgba(25,118,210,0.18);
    }
    button:active:not(:disabled), a[role=button]:active:not(:disabled) {
      filter: brightness(0.98);
      transform: translateY(1px) scale(0.98);
    }
    body, #root {
      background: ${appBg} !important;
      color: ${textCol} !important;
      transition: background 0.3s, color 0.3s;
    }
  `;

  const bluePillButtonStyle = (enabled, borderRadius, fontSize, minWidth, padding, gap) => ({
    background: enabled
      ? 'linear-gradient(180deg, #6a8dff 0%, #5f4fff 100%)'
      : '#bfc7e6',
    color: '#fff',
    border: 'none',
    borderRadius: borderRadius,
    fontWeight: 600,
    fontSize: fontSize,
    fontFamily: 'inherit',
    minWidth: minWidth,
    padding: padding,
    boxShadow: enabled ? '0 4px 16px rgba(25,118,210,0.18)' : 'none',
    outline: 'none',
    cursor: enabled ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: gap,
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s, color 0.2s',
    opacity: enabled ? 1 : 0.6,
    userSelect: 'none',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', background: appBg, color: textCol, transition: 'background 0.3s, color 0.3s' }}>
      {pdfToShow && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:overlayBg,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setPdfToShow(null)}>
          <div style={{background:modalBg,padding:16,borderRadius:8,maxWidth:'90vw',maxHeight:'90vh',boxShadow:boxShadowHighlight}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button onClick={()=>setPdfToShow(null)} style={closeButtonStyle} aria-label="Close PDF modal">&times;</button>
            </div>
            <iframe src={pdfToShow} title="Reference PDF" style={{width:'70vw',height:'80vh',border:'none',background:modalBg}} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, borderRight: `1px solid ${borderCol}`, background: panelBg, padding: 0 }}>
          <div style={{ padding: 32, paddingBottom: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f3f6fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
              <label style={{display:'inline-block',position:'relative',width:36,height:20,cursor:'pointer'}}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={()=>setDarkMode(d=>!d)}
                  style={{opacity:0,width:0,height:0}}
                  aria-label="Toggle dark mode"
                />
                <span style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:darkMode?'#1976d2':'#ccc',borderRadius:12,transition:'background 0.2s'}}></span>
                <span style={{position:'absolute',top:2,left:darkMode?18:2,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'left 0.2s,background 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'}}></span>
              </label>
            </div>
            <h2 style={{margin:0}}>Paste or Upload Document</h2>
          </div>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', flex:1, minHeight:0, height:'100%', padding: '0 32px 0 32px'}}>
            <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
              <textarea
                style={{
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  width: '100%',
                  resize: 'none',
                  overflow: 'auto',
                  background: panelBg,
                  color: textCol,
                  border: `2px solid ${highlight}`,
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 15,
                  transition:'background 0.3s, color 0.3s, border 0.2s',
                  boxShadow: boxShadowSoft,
                  marginBottom: 12
                }}
                placeholder="Paste your document here..."
                value={inputText}
                onChange={handleTextChange}
                disabled={!!file}
              />
            </div>
            <div style={{marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6}}>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                disabled={!!file}
                ref={fileInputRef}
              />
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setInputText("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginLeft: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: darkMode ? '#f3f6fa' : '#222',
                    fontSize: 18,
                    lineHeight: 1
                  }}
                  aria-label="Clear uploaded file"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || (!inputText && !file)}
              style={{
                ...bluePillButtonStyle(
                  !(loading || (!inputText && !file)),
                  12, 
                  12, 
                  40, 
                  '4px 8px', 
                  4
                ),
                width: 'auto',
                alignSelf: 'flex-start',
                maxWidth: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onFocus={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:3,opacity:(loading||(!inputText&& !file))?0.5:1}}><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v5m0 0l-2-2m2 2l2-2"/></svg>
              {loading ? "Formatting..." : "Format to APA"}
            </button>
          </form>
          <div style={{ padding: '0 32px 18px 32px', marginTop: 'auto' }}>
            <div style={{ marginBottom: 4 }} className="reference-list">
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Reference Documents</h3>
              <ul style={{ gap: 2, paddingLeft: 0 }}>
                <li>
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => setPdfToShow("/creating-reference-list.pdf")}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setPdfToShow("/creating-reference-list.pdf")}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: darkMode ? '#20232a' : '#f4f8fd',
                      border: `1px solid ${darkMode ? '#232b39' : '#e3eaf5'}`,
                      boxShadow: 'none',
                      transition: 'background 0.18s, box-shadow 0.18s',
                      fontWeight: 500,
                      fontSize: 14,
                      outline: 'none',
                      marginBottom: 2
                    }}
                    onMouseOver={e => e.currentTarget.style.background = darkMode ? '#232b39' : '#eaf2fb'}
                    onMouseOut={e => e.currentTarget.style.background = darkMode ? '#20232a' : '#f4f8fd'}
                    onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${highlight}`}
                    onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                    aria-label="Open Creating Reference List PDF"
                  >
                    <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,marginRight:4}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
                    </span>
                    Creating Reference List (PDF)
                  </div>
                </li>
                <li>
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => setPdfToShow("/Example.pdf")}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setPdfToShow("/Example.pdf")}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: darkMode ? '#20232a' : '#f4f8fd',
                      border: `1px solid ${darkMode ? '#232b39' : '#e3eaf5'}`,
                      boxShadow: 'none',
                      transition: 'background 0.18s, box-shadow 0.18s',
                      fontWeight: 500,
                      fontSize: 14,
                      outline: 'none',
                      marginBottom: 2
                    }}
                    onMouseOver={e => e.currentTarget.style.background = darkMode ? '#232b39' : '#eaf2fb'}
                    onMouseOut={e => e.currentTarget.style.background = darkMode ? '#20232a' : '#f4f8fd'}
                    onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${highlight}`}
                    onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                    aria-label="Open Example APA Paper PDF"
                  >
                    <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,marginRight:4}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
                    </span>
                    Example APA Paper (PDF)
                  </div>
                </li>
              </ul>
            </div>
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center' }}>
              <a
                href="https://www.buymeacoffee.com/oaklizard27"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ffdd00',
                  color: '#222',
                  borderRadius: 16,
                  padding: '7px 18px',
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  marginTop: 10
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19c.5 1.5 2 2 6 2s5.5-.5 6-2"/><path d="M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5z"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>
                Buy Me a Coffee
              </a>
            </div>
          </div>
        </div>
        {/* Right Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, background: panelBg, padding: 0 }}>
          <div style={{ padding: '32px 40px 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <h2 style={{margin:0}}>Formatted (APA)</h2>
            <button
              onClick={handleDownload}
              disabled={!formatted || loading}
              style={{
                ...bluePillButtonStyle(
                  !(loading || !formatted),
                  15, 
                  13, 
                  60, 
                  '4px 10px', 
                  5
                ),
                marginTop: -10
              }}
              aria-label="Download formatted APA document"
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onFocus={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',marginRight:3,opacity:(!formatted||loading)?0.5:1}}><path d="M12 5v10m0 0l-3-3m3 3l3-3"/><rect x="4" y="19" width="16" height="2" rx="1"/></svg>
              Download .docx
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', padding: '0 32px 32px 32px' }}>
            <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  width: '100%',
                  resize: 'none',
                  overflow: 'auto',
                  background: panelBg,
                  color: textCol,
                  border: `2px solid ${highlight}`,
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 15,
                  transition:'background 0.3s, color 0.3s, border 0.2s',
                  boxShadow: boxShadowSoft,
                  marginBottom: 0
                }}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            </div>
            <div style={{ position: 'relative', alignSelf: 'flex-end' }}>
              <button
                onClick={async () => {
                  if (formatted) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(formatted.replace(/<[^>]+>/g, ''));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    } else {
                      // Fallback for unsupported browsers
                      const tempTextArea = document.createElement("textarea");
                      tempTextArea.value = formatted.replace(/<[^>]+>/g, '');
                      document.body.appendChild(tempTextArea);
                      tempTextArea.select();
                      try {
                        document.execCommand('copy');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      } catch (err) {
                        alert("Copy not supported in this browser.");
                      }
                      document.body.removeChild(tempTextArea);
                    }
                  }
                }}
                style={{
                  ...bluePillButtonStyle(
                    !!formatted,
                    15, 
                    13, 
                    60, 
                    '4px 10px', 
                    5
                  ),
                  marginTop: 18
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onFocus={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {copied ? 'Copied!' : 'Copy'}
                <span style={{
                  marginRight:6,
                  transition:'color 0.2s',
                  color: '#fff',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: '0 1px 6px rgba(25,118,210,0.28)'
                }}>
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 10.9 17 4 11.5"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2.5"/><rect x="3" y="3" width="13" height="13" rx="2.5"/></svg>
                  )}
                </span>
              </button>
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '110%',
                  transform: 'translateX(-50%)',
                  background: darkMode ? '#232b39' : '#f4f8fd',
                  color: darkMode ? '#90caf9' : '#1976d2',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: copied ? 1 : 0,
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.08)',
                  transition: 'opacity 0.2s',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  visibility: copied ? 'visible' : 'hidden'
                }}
              >
                Copied!
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{buttonCss}
        {`
        .reference-list ul {
          list-style: none;
          padding-left: 0;
          margin-left: 0;
        }
        .reference-list li {
          position: relative;
          padding-left: 1.5em;
          margin-bottom: 0.25em;
          font-size: 1em;
          line-height: 1.7;
        }
        .reference-list li::before {
          content: '';
          display: inline-block;
          position: absolute;
          left: 0.3em;
          top: 50%;
          transform: translateY(-50%);
          width: 0.52em;
          height: 0.52em;
          border-radius: 3px;
          background: none;
          border: 2px solid ${darkMode ? '#42a5f5' : '#1976d2'};
          box-sizing: border-box;
          box-shadow: none;
        }
        `}
      </style>
    </div>
  );
}

export default App;
