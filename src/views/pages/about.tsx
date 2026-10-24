import type { FC } from 'hono/jsx'
import { CodeText } from '../components/code-text.js'

export const AboutPage: FC = () => (
  <article class="container page prose">
    <header class="page-head">
      <h1 class="page-title">How codes are verified</h1>
      <p class="page-sub">
        A wrong USSD code that moves money is worse than a missing one. These are the rules.
      </p>
    </header>

    <section>
      <h2>Two levels of trust</h2>
      <p>
        <strong>Official source</strong> means the regulator or operator publishes the code, for
        example the NCC's harmonised short codes or NIBSS for BVN services.
      </p>
      <p>
        <strong>Corroborated</strong> means at least two independent sources agree. Banks rarely
        publish a machine-readable list, so most bank menus sit here.
      </p>
      <p>
        “Checked” means a person cross-checked the entry against its listed sources on that date. It
        does not mean the code was dialed. Anything unchecked for 90 days is flagged on the page.
      </p>
    </section>

    <section id="left-out">
      <h2>What we left out, and why</h2>
      <p>When sources contradict each other, publishing a guess would be the wrong call.</p>
      <ul>
        <li>
          <strong>Kuda.</strong> Guides disagree: some say Kuda has no USSD, others list{' '}
          <CodeText code="*5573#" /> or <CodeText code="*546#" />. We wait for Kuda to confirm.
        </li>
        <li>
          <strong>Heritage Bank.</strong> Sources list <CodeText code="*030#" />,{' '}
          <CodeText code="*322#" /> and a combined form.
        </li>
        <li>
          <strong>Bank transfer shortcuts.</strong> The menu numbers inside each bank's USSD flow
          differ between sources, so we publish the main menu and only the shortcuts two sources
          agree on.
        </li>
        <li>
          <strong>Carbon, FairMoney, TAJBank, Lotus, Globus, Nomba.</strong> Only one source each,
          or sources that conflict.
        </li>
        <li>
          <strong>Network-specific NIN linking codes</strong> from 2021. The harmonised{' '}
          <CodeText code="*996#" /> replaces them.
        </li>
      </ul>
    </section>

    <section>
      <h2>Stay safe</h2>
      <ul>
        <li>Never share your PIN, OTP, card number or BVN with a caller, even a “bank agent”.</li>
        <li>
          Do not dial a code a stranger sends you. Codes starting with <code>*21*</code> or{' '}
          <code>**21*</code> set up call forwarding to another number.
        </li>
        <li>This site never asks for a PIN. If a page does, close it.</li>
        <li>Dial from the phone number registered to your account, or the bank will refuse it.</li>
      </ul>
    </section>

    <section id="contribute">
      <h2>Contribute a code</h2>
      <p>
        Every entry lives in <code>src/data/providers.ts</code>. Add or fix one, include at least
        one https source, and open a pull request. CI runs the schema check and rejects entries
        without a source, with a malformed code, or with duplicates.
      </p>
    </section>

    <section>
      <h2>Fees and disclaimers</h2>
      <p>
        Your network may charge a session fee for USSD, and your bank may charge for transfers.
        NIBSS charges ₦20 per <CodeText code="*565#" /> request. This project is independent and is
        not affiliated with any bank, network or regulator.
      </p>
    </section>
  </article>
)
