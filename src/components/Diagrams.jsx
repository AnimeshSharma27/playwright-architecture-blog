/*
  Hand-drawn SVG diagrams. All strokes use currentColor (inherits the page's
  text colour) so they read in light and dark mode. Only two hues are literal:
  var(--pw) = Playwright green, var(--se) = Selenium amber.
*/

const PW = 'var(--pw)';
const SE = 'var(--se)';
const PW_SOFT = 'var(--pw-soft)';
const SE_SOFT = 'var(--se-soft)';
const ACCENT = 'var(--accent)';
const RAISED = 'var(--bg-raised)';
const SUNKEN = 'var(--bg-sunken)';

function Defs({ id = 'arrow' }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
      </marker>
      <marker id={`${id}-pw`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={PW} />
      </marker>
      <marker id={`${id}-se`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={SE} />
      </marker>
    </defs>
  );
}

function Box({ x, y, w, h, title, sub, stroke = 'currentColor', fill = RAISED, titleFill = 'currentColor', dashed = false, r = 10 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray={dashed ? '6 4' : undefined} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 6 : y + h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="600" fill={titleFill}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="11.5" fill="currentColor" opacity="0.75">
          {sub}
        </text>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------
   1. Playwright layered architecture (top → bottom)
---------------------------------------------------------------- */
export function PlaywrightStackDiagram() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 560" role="img" aria-label="Playwright architecture: your test script calls the Playwright client, which sends commands over one persistent two-way connection to the browser; inside the browser sit isolated contexts, pages, frames and DOM elements.">
        <Defs id="a1" />

        {/* 1. Test script */}
        <Box x={120} y={14} w={520} h={64} title="1 · Your test script" sub="TypeScript / JavaScript · Python · Java · .NET" />
        <line x1="380" y1="78" x2="380" y2="104" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#a1)" />
        <text x="392" y="95" fontSize="11.5" fill="currentColor" opacity="0.75" fontFamily="var(--font-mono)">
          await page.click('#login')
        </text>

        {/* 2. Client + driver */}
        <Box x={120} y={106} w={520} h={78} title="2 · Playwright client library + driver (Node.js)" sub="Packs your call into a small JSON message (JS: in-process · Python/Java/.NET: tiny Node helper)" />

        {/* 3. The channel */}
        <rect x="120" y="190" width="520" height="76" rx="10" fill={PW_SOFT} stroke={PW} strokeWidth="1.5" />
        <text x="136" y="218" fontSize="14" fontWeight="700" fill={PW}>
          3 · ONE connection, kept open, both directions
        </text>
        <text x="136" y="238" fontSize="11.5" fill="currentColor" opacity="0.8">
          WebSocket or pipe · no HTTP round trip per command
        </text>
        {/* down arrow: commands */}
        <line x1="500" y1="196" x2="500" y2="258" stroke={PW} strokeWidth="2" markerEnd="url(#a1-pw)" />
        <text x="492" y="230" fontSize="11" fontWeight="600" fill={PW} textAnchor="end">
          commands
        </text>
        {/* up arrow: events */}
        <line x1="570" y1="260" x2="570" y2="198" stroke={PW} strokeWidth="2" markerEnd="url(#a1-pw)" />
        <text x="578" y="230" fontSize="11" fontWeight="600" fill={PW}>
          events
        </text>

        {/* 4. Browser */}
        <rect x="120" y="272" width="520" height="274" rx="12" fill={SUNKEN} stroke="currentColor" strokeWidth="1.5" />
        <text x="136" y="298" fontSize="14" fontWeight="600" fill="currentColor">
          4 · Browser (Playwright ships its own tested build)
        </text>

        {/* engines */}
        <Box x={136} y={310} w={156} h={44} title="Chromium" sub="via CDP" r={8} />
        <Box x={302} y={310} w={156} h={44} title="Firefox" sub="via Juggler (patched)" r={8} />
        <Box x={468} y={310} w={156} h={44} title="WebKit" sub="via WebKit protocol" r={8} />

        {/* context → page → frame */}
        <rect x="136" y="368" width="488" height="164" rx="10" fill={RAISED} stroke={PW} strokeWidth="1.5" />
        <text x="152" y="392" fontSize="13" fontWeight="600" fill="currentColor">
          5 · Browser context
        </text>
        <text x="300" y="392" fontSize="11.5" fill="currentColor" opacity="0.75">
          isolated, like a brand-new incognito profile — cheap to create
        </text>

        <rect x="152" y="404" width="456" height="112" rx="8" fill={SUNKEN} stroke="currentColor" strokeWidth="1.2" />
        <text x="168" y="426" fontSize="13" fontWeight="600" fill="currentColor">
          6 · Page
        </text>
        <text x="228" y="426" fontSize="11.5" fill="currentColor" opacity="0.75">
          one tab · has its own console, network, dialogs
        </text>

        <rect x="168" y="438" width="424" height="64" rx="8" fill={RAISED} stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 4" />
        <text x="184" y="460" fontSize="13" fontWeight="600" fill="currentColor">
          7 · Frames → DOM elements
        </text>
        <text x="184" y="480" fontSize="11.5" fill="currentColor" opacity="0.75">
          where the locator finally finds your button
        </text>
      </svg>
      <figcaption>
        Playwright's layers, top to bottom. The green band is the part that makes it different: a single connection that stays open, so the browser can also talk back (events) without being asked.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------
   2. Selenium flow (left → right)
---------------------------------------------------------------- */
export function SeleniumFlowDiagram() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 240" role="img" aria-label="Selenium architecture: the test script and language bindings send one HTTP request per command to a separate browser driver executable, which then controls the browser and sends an HTTP response back.">
        <Defs id="a2" />

        <Box x={20} y={70} w={200} h={80} title="Your test + bindings" sub="Java · Python · C# · JS · Ruby" />
        <Box x={290} y={70} w={200} h={80} title="Browser driver (.exe)" sub="chromedriver · geckodriver · …" stroke={SE} fill={SE_SOFT} titleFill={SE} />
        <Box x={560} y={70} w={180} h={80} title="Browser" sub="Chrome · Firefox · Edge · Safari" />

        {/* request arrow */}
        <line x1="222" y1="92" x2="288" y2="92" stroke={SE} strokeWidth="2" markerEnd="url(#a2-se)" />
        <text x="255" y="58" fontSize="11" fontWeight="600" fill={SE} textAnchor="middle">
          HTTP request
        </text>
        <text x="255" y="44" fontSize="10.5" fill="currentColor" opacity="0.75" textAnchor="middle">
          W3C WebDriver, JSON
        </text>

        {/* response arrow */}
        <line x1="288" y1="128" x2="222" y2="128" stroke={SE} strokeWidth="2" markerEnd="url(#a2-se)" />
        <text x="255" y="176" fontSize="11" fontWeight="600" fill={SE} textAnchor="middle">
          HTTP response
        </text>

        {/* driver → browser */}
        <line x1="492" y1="110" x2="558" y2="110" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#a2)" />
        <line x1="558" y1="110" x2="492" y2="110" stroke="none" />
        <text x="525" y="58" fontSize="10.5" fill="currentColor" opacity="0.75" textAnchor="middle">
          browser's own
        </text>
        <text x="525" y="72" fontSize="10.5" fill="currentColor" opacity="0.75" textAnchor="middle">
          automation API
        </text>

        {/* repeat badge */}
        <rect x="20" y="196" width="470" height="30" rx="15" fill={SE_SOFT} stroke={SE} strokeWidth="1.2" strokeDasharray="5 4" />
        <text x="255" y="215" fontSize="12" fontWeight="600" fill={SE} textAnchor="middle">
          ↻ repeat this whole round trip for EVERY command (find, click, type, read text…)
        </text>
      </svg>
      <figcaption>
        Selenium's path. The driver executable in the middle is an extra hop, and each command is its own HTTP request-and-response — the browser never volunteers information on its own.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------
   3. Side by side: what actually changes
---------------------------------------------------------------- */
export function SideBySideDiagram() {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 320" role="img" aria-label="Side-by-side comparison: Selenium has three hops with a separate driver and one HTTP round trip per command; Playwright has two hops with a single persistent two-way connection.">
        <Defs id="a3" />

        {/* Selenium lane */}
        <rect x="0" y="10" width="760" height="140" rx="12" fill="none" stroke={SE} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <text x="16" y="34" fontSize="12" fontWeight="700" letterSpacing="0.1em" fill={SE}>
          SELENIUM
        </text>
        <Box x={40} y={56} w={170} h={64} title="Test script" sub="+ language binding" />
        <Box x={295} y={56} w={170} h={64} title="Driver .exe" sub="extra hop" stroke={SE} fill={SE_SOFT} titleFill={SE} />
        <Box x={550} y={56} w={170} h={64} title="Browser" />
        <line x1="212" y1="78" x2="293" y2="78" stroke={SE} strokeWidth="2" markerEnd="url(#a3-se)" />
        <line x1="293" y1="98" x2="212" y2="98" stroke={SE} strokeWidth="2" markerEnd="url(#a3-se)" />
        <line x1="467" y1="88" x2="548" y2="88" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#a3)" />
        <text x="252" y="140" fontSize="11" fill={SE} fontWeight="600" textAnchor="middle">
          1 HTTP round trip per command
        </text>
        <text x="380" y="140" fontSize="11" fill="currentColor" opacity="0.75" textAnchor="middle" />
        <text x="635" y="140" fontSize="11" fill="currentColor" opacity="0.75" textAnchor="middle">
          you install this separately*
        </text>

        {/* Playwright lane */}
        <rect x="0" y="170" width="760" height="140" rx="12" fill="none" stroke={PW} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        <text x="16" y="194" fontSize="12" fontWeight="700" letterSpacing="0.1em" fill={PW}>
          PLAYWRIGHT
        </text>
        <Box x={40} y={216} w={170} h={64} title="Test script" sub="+ Playwright client" />
        <Box x={550} y={216} w={170} h={64} title="Browser" sub="ships with Playwright" stroke={PW} fill={PW_SOFT} titleFill={PW} />
        {/* one thick two-way line */}
        <line x1="216" y1="248" x2="544" y2="248" stroke={PW} strokeWidth="4" markerStart="url(#a3-pw)" markerEnd="url(#a3-pw)" />
        <rect x="290" y="232" width="180" height="32" rx="16" fill={RAISED} stroke={PW} strokeWidth="1.5" />
        <text x="380" y="252" fontSize="12" fontWeight="700" fill={PW} textAnchor="middle">
          1 connection · stays open
        </text>
        <text x="380" y="300" fontSize="11" fill={PW} fontWeight="600" textAnchor="middle">
          commands go down, events (console, network, dialogs) come up — no extra hop
        </text>
      </svg>
      <figcaption>
        The whole difference in one picture: Selenium adds a driver process and speaks HTTP one command at a time; Playwright keeps a single open line to the browser. *Selenium 4's Selenium Manager can now download drivers for you, but the driver is still a separate process in the chain.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------
   4. What happens inside a single click(): the auto-wait pipeline
---------------------------------------------------------------- */
export function AutoWaitDiagram() {
  const steps = [
    ['Find element', 'via locator'],
    ['Attached?', 'in the DOM'],
    ['Visible?', 'not hidden / 0px'],
    ['Stable?', 'not animating'],
    ['Enabled?', 'not disabled'],
    ['Not covered?', 'receives events'],
    ['Scroll + click', 'real mouse events'],
  ];
  const w = 96;
  const gap = 12;
  const y = 48;
  const h = 58;

  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 200" role="img" aria-label="Auto-wait pipeline inside a single click: find the element, check it is attached, visible, stable, enabled and receives events, then scroll and dispatch real mouse events; if any check fails, Playwright retries until the timeout.">
        <Defs id="a4" />
        <text x="4" y="24" fontSize="12" fontWeight="700" letterSpacing="0.1em" fill={PW}>
          INSIDE ONE  page.click()
        </text>
        {steps.map(([t, s], i) => {
          const x = 4 + i * (w + gap);
          const last = i === steps.length - 1;
          return (
            <g key={t}>
              <rect x={x} y={y} width={w} height={h} rx="9" fill={last ? PW_SOFT : RAISED} stroke={last ? PW : 'currentColor'} strokeWidth="1.5" />
              <text x={x + w / 2} y={y + 24} fontSize="11.5" fontWeight="700" textAnchor="middle" fill={last ? PW : 'currentColor'}>
                {t}
              </text>
              <text x={x + w / 2} y={y + 42} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.75">
                {s}
              </text>
              {!last && <line x1={x + w + 1} y1={y + h / 2} x2={x + w + gap - 1} y2={y + h / 2} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#a4)" />}
            </g>
          );
        })}
        {/* retry loop from step 6 back to step 1 */}
        <path
          d={`M ${4 + 5 * (w + gap) + w / 2} ${y + h} V 150 H ${4 + w / 2} V ${y + h + 2}`}
          fill="none"
          stroke={SE}
          strokeWidth="1.5"
          strokeDasharray="6 4"
          markerEnd="url(#a4-se)"
        />
        <rect x="200" y="138" width="270" height="26" rx="13" fill={RAISED} stroke={SE} strokeWidth="1.2" />
        <text x="335" y="155" fontSize="11" fontWeight="600" fill={SE} textAnchor="middle">
          any check fails → wait a bit and retry (up to 30 s)
        </text>
        <text x="4" y="190" fontSize="11" fill="currentColor" opacity="0.7">
          You write one line. Playwright runs all of this for you — no sleep(), no explicit wait.
        </text>
      </svg>
      <figcaption>
        The "actionability checks" that run before every click, fill or press. The dashed amber loop is the part you would otherwise write yourself as explicit waits.
      </figcaption>
    </figure>
  );
}
