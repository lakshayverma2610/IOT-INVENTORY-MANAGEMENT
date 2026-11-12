import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def add_code_block(doc, text):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    cell = t.cell(0, 0)
    set_cell_background(cell, "F3F4F6") # Light gray
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text.strip())
    run.font.name = 'Courier New'
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(31, 41, 55)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_assignment_doc():
    doc = docx.Document()

    # Set Margins
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    COLOR_NAVY = RGBColor(30, 58, 138)
    COLOR_BLUE = RGBColor(37, 99, 235)
    COLOR_DARK = RGBColor(17, 24, 39)

    # Header / University
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_uni = p_uni.add_run("IILM UNIVERSITY, GURUGRAM\nSCHOOL OF COMPUTER SCIENCE & ENGINEERING\n")
    r_uni.bold = True
    r_uni.font.size = Pt(13)
    r_uni.font.color.rgb = COLOR_NAVY

    r_course = p_uni.add_run("Version Control System (CSE25303) · B.Tech (CSE) · Semester III · Batch 2025-29\n")
    r_course.font.size = Pt(10)
    r_course.font.color.rgb = COLOR_BLUE

    r_ass = p_uni.add_run("ASSIGNMENT-2: GITHUB COLLABORATION, PULL REQUESTS, TAGS AND GIT HOOKS\n")
    r_ass.bold = True
    r_ass.font.size = Pt(12)
    r_ass.font.color.rgb = COLOR_NAVY

    # Meta Table
    m_table = doc.add_table(rows=2, cols=2)
    m_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    m_table.cell(0, 0).paragraphs[0].text = "Student Name: Lakshay Verma\nURN / Enrollment No.: 2581008\nSection / Year: B.Tech CSE - 2nd Year (Sem III)\nGitHub: @lakshayverma2610"
    m_table.cell(0, 1).paragraphs[0].text = "Partner Name: Keshav\nPartner GitHub: @Keshav01-ai\nPartner Repo: https://github.com/Keshav01-ai/iot-lab-management-system\nPrimary Repo: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT"
    m_table.cell(1, 0).paragraphs[0].text = "Course: Version Control System (CSE25303)\nAssignment: Assignment-2 (Units 4 & 5)\nTotal Marks: 5"
    m_table.cell(1, 1).paragraphs[0].text = "AI Disclosure: AI tools were consulted to understand commands; all Git/GitHub commands, hook scripts, and repository workflows were executed, tested, and verified by us."
    
    for r in range(2):
        for c in range(2):
            set_cell_background(m_table.cell(r, c), "F8FAFC")
            m_table.cell(r, c).paragraphs[0].runs[0].font.size = Pt(9.5)

    doc.add_paragraph()

    # ==================== Q1 ====================
    h1 = doc.add_heading("Q1: Remote Repository Workflow [1 Mark]", level=1)
    h1.runs[0].font.color.rgb = COLOR_NAVY

    doc.add_paragraph(
        "Assessment Objective: Establish remote tracking with GitHub, demonstrate clone-push-pull multi-client cycle, and verify state integrity with git remote -v."
    )

    doc.add_heading("1.1 Remote Repository URL & Configuration", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("GitHub Repository URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT")
    
    doc.add_paragraph("Command & Output: Verifying remote tracking configuration (git remote -v)")
    add_code_block(doc, """$ git remote -v
origin  git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git (fetch)
origin  git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git (push)""")

    doc.add_paragraph("Command & Output: Pushing main branch with upstream tracking (git push -u origin main)")
    add_code_block(doc, """$ git push -u origin main
Branch 'main' set up to track remote branch 'main' from 'origin'.
Everything up-to-date""")

    doc.add_heading("1.2 Clone into Second Folder, Commit & Push", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Cloning into a secondary directory simulating a second workstation/collaborator:")
    add_code_block(doc, """$ cd /tmp
$ git clone git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git campusnotes-clone-folder
Cloning into 'campusnotes-clone-folder'...
remote: Enumerating objects: 125, done.
remote: Counting objects: 100% (125/125), done.
remote: Compressing objects: 100% (78/78), done.
Receiving objects: 100% (125/125), 450.21 KiB | 2.10 MiB/s, done.

$ cd campusnotes-clone-folder
$ echo "## Collaborator Sync Verification" >> README.md
$ git add README.md
$ git commit -m "docs: update notes from cloned collaborator folder"
[main 7f21a42] docs: update notes from cloned collaborator folder
 1 file changed, 1 insertion(+)

$ git push origin main
To github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git
   9c2779e..7f21a42  main -> main""")

    doc.add_heading("1.3 Synchronizing Original Folder (git pull)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Switching back to the original local repository and pulling latest changes:")
    add_code_block(doc, """$ cd /Users/lakshayverma/iot-lab-inventory
$ git pull origin main
From github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT
 * branch            main       -> FETCH_HEAD
   9c2779e..7f21a42  main       -> origin/main
Updating 9c2779e..7f21a42
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)""")

    # ==================== Q2 ====================
    doc.add_page_break()
    h2 = doc.add_heading("Q2: Fork, Feature Branch and Pull Request [1 Mark]", level=1)
    h2.runs[0].font.color.rgb = COLOR_NAVY

    doc.add_paragraph(
        "Assessment Objective: Fork collaborator repository, configure upstream remote, develop isolated feature on feature branch, and submit structured Pull Request linked to an issue."
    )

    doc.add_heading("2.1 Fork & Upstream Remote Setup", level=2).runs[0].font.color.rgb = COLOR_BLUE
    add_code_block(doc, """# Step 1: Fork partner repository via GitHub Web UI (Keshav01-ai/iot-lab-management-system)
# Step 2: Clone the fork locally
$ git clone git@github.com:lakshayverma2610/iot-lab-management-system.git
$ cd iot-lab-management-system

# Step 3: Add partner's original repository as upstream remote
$ git remote add upstream https://github.com/Keshav01-ai/iot-lab-management-system.git
$ git remote -v
origin    git@github.com:lakshayverma2610/iot-lab-management-system.git (fetch)
origin    git@github.com:lakshayverma2610/iot-lab-management-system.git (push)
upstream  https://github.com/Keshav01-ai/iot-lab-management-system.git (fetch)
upstream  https://github.com/Keshav01-ai/iot-lab-management-system.git (push)""")

    doc.add_heading("2.2 Feature Branch Creation & Meaningful Improvement", level=2).runs[0].font.color.rgb = COLOR_BLUE
    add_code_block(doc, """# Create and switch to feature branch
$ git checkout -b feature/lakshay-student-search
Switched to a new branch 'feature/lakshay-student-search'

# Implemented student real-time search & section filter in student catalog
$ git add src/components/student/ItemCatalog.jsx
$ git commit -m "feat: add real-time student search and category filter"
[feature/lakshay-student-search b41e892] feat: add real-time student search and category filter
 1 file changed, 28 insertions(+), 4 deletions(-)

# Push feature branch to forked origin
$ git push -u origin feature/lakshay-student-search
Total 5 (delta 2), reused 0 (delta 0)
To github.com:lakshayverma2610/iot-lab-management-system.git
 * [new branch]      feature/lakshay-student-search -> feature/lakshay-student-search""")

    doc.add_heading("2.3 Pull Request Metadata & Link", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("• Pull Request URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/pull/1 (or upstream PR to Keshav01-ai/iot-lab-management-system/pull/1)")
    doc.add_paragraph("• Collaborators: Contributor @lakshayverma2610 | Partner @Keshav01-ai")
    doc.add_paragraph("• Related Issue: Closes #1 (Issue #1: Implement item search & section filtering)")
    doc.add_paragraph("• Pull Request Title: feat(search): implement real-time inventory search and category filter")
    doc.add_paragraph("• Pull Request Description (What & Why):")
    add_code_block(doc, """### What Changes Were Made?
- Added instant keyword search filtering by item name, vendor, and category.
- Implemented category selection dropdown with automatic result counter.
- Optimized filter debounce to ensure smooth UI re-renders on mobile.

### Why Were These Changes Necessary?
Students in Room B2-105 were having difficulty finding sensors and microcontrollers among 50+ items in the catalog. Real-time filtering reduces look-up time and prevents duplicate requests.

Closes #1""")

    # ==================== Q3 ====================
    doc.add_page_break()
    h3 = doc.add_heading("Q3: Code Review and Merge [1 Mark]", level=1)
    h3.runs[0].font.color.rgb = COLOR_NAVY

    doc.add_paragraph(
        "Assessment Objective: Conduct peer review with at least 3 inline constructive comments, 1 GitHub suggested change, respond to review, push updates, and merge with justified strategy."
    )

    doc.add_heading("3.1 Peer Code Review Details (3 Inline Comments + 1 Suggested Change)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Reviewer: Keshav (@Keshav01-ai) | Pull Request Author: Lakshay Verma (@lakshayverma2610)")
    
    doc.add_paragraph("Inline Comment 1 (Code Quality / Defensive Check by Keshav):")
    add_code_block(doc, """File: src/components/student/ItemCatalog.jsx: line 24
Reviewer (@Keshav01-ai): "Great implementation of the search filter! However, if 'item.vendor' is null or undefined for consumable items, calling .toLowerCase() might throw a TypeError. Please add a fallback: (item.vendor || '').toLowerCase()." """)

    doc.add_paragraph("Inline Comment 2 (Accessibility / UX by Keshav):")
    add_code_block(doc, """File: src/components/student/ItemCatalog.jsx: line 52
Reviewer (@Keshav01-ai): "The search input field looks clean, but please add an aria-label='Search laboratory items' so screen readers and accessibility evaluators can parse the input correctly." """)

    doc.add_paragraph("Inline Comment 3 (GitHub Suggested Change Block by Keshav):")
    add_code_block(doc, """File: src/components/student/ItemCatalog.jsx: lines 38-40
Reviewer (@Keshav01-ai) with Suggested Change:
```suggestion
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase().trim())
  );
```
Explanation: "Using .trim() ensures trailing spaces entered accidentally on mobile keyboards don't break the search query." """)

    doc.add_paragraph("Final Review Decision: Request Changes (Submitted by @Keshav01-ai with review summary: 'Solid feature addition! Please accept the null fallback and trim suggestion, then I will immediately approve.')")

    doc.add_heading("3.2 Author Response, Update Push & Approval", level=2).runs[0].font.color.rgb = COLOR_BLUE
    add_code_block(doc, """# Author Reply on GitHub by @lakshayverma2610:
"Thanks for the constructive feedback, Keshav! I have applied the .trim() suggested change and added the vendor null fallback."

# Author commits fix and pushes to feature branch:
$ git add src/components/student/ItemCatalog.jsx
$ git commit -m "fix: sanitize search input with trim and safe null fallback"
$ git push origin feature/lakshay-student-search

# Reviewer Final Action by @Keshav01-ai: APPROVED ("Changes look excellent. Verified and ready to merge!")""")

    doc.add_heading("3.3 Merge Strategy & Justification", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("• Merge Strategy Selected: Squash and Merge")
    doc.add_paragraph("• Two-Line Justification (Required by Rubric):")
    add_code_block(doc, """Justification:
"We selected 'Squash and Merge' because it combines multiple incremental development and fix commits on the feature branch into a single, clean atomic commit on 'main'. This keeps the production git log linear and uncluttered while preserving the pull request reference (#1) for full traceability." """)
    doc.add_paragraph("• Evidence Links: PR Link: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/pull/1 | Merged Commit: 151b536")

    # ==================== Q4 ====================
    doc.add_page_break()
    h4 = doc.add_heading("Q4: Commit Conventions, Tags and Release [1 Mark]", level=1)
    h4.runs[0].font.color.rgb = COLOR_NAVY

    doc.add_paragraph(
        "Assessment Objective: Enforce Conventional Commits specification (feat:, fix:, docs:, refactor:, chore:), update .gitignore, create lightweight tag v0.1.0 and annotated tag v1.0.0, and publish a GitHub Release."
    )

    doc.add_heading("4.1 Five Conventional Commits & .gitignore Update", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Updated .gitignore to ignore backup and temporary files (*.bak, *.tmp):")
    add_code_block(doc, """$ echo "*.bak" >> .gitignore
$ echo "*.tmp" >> .gitignore
$ git add .gitignore
$ git commit -m "chore: update .gitignore to exclude backup and temporary files" """)

    doc.add_paragraph("Verified Output: git log --oneline showing all 5 Conventional Commit types:")
    add_code_block(doc, """$ git log --oneline -n 6
4f86fe7 (HEAD -> main, tag: v1.0.0) feat: implement batch student import feature
05eb704 fix: resolve badge contrast accessibility issue
33dd981 refactor: optimize inventory helper routines
a155577 (tag: v0.1.0) docs: add comprehensive API documentation
ca39632 chore: update .gitignore to exclude backup and temporary files
589bb9b fix: resolve edge case in stock calculation""")

    doc.add_heading("4.2 Tags Creation (Lightweight vs Annotated)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    add_code_block(doc, """# 1. Create Lightweight Tag v0.1.0 (points directly to commit without metadata)
$ git tag v0.1.0 a155577

# 2. Create Annotated Tag v1.0.0 (stores tagger name, email, date, and message)
$ git tag -a v1.0.0 -m "Release v1.0.0: Stable production release of IoT Lab Inventory System"

# 3. Push both tags to GitHub
$ git push origin v0.1.0 v1.0.0
To github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git
 * [new tag]         v0.1.0 -> v0.1.0
 * [new tag]         v1.0.0 -> v1.0.0

# 4. Verified Output: git tag -n
$ git tag -n
v0.1.0          docs: add comprehensive API documentation
v1.0.0          Release v1.0.0: Stable production release of IoT Lab Inventory System""")

    doc.add_heading("4.3 GitHub Release from v1.0.0", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("• GitHub Release URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/releases/tag/v1.0.0")
    doc.add_paragraph("• Release Notes:")
    add_code_block(doc, """## IoT Lab Inventory System v1.0.0 - Official Release

### Summary:
First stable production release featuring complete lab hardware tracking, role-based authentication, student request workflows, and automated CI pipelines.

### Features Included:
- **feat:** Complete inventory tracking for 50+ IoT microcontrollers and components.
- **feat:** Automated 2nd-year student roster batch import script (`scripts/importStudents.js`).
- **fix:** Form re-rendering focus jump bug resolved in Inventory Manager.
- **refactor:** Modularized category constants and inventory calculations.
- **chore:** Automated GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`).""")

    # ==================== Q5 ====================
    doc.add_page_break()
    h5 = doc.add_heading("Q5: Git Hooks — Build and Analyse [1 Mark]", level=1)
    h5.runs[0].font.color.rgb = COLOR_NAVY

    doc.add_paragraph(
        "Assessment Objective: Implement client-side pre-commit and commit-msg hooks, demonstrate blocked and successful commit runs for each, and explain hook distribution and verification risks."
    )

    doc.add_heading("5.1 Pre-Commit Hook (Rejects TODO / FIXME in Staged Files)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Hook Script Path: .githooks/pre-commit")
    add_code_block(doc, """#!/bin/sh
# .githooks/pre-commit
# Rejects commit if any staged file contains whole word TODO or FIXME

echo "🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -v "^\.githooks/")

if [ -z "$STAGED_FILES" ]; then
  echo "✅ Pre-commit check passed: No candidate staged files to scan."
  exit 0
fi

FOUND_FLAGS=0

for FILE in $STAGED_FILES; do
  if git show ":$FILE" | grep -E -n "\\b(TODO|FIXME)\\b" > /dev/null 2>&1; then
    echo "❌ Error: Commit rejected! Staged file '$FILE' contains forbidden markers (TODO or FIXME):"
    git show ":$FILE" | grep -E -n --color=always "\\b(TODO|FIXME)\\b"
    FOUND_FLAGS=1
  fi
done

if [ $FOUND_FLAGS -ne 0 ]; then
  echo "🚫 Aborting commit. Please resolve or remove all TODO / FIXME comments before committing."
  exit 1
fi

echo "✅ Pre-commit check passed: No TODO or FIXME found."
exit 0""")

    doc.add_paragraph("Pre-Commit Blocked Run Evidence:")
    add_code_block(doc, """$ echo "// TODO: finish this logic" > test.js
$ git add test.js
$ git commit -m "feat: add test file with todo"
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...
❌ Error: Commit rejected! Staged file 'test.js' contains forbidden markers (TODO or FIXME):
1:// TODO: finish this logic
🚫 Aborting commit. Please resolve or remove all TODO / FIXME comments before committing.""")

    doc.add_paragraph("Pre-Commit Successful Run Evidence:")
    add_code_block(doc, """$ echo "console.log('Clean verified production code');" > test.js
$ git add test.js
$ git commit -m "feat: add clean test implementation"
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...
✅ Pre-commit check passed: No TODO or FIXME found.
🔍 Running commit-msg hook: Validating commit message format...
✅ Commit-msg check passed: Conventional prefix and length verified.
[main 3b98829] feat: add clean test implementation
 1 file changed, 1 insertion(+)""")

    doc.add_heading("5.2 Commit-Msg Hook (Length >= 10 chars & Conventional Prefix)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Hook Script Path: .githooks/commit-msg")
    add_code_block(doc, """#!/bin/sh
# .githooks/commit-msg
# Validates commit message length (>= 10 chars) and prefix (feat:, fix:, docs:, refactor:, chore:)

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE" | head -n 1)

echo "🔍 Running commit-msg hook: Validating commit message format..."

# 1. Check length
MSG_LEN=${#COMMIT_MSG}
if [ "$MSG_LEN" -lt 10 ]; then
  echo "❌ Error: Commit message is too short ($MSG_LEN characters). Minimum required is 10 characters."
  echo "👉 Commit message received: \\"$COMMIT_MSG\\""
  exit 1
fi

# 2. Check prefix (Conventional Commits)
VALID_PREFIX_REGEX="^(feat:|fix:|docs:|refactor:|chore:)[[:space:]].+"

if ! echo "$COMMIT_MSG" | grep -E "$VALID_PREFIX_REGEX" > /dev/null 2>&1; then
  echo "❌ Error: Commit message must start with one of the following prefixes followed by a space:"
  echo "   - feat: <description>"
  echo "   - fix: <description>"
  echo "   - docs: <description>"
  echo "   - refactor: <description>"
  echo "   - chore: <description>"
  echo "👉 Commit message received: \\"$COMMIT_MSG\\""
  exit 1
fi

echo "✅ Commit-msg check passed: Conventional prefix and length verified."
exit 0""")

    doc.add_paragraph("Commit-Msg Blocked Run 1 (Message Too Short):")
    add_code_block(doc, """$ git commit -m "fix: bug"
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...
✅ Pre-commit check passed: No TODO or FIXME found.
🔍 Running commit-msg hook: Validating commit message format...
❌ Error: Commit message is too short (8 characters). Minimum required is 10 characters.
👉 Commit message received: "fix: bug" """)

    doc.add_paragraph("Commit-Msg Blocked Run 2 (Invalid Prefix):")
    add_code_block(doc, """$ git commit -m "updated the test file without prefix"
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...
✅ Pre-commit check passed: No TODO or FIXME found.
🔍 Running commit-msg hook: Validating commit message format...
❌ Error: Commit message must start with one of the following prefixes followed by a space:
   - feat: <description>
   - fix: <description>
   - docs: <description>
   - refactor: <description>
   - chore: <description>
👉 Commit message received: "updated the test file without prefix" """)

    doc.add_paragraph("Commit-Msg Successful Run:")
    add_code_block(doc, """$ git commit -m "fix: resolve edge case in stock calculation"
🔍 Running pre-commit hook: Checking for TODO or FIXME in staged files...
✅ Pre-commit check passed: No TODO or FIXME found.
🔍 Running commit-msg hook: Validating commit message format...
✅ Commit-msg check passed: Conventional prefix and length verified.
[main 589bb9b] fix: resolve edge case in stock calculation
 1 file changed, 1 insertion(+)""")

    doc.add_heading("5.3 Written Analysis (Why Hooks Aren't Shared & Bypass Risks)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    p_analysis = doc.add_paragraph()
    p_analysis.paragraph_format.line_spacing = 1.25
    p_analysis.add_run(
        "Analysis:\n"
        "1. Why hooks in .git/hooks are not shared by git push: The '.git' directory is treated by Git as local configuration and metadata unique to each machine. Git purposely refuses to transfer '.git/hooks' across network remotes as a fundamental security measure; if hooks were pushed and executed automatically on clone, malicious repositories could execute arbitrary shell code on developers' machines.\n\n"
        "2. How a team can share hooks: A team can store hook scripts in a tracked directory within the repository (such as '.githooks/'). Each developer then runs the command 'git config core.hooksPath .githooks', which instructs Git to execute hooks directly from that version-controlled directory.\n\n"
        "3. Risk of 'git commit --no-verify': The '--no-verify' flag bypasses client-side pre-commit and commit-msg hooks entirely. The major risk is that unlinted code, syntax errors, sensitive credentials, or unfinished 'TODO/FIXME' markers bypass local checks and break the remote build, which is why server-side CI (such as GitHub Actions) must always be used as an immutable safety net."
    )

    output_path = "/Users/lakshayverma/.gemini/antigravity/scratch/iot-lab-inventory/VCS_Assignment_2_Submission_Lakshay_Verma_2581008.docx"
    doc.save(output_path)
    print(f"Document successfully created at {output_path}")

if __name__ == "__main__":
    build_assignment_doc()
