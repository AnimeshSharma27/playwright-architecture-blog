import { useCallback, useState } from 'react';
import { TopBar, Toc, ToTop } from './components/Chrome.jsx';
import { Section, Analogy, CodeBlock, Step, Tick } from './components/Blocks.jsx';
import { PlaywrightStackDiagram, SeleniumFlowDiagram, SideBySideDiagram, AutoWaitDiagram } from './components/Diagrams.jsx';

const SECTIONS = [
  { id: 'why', short: 'Why this matters' },
  { id: 'architecture', short: 'Playwright architecture' },
  { id: 'trace', short: 'One test, step by step' },
  { id: 'autowait', short: 'Inside a single click' },
  { id: 'selenium', short: 'How Selenium works' },
  { id: 'compare', short: 'Side-by-side comparison' },
  { id: 'pick', short: 'Which one to pick' },
  { id: 'takeaways', short: 'Key takeaways' },
];

const CODE = [
  <>
    <span className="kw">import</span> {'{ test, expect }'} <span className="kw">from</span> <span className="str">'@playwright/test'</span>;
  </>,
  '',
  <>
    <span className="fn">test</span>(<span className="str">'user can log in'</span>, <span className="kw">async</span> ({'{ page }'}) =&gt; {'{'}
  </>,
  <>
    {'  '}<span className="kw">await</span> page.<span className="fn">goto</span>(<span className="str">'https://shop.example/login'</span>);
  </>,
  <>
    {'  '}<span className="kw">await</span> page.<span className="fn">getByLabel</span>(<span className="str">'Email'</span>).<span className="fn">fill</span>(<span className="str">'animesh@test.com'</span>);
  </>,
  <>
    {'  '}<span className="kw">await</span> page.<span className="fn">getByRole</span>(<span className="str">'button'</span>, {'{ name: '}<span className="str">'Sign in'</span>{' }'}).<span className="fn">click</span>();
  </>,
  <>
    {'  '}<span className="kw">await</span> <span className="fn">expect</span>(page).<span className="fn">toHaveURL</span>(<span className="str">/dashboard/</span>);
  </>,
  '});',
];

export default function App() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Inside Playwright', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled or clipboard blocked — nothing to do */
    }
  }, []);

  return (
    <>
      <span id="top" className="sr-only">
        Top of page
      </span>
      <TopBar onShare={share} />
      {copied && (
        <div role="status" className="sr-only">
          Link copied
        </div>
      )}

      <div className="page">
        <Toc sections={SECTIONS} />

        <main className="article">
          {/* ------------------------------------------------ HERO */}
          <header className="hero">
            <div className="eyebrow">Test automation · Architecture explained</div>
            <h1>
              Inside <span className="hl">Playwright</span>: how your test actually reaches the browser
            </h1>
            <p className="lede">
              Playwright feels "fast" and "less flaky" than Selenium. That is not marketing — it comes from how the tool is built. This
              article walks through Playwright's architecture in plain language, traces one real test line by line, and puts it side by
              side with Selenium so you can see exactly what changed.
            </p>
            <div className="byline">
              <div className="avatar" aria-hidden="true">
                AS
              </div>
              <div>
                <span className="who">Animesh Sharma</span> · QA Lead &amp; Test Automation
              </div>
              <div>September 2026</div>
            </div>
            <div className="legend" aria-label="Colour legend">
              <span className="chip chip-pw">Green = Playwright</span>
              <span className="chip chip-se">Amber = Selenium</span>
            </div>
          </header>

          {/* ------------------------------------------------ WHY */}
          <Section id="why" kicker="Start here" title="Why the architecture matters (even if you never read the source code)">
            <div className="prose">
              <p>
                Every UI automation tool has the same job: take a line of code you wrote — <code>click the Sign in button</code> — and make
                a real browser do it. The interesting part is <strong>how the message travels</strong> from your code to the browser and
                how the answer comes back. That path decides three things you feel every day: how fast tests run, how often they flake,
                and how much waiting code you have to write yourself.
              </p>
              <Analogy>
                Imagine ordering food in a restaurant. <strong>Selenium</strong> is like writing each request on a slip of paper, handing it to a
                waiter, and waiting for the waiter to walk back with a reply — one slip per request. <strong>Playwright</strong> is like having
                an open phone line straight to the kitchen: you talk, they answer instantly, and they can also call <em>you</em> when
                something happens ("your table is ready!") without you asking.
              </Analogy>
              <p>
                Keep that picture in mind. Everything below is just the detailed version of it.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ ARCHITECTURE */}
          <Section id="architecture" kicker="The big picture" title="Playwright's architecture, layer by layer">
            <div className="prose">
              <p>
                Playwright is built as a stack of seven layers. Your code sits at the top, the web page's buttons and text boxes sit at the
                bottom, and one open connection links the two halves.
              </p>
            </div>

            <PlaywrightStackDiagram />

            <div className="prose">
              <h3>1 · Your test script</h3>
              <p>
                This is the code you write. Playwright offers the same API in TypeScript/JavaScript, Python, Java and .NET, so a team can
                pick the language it already knows.
              </p>

              <h3>2 · Client library + driver</h3>
              <p>
                The client library is the part you <code>import</code>. When you call <code>page.click()</code>, it does not touch the browser
                itself. It packs your call into a tiny JSON message — "method: click, selector: …" — and hands it to the Playwright
                driver, a small Node.js program that knows how to speak to browsers. If you use JavaScript, the driver runs inside the
                same process. If you use Python, Java or .NET, the library quietly starts that Node helper for you and talks to it over
                a pipe. You never see it.
              </p>

              <h3>3 · One connection, kept open, both directions</h3>
              <p>
                This is the heart of the design. The driver opens <strong>a single WebSocket (or pipe) connection</strong> to the browser when
                the test starts and keeps it open until the test ends. Commands go down the line; <strong>events</strong> — a console
                message appeared, a network request finished, a dialog popped up, a page finished loading — come back up the same line,
                the moment they happen. Nothing is polled. There is no "ask again in 500 ms".
              </p>
              <Analogy title="Why an open line beats slips of paper">
                With an open phone line, the kitchen can tell you "the page finished loading" the instant it happens. With paper slips, you
                would have to keep sending "is it loaded yet?" slips — that is what explicit waits and <code>Thread.sleep()</code> really are.
              </Analogy>

              <h3>4 · The browser</h3>
              <p>
                Playwright downloads its own tested builds of <strong>Chromium</strong>, <strong>Firefox</strong> and <strong>WebKit</strong> (the
                engine behind Safari). It speaks to each one in the engine's native automation language: the Chrome DevTools Protocol
                (CDP) for Chromium, a Playwright-maintained protocol called Juggler for Firefox, and WebKit's own remote protocol. Because
                Playwright talks directly to the engine, there is no separate "driver executable" to install or keep in sync with your
                browser version.
              </p>

              <h3>5 · Browser context</h3>
              <p>
                A context is an isolated, throw-away browser profile — its own cookies, storage and cache — created inside an already
                running browser. Opening a fresh context takes milliseconds, while launching a whole new browser takes seconds. Playwright's
                test runner gives <strong>every test its own context</strong>, so tests cannot leak login state into each other.
              </p>
              <Analogy title="Context vs. new browser">
                Launching a new browser for every test is like buying a new notebook for every homework question. A context is just
                turning to a clean page in the notebook you already have.
              </Analogy>

              <h3>6 · Page</h3>
              <p>
                A page is one tab. It owns its own console, network traffic and dialogs, and it is what the <code>page</code> object in your
                test points to.
              </p>

              <h3>7 · Frames and DOM elements</h3>
              <p>
                Finally the real page content: the main frame, any iframes, and the buttons, links and inputs inside them. This is where a
                locator such as <code>getByRole('button', {'{ name: '}'Sign in'{' }'})</code> is finally resolved to an actual element.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ TRACE */}
          <Section id="trace" kicker="Follow the code" title="One real test, traced step by step through the architecture">
            <div className="prose">
              <p>
                Here is a small but complete login test. Below it, every line is traced through the layers you just saw, so you can see
                what Playwright does behind each <code>await</code>.
              </p>
            </div>

            <CodeBlock file="tests/login.spec.ts" lines={CODE} />

            <div className="steps">
              <Step n="0" code="npx playwright test" title="The test runner boots" layer="Layer 1 · your machine">
                The runner reads <code>playwright.config.ts</code>, finds every <code>*.spec.ts</code> file, and starts worker processes — one per
                CPU core by default — so test files run in parallel.
              </Step>

              <Step n="1" code="test('user can log in', async ({ page }) => …" title="A browser, context and page are prepared" layer="Layers 2 → 6">
                Because the test asks for the <code>page</code> fixture, the worker launches a browser once (reused across tests), then
                creates a fresh browser context for this test, and a new page inside it. One open connection to the browser is
                established here and kept for the whole run.
              </Step>

              <Step n="2" code="await page.goto('https://shop.example/login')" title="Navigate and wait for the page to load" layer="Layers 2 → 3 → 6">
                The client packs a <code>goto</code> message and sends it down the connection. The browser navigates, and — because the line is
                two-way — it reports back the moment the <code>load</code> event fires. Only then does the <code>await</code> finish. No
                sleep, no polling.
              </Step>

              <Step n="3" code="page.getByLabel('Email')" title="A locator is created — nothing happens yet" layer="Layer 2 · client only">
                A locator is just a description: "the input whose label says Email". It is <em>not</em> looked up now. That laziness is
                deliberate — the element is searched for at the last possible moment, so a page that is still rendering does not cause a
                "no such element" error.
              </Step>

              <Step n="4" code=".fill('animesh@test.com')" title="Now the element is found, checked and typed into" layer="Layers 3 → 7">
                The <code>fill</code> action resolves the locator inside the page, then runs the actionability checks: is the element attached,
                visible, enabled and editable? If any check fails, Playwright waits and retries until the timeout (30 s by default). Once
                ready it focuses the input, clears it, and inserts the text.
              </Step>

              <Step n="5" code="page.getByRole('button', { name: 'Sign in' }).click()" title="A real click, only when the button is truly clickable" layer="Layers 3 → 7">
                The button is located through the accessibility tree — the same way a screen reader would find it. Then the full checklist
                runs: attached, visible, stable (finished animating), enabled, and "receives events" (not hidden under a cookie banner or
                spinner). Playwright scrolls it into view and sends real mouse-move, mouse-down and mouse-up events through the
                browser protocol — not a fake JavaScript <code>element.click()</code>.
              </Step>

              <Step n="6" code="await expect(page).toHaveURL(/dashboard/)" title="A web-first assertion that keeps checking" layer="Layers 2 ↔ 6">
                <code>expect</code> here is not a one-shot comparison. It re-reads the page's URL over the open connection again and again until
                it matches or 5 s pass. The redirect after login can take a moment; the assertion simply waits for it.
              </Step>

              <Step n="7" code="});" title="Clean-up, trace and report" layer="Layers 5 → 1">
                The context is closed (cookies and storage vanish with it), and any trace, video or screenshot the config asked for is
                saved. The worker moves on to the next test; the browser itself stays warm.
              </Step>
            </div>

            <div className="prose">
              <p>The same trace as a quick reference table:</p>
            </div>
            <div className="table-wrap">
              <table className="trace-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>What Playwright does</th>
                    <th>Plain-language version</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0</td>
                    <td><code>npx playwright test</code></td>
                    <td>Reads config, discovers tests, spawns parallel workers</td>
                    <td>The manager reads the to-do list and calls in the team</td>
                  </tr>
                  <tr>
                    <td>1</td>
                    <td><code>{'{ page }'}</code> fixture</td>
                    <td>Launch browser → new context → new page; open the connection</td>
                    <td>Open the phone line to the kitchen, get a clean table</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td><code>page.goto(url)</code></td>
                    <td>Send navigate command; wait for the browser's load event</td>
                    <td>"Go to the login page" — kitchen calls back when it's there</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td><code>getByLabel('Email')</code></td>
                    <td>Create a lazy locator — no lookup yet</td>
                    <td>Write "the Email box" on a sticky note</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td><code>.fill(text)</code></td>
                    <td>Resolve locator, actionability checks, focus, type</td>
                    <td>Find the box, make sure it's usable, type into it</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td><code>.click()</code></td>
                    <td>Resolve by role, full checks, scroll, real mouse events</td>
                    <td>Find the button, make sure nothing covers it, press it</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td><code>expect(page).toHaveURL()</code></td>
                    <td>Retry the check until it passes or 5 s elapse</td>
                    <td>Keep glancing at the address bar until it says dashboard</td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>test ends</td>
                    <td>Close context, save trace/video, report</td>
                    <td>Clear the table, file the receipt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* ------------------------------------------------ AUTOWAIT */}
          <Section id="autowait" kicker="Zoom in" title="What happens inside a single click()">
            <div className="prose">
              <p>
                Step 5 above deserves its own picture, because it is where most Selenium flakiness lives. Before Playwright performs
                <em> any</em> action it runs a fixed checklist, and it keeps re-running that checklist until every item passes.
              </p>
            </div>

            <AutoWaitDiagram />

            <div className="prose">
              <Analogy title="Auto-wait in one sentence">
                Playwright is the careful friend who checks that the door is actually open, not moving, and not blocked before walking
                through it — and if it isn't, they simply wait a moment and look again.
              </Analogy>
              <p>
                This is why Playwright tests rarely need <code>sleep()</code> or hand-written explicit waits. The waiting is not gone; it has
                moved into the tool, where it is done correctly every time.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ SELENIUM */}
          <Section id="selenium" kicker="The other side" title="How Selenium works, for comparison">
            <div className="prose">
              <p>
                Selenium has been the industry standard since 2004 and its design reflects the browsers of that era. Its architecture has
                one extra piece in the middle and uses a different way of talking.
              </p>
            </div>

            <SeleniumFlowDiagram />

            <div className="prose">
              <p>
                Your script uses a <strong>language binding</strong> (Java, Python, C#, JavaScript, Ruby…). Each command is turned into an{' '}
                <strong>HTTP request</strong> following the W3C WebDriver standard and sent to a <strong>browser driver</strong> — a separate
                program such as <code>chromedriver</code> or <code>geckodriver</code>, made by the browser vendor. The driver translates the
                command into the browser's own automation calls, waits for the result, and sends an HTTP response back. Then your script
                sends the next command.
              </p>
              <p>
                Two consequences follow. First, every command is a full round trip, so a test that does 300 small things pays 300 round
                trips. Second, HTTP is request-and-response only: the browser cannot push a message to your script. If you want to know
                when something has loaded, <em>you</em> must ask — that is what <code>WebDriverWait</code>, implicit waits and{' '}
                <code>Thread.sleep()</code> are for.
              </p>
              <p>
                To be fair, Selenium has moved. Selenium 4 introduced Selenium Manager, which downloads the right driver automatically, and
                is steadily adding <strong>WebDriver BiDi</strong>, a new two-way protocol that closes much of this gap. It also has advantages
                Playwright cannot match: it drives real Safari, connects to real mobile devices through Appium, and has by far the largest
                community and job market.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ COMPARE */}
          <Section id="compare" kicker="Side by side" title="Playwright vs. Selenium — what actually differs">
            <SideBySideDiagram />

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Aspect</th>
                    <th className="col-pw">Playwright</th>
                    <th className="col-se">Selenium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="row-label">How it talks to the browser</td>
                    <td className="cell-pw">One persistent WebSocket/pipe connection, two-way</td>
                    <td className="cell-se">One HTTP request + response per command (W3C WebDriver); BiDi arriving in v4</td>
                  </tr>
                  <tr>
                    <td className="row-label">Pieces in the chain</td>
                    <td className="cell-pw">Script → client/driver → browser</td>
                    <td className="cell-se">Script → binding → driver executable → browser</td>
                  </tr>
                  <tr>
                    <td className="row-label">Browser setup</td>
                    <td className="cell-pw">Browsers downloaded and version-matched by Playwright itself</td>
                    <td className="cell-se">Uses your installed browser; driver fetched by Selenium Manager (v4) or by hand</td>
                  </tr>
                  <tr>
                    <td className="row-label">Waiting</td>
                    <td className="cell-pw">Built-in auto-wait + actionability checks on every action; retrying assertions</td>
                    <td className="cell-se">Implicit/explicit waits written by you (WebDriverWait, ExpectedConditions)</td>
                  </tr>
                  <tr>
                    <td className="row-label">Events from the browser</td>
                    <td className="cell-pw">Pushed instantly: console, network, dialogs, downloads, page load</td>
                    <td className="cell-se">Must be polled; richer events only via CDP/BiDi extras</td>
                  </tr>
                  <tr>
                    <td className="row-label">Test isolation</td>
                    <td className="cell-pw">Cheap browser contexts — one per test, milliseconds to create</td>
                    <td className="cell-se">Usually a new WebDriver session (new browser) per test — seconds to create</td>
                  </tr>
                  <tr>
                    <td className="row-label">Network control</td>
                    <td className="cell-pw">Built in: intercept, mock, modify requests with <code>page.route()</code></td>
                    <td className="cell-se">Not in core WebDriver; needs CDP, BiDi or a proxy tool</td>
                  </tr>
                  <tr>
                    <td className="row-label">Browsers</td>
                    <td className="cell-pw">Chromium, Firefox, WebKit (Safari engine) + Chrome/Edge branded</td>
                    <td className="cell-se">Chrome, Firefox, Edge, real Safari, IE mode, and more</td>
                  </tr>
                  <tr>
                    <td className="row-label">Mobile</td>
                    <td className="cell-pw">Device emulation (viewport, touch, user agent); Android experimental</td>
                    <td className="cell-se">Real devices and native apps via Appium (same WebDriver protocol)</td>
                  </tr>
                  <tr>
                    <td className="row-label">Languages</td>
                    <td className="cell-pw">TypeScript/JavaScript, Python, Java, .NET</td>
                    <td className="cell-se">Java, Python, C#, JavaScript, Ruby, Kotlin (official) + many community bindings</td>
                  </tr>
                  <tr>
                    <td className="row-label">Test runner &amp; tooling</td>
                    <td className="cell-pw">Own runner with parallelism, retries, fixtures, Trace Viewer, Codegen, UI mode</td>
                    <td className="cell-se">Bring your own (JUnit, TestNG, pytest, NUnit…); Grid for distributed runs</td>
                  </tr>
                  <tr>
                    <td className="row-label">Maturity &amp; community</td>
                    <td className="cell-pw">Released 2020 by Microsoft; fast-growing</td>
                    <td className="cell-se">Since 2004; W3C standard; largest ecosystem and hiring pool</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* ------------------------------------------------ PICK */}
          <Section id="pick" kicker="Decision" title="Which one should you pick?">
            <div className="prose">
              <p>
                Architecture explains behaviour, but the right tool still depends on your situation. As a rule of thumb:
              </p>
            </div>
            <div className="pick">
              <div className="pick-card pw">
                <h3>Lean towards Playwright when…</h3>
                <ul>
                  <li>You are starting a new web automation suite today.</li>
                  <li>Flaky tests and hand-written waits are eating your team's time.</li>
                  <li>You need network mocking, tracing or parallel runs without extra tooling.</li>
                  <li>Your team is comfortable with TypeScript/JavaScript, Python, Java or .NET.</li>
                </ul>
              </div>
              <div className="pick-card se">
                <h3>Lean towards Selenium when…</h3>
                <ul>
                  <li>You already have a large, stable Selenium suite and a team that knows it.</li>
                  <li>You must test real Safari, older browsers, or native mobile apps via Appium.</li>
                  <li>You rely on a WebDriver-based cloud grid or vendor integrations.</li>
                  <li>You need Ruby, Kotlin or another binding Playwright does not offer.</li>
                </ul>
              </div>
            </div>
            <div className="prose">
              <p>
                Many teams run both: Selenium for legacy coverage, Playwright for everything new. The good news is that the concepts
                transfer — locators, pages, waits — so learning the second tool is much faster than learning the first.
              </p>
            </div>
          </Section>

          {/* ------------------------------------------------ TAKEAWAYS */}
          <Section id="takeaways" kicker="TL;DR" title="Five things to remember">
            <ul className="takeaways">
              <li>
                <Tick />
                <span>
                  Playwright keeps <strong>one open two-way connection</strong> to the browser; Selenium sends <strong>one HTTP request per
                  command</strong> through a separate driver program.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  Because the browser can <strong>push events</strong> to Playwright, it knows when things happen instead of asking repeatedly —
                  that is where the speed comes from.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  <strong>Locators are lazy</strong> and every action runs <strong>actionability checks</strong> with retries — that is where the
                  reliability comes from.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  <strong>Browser contexts</strong> give each test a clean, isolated profile in milliseconds, so tests run in parallel without
                  stepping on each other.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  Selenium still wins on <strong>breadth</strong>: real Safari, Appium mobile, more languages, and the biggest community. Pick
                  by your context, not by hype.
                </span>
              </li>
            </ul>
          </Section>

          {/* ------------------------------------------------ OUTRO */}
          <div className="outro">
            <h2>Found this useful?</h2>
            <p>
              Share it with a teammate who is deciding between the two tools, or drop your questions in the comments on LinkedIn — I read
              every one. Next up in this series: a deep dive into Playwright's Trace Viewer and how to debug a failing CI run in minutes.
            </p>
            <div className="tags">
              <span className="tag">#Playwright</span>
              <span className="tag">#Selenium</span>
              <span className="tag">#TestAutomation</span>
              <span className="tag">#QA</span>
              <span className="tag">#SoftwareTesting</span>
            </div>
          </div>

          <footer className="footer">
            <span>Written by Animesh Sharma · Pune, India</span>
            <span>Built with React · diagrams are hand-drawn SVG</span>
          </footer>
        </main>
      </div>

      <ToTop />
    </>
  );
}
