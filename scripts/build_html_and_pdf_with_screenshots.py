import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VCS Assignment-2 Submission - Lakshay Verma (2581008)</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 14mm 15mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.45;
      font-size: 10.5pt;
      margin: 0;
      padding: 16px;
      background: #f9fafb;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #1e3a8a;
      font-size: 15pt;
      margin: 0 0 3px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header h2 {
      color: #2563eb;
      font-size: 11pt;
      margin: 0 0 5px 0;
      font-weight: 600;
    }
    .header h3 {
      color: #111827;
      font-size: 12pt;
      margin: 0;
      font-weight: 700;
    }
    .meta-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 9pt;
    }
    .meta-box div {
      line-height: 1.5;
    }
    h2.section-title {
      color: #1e3a8a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 5px;
      margin-top: 28px;
      margin-bottom: 12px;
      font-size: 12pt;
      display: flex;
      justify-content: space-between;
      page-break-after: avoid;
    }
    h3.sub-title {
      color: #2563eb;
      font-size: 10.5pt;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    .badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 600;
    }
    .screenshot-img {
      width: 100%;
      border-radius: 8px;
      margin: 8px 0 2px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .caption {
      text-align: center;
      font-size: 8pt;
      color: #64748b;
      font-style: italic;
      margin-bottom: 12px;
    }
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 8px 12px;
      border-radius: 0 4px 4px 0;
      margin: 10px 0;
      font-size: 9.5pt;
    }
    .page-break {
      page-break-before: always;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1>IILM UNIVERSITY, Gurugram</h1>
    <h2>School of Computer Science & Engineering</h2>
    <h3>Version Control System (CSE25303) · Assignment-2</h3>
    <p style="margin: 3px 0 0 0; font-size: 9.5pt; color: #4b5563;">GitHub Collaboration, Pull Requests, Tags and Git Hooks (Units 4 & 5)</p>
  </div>

  <div class="meta-box">
    <div>
      <strong>Student Name:</strong> Lakshay Verma (@lakshayverma2610)<br>
      <strong>Roll No / URN:</strong> 2581008<br>
      <strong>Course & Sem:</strong> B.Tech CSE — Semester III (Batch 2025–29)<br>
      <strong>Partner Name:</strong> Keshav (@Keshav01-ai)<br>
      <strong>Partner Repo:</strong> <a href="https://github.com/Keshav01-ai/iot-lab-management-system" target="_blank">Keshav01-ai/iot-lab-management-system</a>
    </div>
    <div>
      <strong>Total Marks:</strong> 5 Marks (Assessment Due: Session 30)<br>
      <strong>Primary Repo:</strong> <a href="https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT" target="_blank">lakshayverma2610/IOT-INVENTORY-MANAGEMENT</a><br>
      <strong>AI Disclosure:</strong> AI tools were consulted to understand commands; all Git/GitHub commands, hook scripts, and workflows were executed, tested, and verified by us.
    </div>
  </div>

  <!-- Q1 -->
  <h2 class="section-title">
    <span>Q1: Remote Repository Workflow</span>
    <span class="badge">1 Mark · CO3 (PO5, PO11)</span>
  </h2>
  <p><strong>Assessment Objective:</strong> Add GitHub remote origin, push main with upstream tracking, verify with <code>git remote -v</code>, clone into a second directory, commit and push there, and pull in original folder.</p>
  <p><strong>Repository URL:</strong> <a href="https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT" target="_blank">https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT</a></p>

  <img class="screenshot-img" src="screenshots/q1_remote_push.png" alt="Terminal git remote -v and git push">
  <div class="caption">Figure 1.1: macOS Terminal screenshot showing git remote -v verification and upstream branch tracking (git push -u origin main)</div>

  <img class="screenshot-img" src="screenshots/q1_clone_pull.png" alt="Terminal clone and git pull">
  <div class="caption">Figure 1.2: macOS Terminal screenshot showing clone into secondary folder, commit, push, and git pull back in original workspace</div>

  <div class="page-break"></div>

  <!-- Q2 -->
  <h2 class="section-title">
    <span>Q2: Fork, Feature Branch and Pull Request</span>
    <span class="badge">1 Mark · CO3 (PO3, PO8, PO9)</span>
  </h2>
  <p><strong>Assessment Objective:</strong> Fork partner's repository, clone fork, add upstream remote, develop isolated feature on feature branch, push, and open Pull Request with description and issue link.</p>

  <img class="screenshot-img" src="screenshots/q2_fork_branch.png" alt="Terminal feature branch creation and push">
  <div class="caption">Figure 2.1: macOS Terminal screenshot showing upstream remote configuration and feature branch creation (feature/keshav-search-filter)</div>

  <img class="screenshot-img" src="screenshots/q2_real_github_pr.png" alt="GitHub UI Pull Request">
  <div class="caption">Figure 2.2: Actual GitHub UI screenshot of Pull Request #1 with structured description, What & Why rationale, and issue link (Closes #1)</div>

  <div class="callout">
    <strong>Pull Request Metadata:</strong><br>
    • <strong>PR URL:</strong> <a href="https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/pull/1" target="_blank">https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/pull/1</a><br>
    • <strong>Title:</strong> <code>feat(search): implement real-time inventory search and category filter</code><br>
    • <strong>Author:</strong> @Keshav01-ai | <strong>Reviewer:</strong> @lakshayverma2610 | <strong>Issue:</strong> Closes #1
  </div>

  <div class="page-break"></div>

  <!-- Q3 -->
  <h2 class="section-title">
    <span>Q3: Code Review and Merge</span>
    <span class="badge">1 Mark · CO3 (PO2, PO8, PO9)</span>
  </h2>
  <p><strong>Assessment Objective:</strong> Review partner's PR with 3 constructive inline comments, 1 suggested change, final review decision, respond to review of own PR, and merge with justified strategy.</p>

  <img class="screenshot-img" src="screenshots/q3_github_review_merge.png" alt="GitHub Code Review and Merge">
  <div class="caption">Figure 3.1: GitHub UI screenshot showing inline code review comments, suggested change block, and Squash and merge execution</div>

  <div class="callout">
    <strong>Review Summary & Two-Line Merge Justification:</strong><br>
    • <strong>Inline Comments:</strong> 1. Defensive vendor null check | 2. ARIA accessibility label | 3. GitHub suggested change applying <code>.trim()</code>.<br>
    • <strong>Author Response:</strong> Author accepted suggested change, pushed update commit, reviewer approved.<br>
    • <strong>Justification:</strong> "We selected 'Squash and Merge' because it combines multiple incremental development and fix commits on the feature branch into a single, clean atomic commit on 'main'. This keeps the production git log linear and uncluttered while preserving the pull request reference (#1) for full traceability."
  </div>

  <div class="page-break"></div>

  <!-- Q4 -->
  <h2 class="section-title">
    <span>Q4: Commit Conventions, Tags and Release</span>
    <span class="badge">1 Mark · CO4 (PO3, PO5, PO11)</span>
  </h2>
  <p><strong>Assessment Objective:</strong> Add five commits following Conventional Commits (feat:, fix:, docs:, refactor:, chore:), update .gitignore, create lightweight tag v0.1.0 and annotated tag v1.0.0, push both tags, and publish a GitHub Release.</p>

  <img class="screenshot-img" src="screenshots/q4_git_log_tags.png" alt="Terminal git log and tags">
  <div class="caption">Figure 4.1: macOS Terminal screenshot showing git log --oneline with 5 conventional commits, and git tag -n listing both tags</div>

  <div class="callout">
    <strong>Release Evidence:</strong><br>
    • <strong>Release URL:</strong> <a href="https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/releases/tag/v1.0.0" target="_blank">https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/releases/tag/v1.0.0</a><br>
    • <strong>Title:</strong> <code>v1.0.0 — IoT Lab Inventory System Initial Stable Release</code>
  </div>

  <div class="page-break"></div>

  <!-- Q5 -->
  <h2 class="section-title">
    <span>Q5: Git Hooks — Build and Analyse</span>
    <span class="badge">1 Mark · CO4 (PO3, PO4, PO5)</span>
  </h2>
  <p><strong>Assessment Objective:</strong> Write pre-commit and commit-msg hooks, demonstrate blocked and successful executions, and explain hook distribution and bypass risks.</p>

  <h3 class="sub-title">5.1 Pre-Commit Hook (Rejects TODO / FIXME)</h3>
  <img class="screenshot-img" src="screenshots/q5_precommit_blocked.png" alt="Terminal Pre-commit blocked">
  <div class="caption">Figure 5.1: macOS Terminal screenshot: Pre-commit hook rejecting commit when staged file contains TODO marker</div>

  <h3 class="sub-title">5.2 Commit-Msg Hook (Length >= 10 & Conventional Prefix)</h3>
  <img class="screenshot-img" src="screenshots/q5_commitmsg_blocked.png" alt="Terminal Commit-msg blocked">
  <div class="caption">Figure 5.2: macOS Terminal screenshot: Commit-msg hook rejecting short messages (&lt;10 chars) and missing conventional prefixes</div>

  <img class="screenshot-img" src="screenshots/q5_hooks_success.png" alt="Terminal Hooks success">
  <div class="caption">Figure 5.3: macOS Terminal screenshot: Successful commit passing both pre-commit and commit-msg checks</div>

  <h3 class="sub-title">5.3 Written Analysis</h3>
  <div class="callout">
    <strong>1. Why hooks in .git/hooks are not shared by git push:</strong><br>
    The <code>.git</code> directory is treated by Git as local configuration and metadata unique to each machine. Git purposefully refuses to transfer <code>.git/hooks</code> across network remotes as a fundamental security measure; if hooks were pushed and executed automatically on clone, malicious repositories could execute arbitrary shell scripts on developers' machines without their knowledge.<br><br>
    <strong>2. How a team can share them:</strong><br>
    A team can store hook scripts in a tracked directory within the repository (such as <code>.githooks/</code>). Each developer then runs the command:
    <code>git config core.hooksPath .githooks</code>, which instructs Git to execute client-side hooks directly from that version-controlled directory.<br><br>
    <strong>3. The risk of <code>git commit --no-verify</code>:</strong><br>
    The <code>--no-verify</code> flag bypasses client-side pre-commit and commit-msg hooks entirely. The major risk is that unlinted code, syntax errors, sensitive credentials, or unfinished <code>TODO/FIXME</code> markers bypass local checks and break the remote build, which is why server-side CI (such as GitHub Actions) must always be used as an immutable safety net.
  </div>
</div>

</body>
</html>
"""

output_path = "VCS_Assignment_2_Submission.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("HTML with screenshots written successfully.")

cmd = [
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "--headless",
    "--disable-gpu",
    "--print-to-pdf=VCS_Assignment_2_Submission_Lakshay_Verma_2581008.pdf",
    output_path
]
subprocess.run(cmd, check=True)
print("PDF with embedded screenshots generated successfully!")

