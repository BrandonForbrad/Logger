function policyPage({ CONTACT_EMAIL, CONTACT_DISCORD }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Timekeeping Policy</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card {
        background:white;
        padding:22px 24px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:720px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      h2 { margin:16px 0 6px; font-size:15px; }
      p, li { font-size:13px; color:#374151; }
      ul { padding-left:18px; }
      p.sub { margin:0 0 10px; font-size:13px; color:#6b7280; }
      a { font-size:12px; color:#2563eb; text-decoration:none; }
      a:hover { text-decoration:underline; }
      code { font-size:12px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div style="margin-bottom:10px; font-size:12px;">
          <a href="/">⬅ Back to logs</a>
        </div>
        <h1>Timekeeping &amp; Work Log Policy</h1>
        <p class="sub">Last updated: ${new Date().toISOString().split("T")[0]}</p>

        <h2>Purpose</h2>
        <p>Daily Logger is used to record work performed, including hours and descriptions of tasks. These logs may be treated as official work records for internal use, including (for example) payroll, performance review, and legal purposes.</p>

        <h2>Your Responsibilities</h2>
        <ul>
          <li>Submit logs that are accurate and honest to the best of your knowledge.</li>
          <li>Review your own logs regularly, including any edits made by an admin.</li>
          <li>Promptly dispute any log or edit you believe is inaccurate.</li>
        </ul>

        <p>If you disagree with a log or edit, you must raise the issue in writing (for example, email or Discord DM):</p>
        <ul>
          <li>Email: <code>${CONTACT_EMAIL}</code></li>
          <li>Discord: <code>${CONTACT_DISCORD}</code></li>
        </ul>

        <h2>Edits &amp; History</h2>
        <ul>
          <li>Admins may correct logs where there are obvious errors, inconsistencies, or rule violations.</li>
          <li>Whenever an admin edits a log, the prior version is stored in the edit history, including the previous hours, date, content, username, the editor's username, and the time of the edit.</li>
          <li>Edited logs are visibly marked as "Edited" and provide a link to review the history.</li>
        </ul>

        <h2>Disputes</h2>
        <p>If you believe a log is wrong or that an edit changed your hours incorrectly, you should:</p>
        <ol>
          <li>Review the edit history for that log.</li>
          <li>Contact us in writing at <code>${CONTACT_EMAIL}</code> or <code>${CONTACT_DISCORD}</code> with:
            <ul>
              <li>The log ID (e.g. #12)</li>
              <li>The date of the log</li>
              <li>What you believe is wrong and what you believe the correct hours/details should be</li>
            </ul>
          </li>
        </ol>

        <p class="sub" style="margin-top:14px;">This page is an internal policy summary and is not formal legal advice. For any legal questions or disputes, the company may consult legal counsel.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  policyPage,
};
