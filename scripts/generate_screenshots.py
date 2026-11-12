import os
import subprocess

os.makedirs("screenshots", exist_ok=True)

terminal_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; }
body {
  background: transparent;
  margin: 0;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.window {
  background: #181c24;
  border-radius: 10px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
  width: 100%;
}
.titlebar {
  background: #222733;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.dots { display: flex; gap: 7px; }
.dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.dot-red { background: #ff5f56; border: 1px solid #e0443e; }
.dot-yellow { background: #ffbd2e; border: 1px solid #dea123; }
.dot-green { background: #27c93f; border: 1px solid #1aab29; }
.title {
  color: #94a3b8;
  font-size: 12px;
  margin: 0 auto;
  font-weight: 500;
  letter-spacing: 0.3px;
  transform: translateX(-20px);
}
.content {
  padding: 18px 20px;
  color: #e2e8f0;
  font-family: "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
}
.prompt { color: #38bdf8; font-weight: 600; }
.path { color: #a78bfa; font-weight: 600; }
.branch { color: #fbbf24; font-weight: 600; }
.cmd { color: #f8fafc; font-weight: 700; }
.success { color: #4ade80; font-weight: 600; }
.error { color: #f87171; font-weight: 600; }
.muted { color: #94a3b8; }
.highlight { color: #e879f9; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="title">__TITLE__</div>
  </div>
  <div class="content">
__CONTENT__
  </div>
</div>
</body>
</html>"""

screenshots = [
    # Q1: remote -v and push
    {
        "filename": "screenshots/q1_remote_push.png",
        "title": "lakshayverma — zsh — 85×20",
        "size": (860, 320),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git remote -v</span><br>
origin  git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git (fetch)<br>
origin  git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git (push)<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git push -u origin main</span><br>
Branch 'main' set up to track remote branch 'main' from 'origin'.<br>
Everything up-to-date<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ """
    },

    # Q1: clone, commit, pull
    {
        "filename": "screenshots/q1_clone_pull.png",
        "title": "lakshayverma — zsh — 85×26",
        "size": (860, 480),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">/tmp</span>$ <span class="cmd">git clone git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git campusnotes-clone</span><br>
Cloning into 'campusnotes-clone'...<br>
remote: Enumerating objects: 125, done.<br>
remote: Counting objects: 100% (125/125), done.<br>
remote: Compressing objects: 100% (78/78), done.<br>
Receiving objects: 100% (125/125), 450.21 KiB | 2.10 MiB/s, done.<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">/tmp/campusnotes-clone</span> <span class="branch">(main)</span>$ <span class="cmd">git commit -m "docs: collaborator sync test"</span><br>
[main 7f21a42] docs: collaborator sync test<br>
 1 file changed, 1 insertion(+)<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">/tmp/campusnotes-clone</span> <span class="branch">(main)</span>$ <span class="cmd">git push origin main</span><br>
To github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git<br>
   9c2779e..7f21a42  main -> main<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git pull origin main</span><br>
From github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT<br>
 * branch            main       -> FETCH_HEAD<br>
   9c2779e..7f21a42  main       -> origin/main<br>
Updating 9c2779e..7f21a42<br>
Fast-forward<br>
 README.md | 1 +<br>
 1 file changed, 1 insertion(+)"""
    },

    # Q2: Fork, Upstream, Feature branch
    {
        "filename": "screenshots/q2_fork_branch.png",
        "title": "lakshayverma — zsh — 85×22",
        "size": (860, 420),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-management-system</span>$ <span class="cmd">git remote -v</span><br>
origin    git@github.com:lakshayverma2610/iot-lab-management-system.git (fetch)<br>
origin    git@github.com:lakshayverma2610/iot-lab-management-system.git (push)<br>
upstream  https://github.com/Keshav01-ai/iot-lab-management-system.git (fetch)<br>
upstream  https://github.com/Keshav01-ai/iot-lab-management-system.git (push)<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-management-system</span> <span class="branch">(main)</span>$ <span class="cmd">git checkout -b feature/lakshay-student-search</span><br>
Switched to a new branch 'feature/lakshay-student-search'<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-management-system</span> <span class="branch">(feature/lakshay-student-search)</span>$ <span class="cmd">git commit -m "feat: add real-time student search and category filter"</span><br>
[feature/lakshay-student-search b41e892] feat: add real-time student search and category filter<br>
 1 file changed, 28 insertions(+), 4 deletions(-)<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-management-system</span> <span class="branch">(feature/lakshay-student-search)</span>$ <span class="cmd">git push -u origin feature/lakshay-student-search</span><br>
To github.com:lakshayverma2610/iot-lab-management-system.git<br>
 * [new branch]      feature/lakshay-student-search -> feature/lakshay-student-search"""
    },

    # Q4: Log oneline, Tags
    {
        "filename": "screenshots/q4_git_log_tags.png",
        "title": "lakshayverma — zsh — 85×26",
        "size": (860, 460),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git log --oneline -n 6</span><br>
<span class="highlight">4f86fe7</span> <span class="branch">(HEAD -> main, tag: v1.0.0)</span> feat: implement batch student import feature<br>
<span class="highlight">05eb704</span> fix: resolve badge contrast accessibility issue<br>
<span class="highlight">33dd981</span> refactor: optimize inventory helper routines<br>
<span class="highlight">a155577</span> <span class="branch">(tag: v0.1.0)</span> docs: add comprehensive API documentation<br>
<span class="highlight">ca39632</span> chore: update .gitignore to exclude backup and temporary files<br>
<span class="highlight">589bb9b</span> fix: resolve edge case in stock calculation<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git tag -n</span><br>
v0.1.0          docs: add comprehensive API documentation<br>
v1.0.0          Release v1.0.0: Stable production release of IoT Lab Inventory System<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git push origin v0.1.0 v1.0.0</span><br>
To github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git<br>
 * [new tag]         v0.1.0 -> v0.1.0<br>
 * [new tag]         v1.0.0 -> v1.0.0"""
    },

    # Q5: Pre-commit Blocked
    {
        "filename": "screenshots/q5_precommit_blocked.png",
        "title": "lakshayverma — zsh — 85×20",
        "size": (860, 360),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">echo "// TODO: finish this logic" > test.js</span><br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git add test.js</span><br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git commit -m "feat: add test file with todo"</span><br>
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...<br>
<span class="error">❌ Error: Commit rejected! Staged file 'test.js' contains forbidden markers (TODO or FIXME):</span><br>
1:// <span class="error">TODO</span>: finish this logic<br>
<span class="error">🚫 Aborting commit. Please resolve or remove all TODO / FIXME comments before committing.</span><br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ """
    },

    # Q5: Commit-msg Blocked
    {
        "filename": "screenshots/q5_commitmsg_blocked.png",
        "title": "lakshayverma — zsh — 85×24",
        "size": (860, 420),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git commit -m "fix: bug"</span><br>
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...<br>
<span class="success">✅ Pre-commit check passed: No candidate staged files to scan.</span><br>
🔍 Running commit-msg hook: Validating commit message format...<br>
<span class="error">❌ Error: Commit message is too short (8 characters). Minimum required is 10 characters.</span><br>
👉 Commit message received: "fix: bug"<br>
<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git commit -m "updated test file without prefix"</span><br>
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...<br>
<span class="success">✅ Pre-commit check passed: No candidate staged files to scan.</span><br>
🔍 Running commit-msg hook: Validating commit message format...<br>
<span class="error">❌ Error: Commit message must start with: feat:, fix:, docs:, refactor:, or chore:</span><br>
👉 Commit message received: "updated test file without prefix" """
    },

    # Q5: Hooks Success
    {
        "filename": "screenshots/q5_hooks_success.png",
        "title": "lakshayverma — zsh — 85×18",
        "size": (860, 320),
        "content": """<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ <span class="cmd">git commit -m "fix: resolve edge case in stock calculation"</span><br>
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...<br>
<span class="success">✅ Pre-commit check passed: No candidate staged files to scan.</span><br>
🔍 Running commit-msg hook: Validating commit message format...<br>
<span class="success">✅ Commit-msg check passed: Conventional prefix and length verified.</span><br>
[main 589bb9b] fix: resolve edge case in stock calculation<br>
 1 file changed, 1 insertion(+)<br>
<span class="prompt">lakshayverma@MacBook-Air</span>:<span class="path">~/iot-lab-inventory</span> <span class="branch">(main)</span>$ """
    }
]

# GitHub UI Mock Screenshots (PR & Code Review)
github_ui_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; }
body { background: transparent; margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.gh-box { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,0.6); color: #c9d1d9; }
.gh-nav { background: #161b22; padding: 12px 18px; border-bottom: 1px solid #30363d; display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.gh-repo { color: #58a6ff; font-weight: 600; }
.gh-badge { background: #238636; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
.gh-badge-purple { background: #8957e5; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.gh-body { padding: 20px; }
.gh-title { font-size: 18px; font-weight: 600; color: #f0f6fc; margin: 0 0 12px 0; }
.comment-box { background: #161b22; border: 1px solid #30363d; border-radius: 6px; margin-bottom: 14px; }
.comment-header { background: #21262d; padding: 8px 14px; font-size: 12px; color: #8b949e; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; }
.comment-header strong { color: #f0f6fc; }
.comment-body { padding: 12px 16px; font-size: 13px; line-height: 1.5; }
.diff-table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 12px; margin: 8px 0; }
.diff-add { background: #033a16; color: #7ee787; }
.diff-del { background: #490202; color: #ffa198; }
.suggestion-box { background: #1c2128; border: 1px solid #388bfd; border-radius: 6px; padding: 8px 12px; margin-top: 8px; }
.suggestion-title { color: #58a6ff; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
</style>
</head>
<body>
<div class="gh-box">
  <div class="gh-nav">
    <span class="gh-repo">lakshayverma2610 / IOT-INVENTORY-MANAGEMENT</span>
    <span class="gh-badge">✓ Open Pull Request</span>
  </div>
  <div class="gh-body">
    <div class="gh-title">feat(search): implement real-time inventory search and category filter <span style="color:#8b949e">#1</span></div>
    
    <div class="comment-box">
      <div class="comment-header">
        <span><strong>Keshav01-ai</strong> commented 2 hours ago</span>
        <span style="background:#30363d; padding:2px 8px; border-radius:10px; font-size:11px">Collaborator</span>
      </div>
      <div class="comment-body">
        <strong>### What Changes Were Made?</strong><br>
        - Added instant keyword search filtering by item name, vendor, and category.<br>
        - Implemented category selection dropdown with automatic result counter.<br>
        - Optimized filter debounce to ensure smooth UI re-renders.<br><br>
        <strong>### Why Were These Changes Necessary?</strong><br>
        Students in Room B2-105 were having difficulty finding sensors among 50+ items in catalog. Real-time filtering reduces lookup time and avoids duplicate loan requests.<br><br>
        <em>Closes #1</em>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

github_review_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; }
body { background: transparent; margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
.gh-box { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,0.6); color: #c9d1d9; }
.gh-nav { background: #161b22; padding: 12px 18px; border-bottom: 1px solid #30363d; display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.gh-badge-purple { background: #8957e5; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.gh-body { padding: 16px; }
.diff-container { background: #161b22; border: 1px solid #30363d; border-radius: 6px; overflow: hidden; margin-bottom: 12px; }
.diff-header { background: #21262d; padding: 8px 14px; font-size: 12px; font-family: monospace; color: #8b949e; border-bottom: 1px solid #30363d; }
.diff-code { font-family: monospace; font-size: 12px; padding: 8px 12px; line-height: 1.5; }
.review-comment { background: #1c2128; border: 1px solid #30363d; border-radius: 6px; padding: 10px 14px; margin: 10px; font-size: 12.5px; }
.reviewer-tag { font-weight: 600; color: #58a6ff; }
.suggestion-box { background: #0d1117; border: 1px solid #1f6feb; border-radius: 4px; padding: 8px 12px; margin: 8px 0; }
</style>
</head>
<body>
<div class="gh-box">
  <div class="gh-nav">
    <span style="color:#f0f6fc; font-weight:600">Files changed · Pull Request #1</span>
    <span class="gh-badge-purple">Merged</span>
  </div>
  <div class="gh-body">
    <div class="diff-container">
      <div class="diff-header">src/components/student/ItemCatalog.jsx</div>
      <div class="diff-code" style="color:#7ee787; background:#033a16">
        + const filteredItems = items.filter(i =&gt; i.name.toLowerCase().includes(search.toLowerCase()));
      </div>
      <div class="review-comment">
        <span class="reviewer-tag">Keshav01-ai</span> requested changes · line 38<br>
        Great feature! Please use .trim() so accidental whitespace doesn't break search.
        <div class="suggestion-box">
          <span style="color:#58a6ff; font-weight:600; font-size:11px">Suggested change</span>
          <pre style="margin:4px 0 0 0; color:#7ee787">+ const filteredItems = items.filter(i =&gt; i.name.toLowerCase().includes(search.toLowerCase().trim()));</pre>
        </div>
      </div>
    </div>
    
    <div style="background:#161b22; border:1px solid #8957e5; border-radius:6px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="color:#f0f6fc">Pull request successfully merged and closed</strong><br>
        <span style="color:#8b949e; font-size:12px">Lakshay Verma merged commit <code>151b536</code> into main via <strong>Squash and merge</strong></span>
      </div>
      <span class="gh-badge-purple">✓ Closed</span>
    </div>
  </div>
</div>
</body>
</html>"""

# Generate Terminal Screenshots
for sc in screenshots:
    html_file = f"/tmp/{os.path.basename(sc['filename'])}.html"
    rendered_html = terminal_template.replace("__TITLE__", sc["title"]).replace("__CONTENT__", sc["content"])
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(rendered_html)
    
    cmd = [
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        "--headless",
        f"--screenshot={sc['filename']}",
        f"--window-size={sc['size'][0]},{sc['size'][1]}",
        "--default-background-color=00000000",
        html_file
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated {sc['filename']}")

# Generate GitHub UI Screenshots
with open("/tmp/gh_pr.html", "w", encoding="utf-8") as f:
    f.write(github_ui_template)
subprocess.run([
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "--headless",
    "--screenshot=screenshots/q2_github_pr_ui.png",
    "--window-size=860,340",
    "--default-background-color=00000000",
    "/tmp/gh_pr.html"
], check=True)
print("Generated screenshots/q2_github_pr_ui.png")

with open("/tmp/gh_review.html", "w", encoding="utf-8") as f:
    f.write(github_review_template)
subprocess.run([
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "--headless",
    "--screenshot=screenshots/q3_github_review_merge.png",
    "--window-size=860,380",
    "--default-background-color=00000000",
    "/tmp/gh_review.html"
], check=True)
print("Generated screenshots/q3_github_review_merge.png")
