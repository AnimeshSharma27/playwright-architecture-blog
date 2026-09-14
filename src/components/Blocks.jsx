/* Small reusable content blocks used by the article */

export function Section({ id, kicker, title, children }) {
  return (
    <section className="section" id={id}>
      {kicker && <div className="section-kicker">{kicker}</div>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/* A plain-language analogy callout ("think of it like…") */
export function Analogy({ title = 'Think of it like this', children }) {
  return (
    <aside className="analogy">
      <svg className="analogy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2h5c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" />
      </svg>
      <div>
        <div className="analogy-title">{title}</div>
        <p>{children}</p>
      </div>
    </aside>
  );
}

/* Code block with a filename header and hand-coloured tokens */
export function CodeBlock({ file, lines }) {
  return (
    <div className="code">
      <div className="code-head">
        <span>{file}</span>
        <span>TypeScript</span>
      </div>
      <pre>
        <code>
          {lines.map((l, i) => (
            <span key={i}>
              <span className="ln">{i + 1}</span>
              {l}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* One numbered step in the execution trace */
export function Step({ n, code, title, layer, children }) {
  return (
    <div className="step">
      <div className="step-num" aria-hidden="true">
        {n}
      </div>
      <div className="step-body">
        {code && <span className="step-code">{code}</span>}
        <div className="step-title">{title}</div>
        <p className="step-text">{children}</p>
        {layer && (
          <span className="step-layer">
            Where it happens: <b>{layer}</b>
          </span>
        )}
      </div>
    </div>
  );
}

export function Tick() {
  return (
    <svg className="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
