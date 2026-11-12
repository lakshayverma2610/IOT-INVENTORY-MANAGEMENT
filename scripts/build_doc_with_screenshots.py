import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import subprocess

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
    set_cell_background(cell, "F3F4F6")
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text.strip())
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(31, 41, 55)
    doc.add_paragraph().paragraph_format.space_after = Pt(3)

def add_screenshot_image(doc, img_path, caption):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(2)
        doc.add_picture(img_path, width=Inches(6.0))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run(f"Figure: {caption}")
        r_cap.font.size = Pt(8.5)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(107, 114, 128)

def build_complete_doc():
    doc = docx.Document()

    for s in doc.sections:
        s.top_margin = Inches(0.7)
        s.bottom_margin = Inches(0.7)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    COLOR_NAVY = RGBColor(30, 58, 138)
    COLOR_BLUE = RGBColor(37, 99, 235)

    # University Header
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
            m_table.cell(r, c).paragraphs[0].runs[0].font.size = Pt(9)

    doc.add_paragraph()

    # ==================== Q1 ====================
    doc.add_heading("Q1: Remote Repository Workflow [1 Mark]", level=1).runs[0].font.color.rgb = COLOR_NAVY
    doc.add_paragraph("Assessment Objective: Establish remote tracking with GitHub, demonstrate clone-push-pull multi-client cycle, and verify state integrity with git remote -v.")
    
    doc.add_paragraph("Repository URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT")
    add_screenshot_image(doc, "screenshots/q1_remote_push.png", "Terminal Screenshot: git remote -v and git push -u origin main upstream tracking")
    add_screenshot_image(doc, "screenshots/q1_clone_pull.png", "Terminal Screenshot: Secondary folder clone, commit, push, and git pull back into original folder")

    # ==================== Q2 ====================
    doc.add_page_break()
    doc.add_heading("Q2: Fork, Feature Branch and Pull Request [1 Mark]", level=1).runs[0].font.color.rgb = COLOR_NAVY
    doc.add_paragraph("Assessment Objective: Fork partner's repository, configure upstream remote, develop isolated feature on feature branch, and submit structured Pull Request linked to an issue.")
    
    add_screenshot_image(doc, "screenshots/q2_fork_branch.png", "Terminal Screenshot: git remote -v with upstream and feature branch push")
    add_screenshot_image(doc, "screenshots/q2_github_pr_ui.png", "GitHub UI Screenshot: Pull Request #1 opened by Keshav01-ai on IOT-INVENTORY-MANAGEMENT")

    doc.add_paragraph("Pull Request Details & Evidence:")
    doc.add_paragraph("• Pull Request URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/pull/1")
    doc.add_paragraph("• Title: feat(search): implement real-time inventory search and category filter")
    doc.add_paragraph("• Description: What: Added dynamic keyword search and category dropdown. Why: Students in Room B2-105 were having trouble looking up 50+ items. Closes #1")

    # ==================== Q3 ====================
    doc.add_page_break()
    doc.add_heading("Q3: Code Review and Merge [1 Mark]", level=1).runs[0].font.color.rgb = COLOR_NAVY
    doc.add_paragraph("Assessment Objective: Conduct peer review with at least 3 inline constructive comments, 1 GitHub suggested change, respond to review, push updates, and merge with justified strategy.")

    add_screenshot_image(doc, "screenshots/q3_github_review_merge.png", "GitHub UI Screenshot: Code Review inline comments, suggested change, and Squash and Merge")

    doc.add_paragraph("Inline Comments Breakdown:")
    doc.add_paragraph("1. Comment 1 (Null Safety): 'Ensure fallback for undefined vendor: (item.vendor || \"\").toLowerCase()'")
    doc.add_paragraph("2. Comment 2 (Accessibility): 'Add aria-label=\"Search laboratory items\" for screen reader compliance.'")
    doc.add_paragraph("3. Comment 3 (Suggested Change): Suggested .trim() so accidental whitespace does not break search query.")
    doc.add_paragraph("Author Response & Update: Author accepted .trim() suggestion, pushed commit to branch, reviewer approved.")
    doc.add_paragraph("Merge Strategy & Justification (Squash and Merge):")
    add_code_block(doc, '"We selected Squash and Merge because it combines multiple incremental development and fix commits on the feature branch into a single, clean atomic commit on main. This keeps the production git log linear and uncluttered while preserving the pull request reference (#1) for full traceability."')

    # ==================== Q4 ====================
    doc.add_page_break()
    doc.add_heading("Q4: Commit Conventions, Tags and Release [1 Mark]", level=1).runs[0].font.color.rgb = COLOR_NAVY
    doc.add_paragraph("Assessment Objective: Enforce Conventional Commits specification, update .gitignore, create lightweight tag v0.1.0 and annotated tag v1.0.0, and publish a GitHub Release.")

    add_screenshot_image(doc, "screenshots/q4_git_log_tags.png", "Terminal Screenshot: git log --oneline showing 5 conventional commits and git tag -n")

    doc.add_paragraph("GitHub Release URL: https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT/releases/tag/v1.0.0")
    doc.add_paragraph("Release Notes: Initial stable production release featuring 50+ IoT hardware assets, automated student roster batch import, and GitHub Actions CI pipelines.")

    # ==================== Q5 ====================
    doc.add_page_break()
    doc.add_heading("Q5: Git Hooks — Build and Analyse [1 Mark]", level=1).runs[0].font.color.rgb = COLOR_NAVY
    doc.add_paragraph("Assessment Objective: Implement client-side pre-commit and commit-msg hooks, demonstrate blocked and successful commit runs for each, and explain hook distribution and verification risks.")

    doc.add_heading("5.1 Pre-Commit Hook (Rejects TODO / FIXME in Staged Files)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Hook script path: .githooks/pre-commit")
    add_screenshot_image(doc, "screenshots/q5_precommit_blocked.png", "Terminal Screenshot: Pre-commit hook rejecting commit containing TODO")

    doc.add_heading("5.2 Commit-Msg Hook (Length >= 10 chars & Conventional Prefix)", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph("Hook script path: .githooks/commit-msg")
    add_screenshot_image(doc, "screenshots/q5_commitmsg_blocked.png", "Terminal Screenshot: Commit-msg hook rejecting short message and invalid prefix")
    add_screenshot_image(doc, "screenshots/q5_hooks_success.png", "Terminal Screenshot: Both pre-commit and commit-msg hooks passing successfully")

    doc.add_heading("5.3 Written Analysis", level=2).runs[0].font.color.rgb = COLOR_BLUE
    doc.add_paragraph(
        "1. Why hooks in .git/hooks are not shared by git push: The '.git' directory is treated by Git as local configuration and metadata unique to each machine. Git purposely refuses to transfer '.git/hooks' across network remotes as a fundamental security measure; if hooks were pushed and executed automatically on clone, malicious repositories could execute arbitrary shell scripts on developers' machines without their consent.\n\n"
        "2. How a team can share hooks: A team can store hook scripts in a tracked directory within the repository (such as '.githooks/'). Each developer then runs the command 'git config core.hooksPath .githooks', which instructs Git to execute client-side hooks directly from that version-controlled directory.\n\n"
        "3. Risk of 'git commit --no-verify': The '--no-verify' flag bypasses client-side pre-commit and commit-msg hooks entirely. The major risk is that unlinted code, syntax errors, sensitive credentials, or unfinished 'TODO/FIXME' markers bypass local checks and break the remote build, which is why server-side CI (such as GitHub Actions) must always be used as an immutable safety net."
    )

    doc_out = "VCS_Assignment_2_Submission_Lakshay_Verma_2581008.docx"
    doc.save(doc_out)
    print(f"Saved complete doc with screenshots to {doc_out}")

build_complete_doc()
