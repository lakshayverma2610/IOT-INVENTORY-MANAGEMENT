import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import datetime

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()

    # Page Margins: 1 inch all around
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base Colors
    COLOR_PRIMARY = RGBColor(30, 58, 138)    # Deep Navy
    COLOR_SECONDARY = RGBColor(59, 130, 246) # Blue Accent
    COLOR_TEXT = RGBColor(31, 41, 55)        # Dark Charcoal
    COLOR_MUTED = RGBColor(107, 114, 128)    # Muted Gray

    # Set Normal Style Font
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = COLOR_TEXT
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(6)

    # ==================== COVER PAGE ====================
    cover_p1 = doc.add_paragraph()
    cover_p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_p1.paragraph_format.space_before = Pt(36)
    cover_p1.paragraph_format.space_after = Pt(12)
    run_inst = cover_p1.add_run("IILM UNIVERSITY\nSCHOOL OF COMPUTER SCIENCE & ENGINEERING")
    run_inst.font.size = Pt(14)
    run_inst.font.bold = True
    run_inst.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph() # Spacing

    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(12)
    run_title = title_p.add_run("PROJECT REPORT ON\nIOT LAB INVENTORY MANAGEMENT SYSTEM")
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(36)
    run_sub = sub_p.add_run("Implementation, Workflow & DevOps Integration using Git and GitHub")
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    doc.add_paragraph() # Spacing

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.paragraph_format.space_before = Pt(48)
    meta_p.paragraph_format.space_after = Pt(6)
    r_subm = meta_p.add_run("Submitted in partial fulfillment of the requirements for the course:\n")
    r_subm.font.size = Pt(11)
    r_subm.font.italic = True
    r_course = meta_p.add_run("VERSION CONTROL SYSTEM (VCS)\n")
    r_course.font.size = Pt(13)
    r_course.font.bold = True
    r_course.font.color.rgb = COLOR_PRIMARY

    info_table = doc.add_table(rows=2, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False

    cell_l1 = info_table.cell(0, 0)
    cell_l1.paragraphs[0].text = "Submitted By:"
    cell_l1.paragraphs[0].runs[0].font.bold = True
    cell_l1.paragraphs[0].runs[0].font.color.rgb = COLOR_PRIMARY
    p_sub = cell_l1.add_paragraph()
    p_sub.add_run("Lakshay Verma\nURN: 2581008\nB.Tech Computer Science & Engineering\n2nd / 3rd Year")

    cell_r1 = info_table.cell(0, 1)
    cell_r1.paragraphs[0].text = "Submitted To:"
    cell_r1.paragraphs[0].runs[0].font.bold = True
    cell_r1.paragraphs[0].runs[0].font.color.rgb = COLOR_PRIMARY
    p_inst = cell_r1.add_paragraph()
    p_inst.add_run("Department of Computer Science & Engineering\nIoT & Robotics Foundation Lab\nIILM University")

    cell_dt = info_table.cell(1, 0)
    cell_dt.paragraphs[0].text = "\nAcademic Year: 2025–2026"
    cell_repo = info_table.cell(1, 1)
    cell_repo.paragraphs[0].text = "\nRepository: github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT"

    doc.add_page_break()

    # ==================== CERTIFICATE & ACKNOWLEDGEMENT ====================
    h1 = doc.add_heading("Certificate of Originality", level=1)
    h1.runs[0].font.color.rgb = COLOR_PRIMARY
    p_cert = doc.add_paragraph(
        "This is to certify that the project report entitled 'IoT Lab Inventory Management System using Git and GitHub' "
        "submitted by Lakshay Verma (URN: 2581008) in partial fulfillment of the course curriculum for Version Control System (VCS) "
        "is a bona fide record of independent and original work carried out by him under supervision.\n\n"
        "The results embodied in this report have not been submitted to any other University or Institute for the award of any degree or diploma."
    )
    p_cert.paragraph_format.line_spacing = 1.3

    doc.add_paragraph("\n\n\n")
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1 = sig_table.cell(0, 0)
    c1.paragraphs[0].text = "_____________________\nStudent Signature\nLakshay Verma (URN: 2581008)"
    c2 = sig_table.cell(0, 1)
    c2.paragraphs[0].text = "_____________________\nFaculty / Course Coordinator\nDepartment of CSE"

    doc.add_paragraph()
    h_ack = doc.add_heading("Acknowledgement", level=1)
    h_ack.runs[0].font.color.rgb = COLOR_PRIMARY
    p_ack = doc.add_paragraph(
        "I express my sincere gratitude to my faculty coordinators and laboratory in-charges of the IoT & Robotics Foundation Lab "
        "(Room B2-105) for their continuous guidance, domain insights, and encouragement throughout this project.\n\n"
        "I would also like to thank my institution, IILM University, for providing the necessary computing resources, "
        "developer infrastructure, and sandbox environment to test, track, and deploy this project."
    )
    p_ack.paragraph_format.line_spacing = 1.3

    doc.add_page_break()

    # ==================== ABSTRACT & TOC ====================
    h_abs = doc.add_heading("Abstract", level=1)
    h_abs.runs[0].font.color.rgb = COLOR_PRIMARY
    p_abs = doc.add_paragraph(
        "Laboratory asset management in higher education engineering departments frequently struggles with paper registers, "
        "untracked equipment loans, missing inventory, and uncoordinated faculty updates. This project presents the "
        "IoT Lab Inventory Management System, an enterprise-ready web application built with React 19, Tailwind CSS v4, "
        "and Supabase backend with resilient localStorage fallback, designed specifically for IoT & Robotics Labs.\n\n"
        "More crucially, this project serves as a comprehensive case study in modern Version Control Systems (VCS). "
        "It details the hands-on application of Git fundamentals, branching models, conventional commit standards, "
        "merge conflict resolution, GitHub repository management, and continuous integration (CI) workflows via GitHub Actions. "
        "Every phase of project inception, feature prototyping, bug remediation, security hardening, and production deployment to "
        "Vercel is rigorously tracked, demonstrating full mastery of the Git ecosystem."
    )
    p_abs.paragraph_format.line_spacing = 1.3

    doc.add_heading("Table of Contents", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    toc_data = [
        ("1. Introduction & Problem Statement", "4"),
        ("2. Version Control Architecture & Theory", "5"),
        ("3. Git Workflow & Local Repository Implementation", "7"),
        ("4. GitHub Cloud Collaboration & DevOps Pipelines", "9"),
        ("5. Application System Architecture & Features", "11"),
        ("6. Testing, CI Verification & Deployment", "13"),
        ("7. Conclusion & Future Scope", "14"),
        ("Appendix A: Git Commands Quick Reference", "15"),
        ("Appendix B: Top 15 VCS Viva Examination Q&A", "16")
    ]
    toc_table = doc.add_table(rows=len(toc_data), cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title, page) in enumerate(toc_data):
        c_title = toc_table.cell(idx, 0)
        c_title.paragraphs[0].text = title
        c_page = toc_table.cell(idx, 1)
        c_page.paragraphs[0].text = page
        c_page.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    doc.add_page_break()

    # ==================== CHAPTER 1 ====================
    doc.add_heading("Chapter 1: Introduction & Problem Statement", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    doc.add_heading("1.1 Background", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "College engineering laboratories—especially in emerging fields like the Internet of Things (IoT), Robotics, "
        "and Embedded Systems—handle hundreds of high-value components ranging from microcontrollers (Arduino Mega, ESP32, ESP8266), "
        "flight controllers (CUAV V6X, APM 2.8), LiDAR sensors, and LiPo batteries to high-turnover consumables such as soldering wire, "
        "resistors, switches, and wheels. Traditionally, labs rely on manual paper logbooks or isolated spreadsheets, leading to lost items, "
        "unreturned hardware, lack of accountability, and chaotic stock counting."
    )

    doc.add_heading("1.2 Objectives", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph("The primary objectives of this project are twofold:")
    p_obj1 = doc.add_paragraph(style='List Bullet')
    p_obj1.add_run("Functional Objective: ").bold = True
    p_obj1.add_run("Design and deploy a full-featured, role-based IoT Lab Inventory Management System catering to both students (item requests, history tracking, availability catalog) and faculty/in-charges (approvals, issue tracking, stock modification, overdue monitoring).")
    
    p_obj2 = doc.add_paragraph(style='List Bullet')
    p_obj2.add_run("Version Control System (VCS) Objective: ").bold = True
    p_obj2.add_run("Implement an enterprise-standard Version Control lifecycle using Git and GitHub, showcasing atomic commits, semantic versioning tags, feature branch isolation, Pull Request workflows, and automated Continuous Integration (CI) with GitHub Actions.")

    # ==================== CHAPTER 2 ====================
    doc.add_heading("Chapter 2: Version Control Architecture & Theory", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    doc.add_heading("2.1 Centralized vs. Distributed Version Control", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "Older systems such as CVS and SVN (Subversion) are Centralized Version Control Systems (CVCS), where a single central server "
        "stores the repository history. If the server fails or network connectivity is severed, developers cannot commit, inspect history, or branch.\n\n"
        "In contrast, Git is a Distributed Version Control System (DVCS). Every collaborator clones a full cryptographic replica of the entire repository history locally. "
        "This guarantees high resilience, offline productivity, blazing fast local operations, and zero single points of failure."
    )

    doc.add_heading("2.2 Git's Three-Tier Architecture", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph("Git manages file states through three fundamental areas:")
    t_arch = doc.add_table(rows=4, cols=3)
    t_arch.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Architecture Stage", "State of Code", "Key Commands"]
    for i, h in enumerate(headers):
        cell = t_arch.cell(0, i)
        cell.paragraphs[0].text = h
        cell.paragraphs[0].runs[0].font.bold = True
        set_cell_background(cell, "E0E7FF")
    
    rows = [
        ("1. Working Directory", "Unmodified or modified files on disk", "git status, git restore"),
        ("2. Staging Area (Index)", "Snapshot of modifications prepared for next commit", "git add <files>, git reset"),
        ("3. Local Repository (.git)", "Committed and cryptographically hashed tree objects", "git commit, git log, git tag")
    ]
    for row_idx, data in enumerate(rows, start=1):
        for col_idx, text in enumerate(data):
            cell = t_arch.cell(row_idx, col_idx)
            cell.paragraphs[0].text = text

    doc.add_heading("2.3 Git Internal Object Model", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "Git stores history as a Directed Acyclic Graph (DAG) of immutable objects indexed by SHA-1/SHA-256 hashes:\n"
        "• Blob: Stores compressed file content without metadata.\n"
        "• Tree: Represents a directory, linking file names to blob hashes and sub-trees.\n"
        "• Commit: Points to a root tree object, holding author metadata, timestamp, parent commit hashes, and commit message.\n"
        "• Tag: An annotated reference pointing permanently to a specific commit hash."
    )

    # ==================== CHAPTER 3 ====================
    doc.add_heading("Chapter 3: Git Workflow & Local Repository Implementation", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    doc.add_heading("3.1 Branching Strategy (GitFlow-Lite)", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "To ensure stability of the production deployment, direct commits to 'main' were restricted during major changes. "
        "A feature-branch strategy was employed:\n"
        "• main: Represents deployable production code synchronized with Vercel.\n"
        "• feat/*: Topic branches created for discrete functionality (e.g. feat/student-importer, feat/auth-persistence).\n"
        "• fix/*: Targeted hotfix branches created to address isolated bugs (e.g. fix/inventory-input-focus)."
    )

    doc.add_heading("3.2 Conventional Commits Standard", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "All commits adhered to the Conventional Commits specification, ensuring human and machine readability:\n"
        "• feat: Introduces a new capability (e.g. feat: complete IoT Lab Inventory system with Supabase backend)\n"
        "• fix: Patches a bug (e.g. fix: prevent form remounting focus loss in inventory manager)\n"
        "• chore: Maintenance, package lock, or script updates\n"
        "• docs: Documentation and README improvements"
    )

    doc.add_heading("3.3 Repository Hygiene & Secret Protection (.gitignore)", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "A strict .gitignore configuration was implemented to prevent security leakage and repository bloating:\n"
        "• node_modules/ and dist/: Ignored to prevent megabytes of dependencies and build artifacts from polluting Git history.\n"
        "• .env & .env.local: Crucially excluded to protect database connection strings and secret keys.\n"
        "• .env.example: Provided in the repository to document required environment variables without exposing sensitive values."
    )

    # ==================== CHAPTER 4 ====================
    doc.add_heading("Chapter 4: GitHub Cloud Collaboration & DevOps Pipelines", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    doc.add_heading("4.1 Remote Tracking & Synchronization", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "The project is hosted publicly on GitHub at:\n"
        "https://github.com/lakshayverma2610/IOT-INVENTORY-MANAGEMENT\n\n"
        "Local branches are configured to track remote branches via SSH (git@github.com:lakshayverma2610/IOT-INVENTORY-MANAGEMENT.git), "
        "allowing synchronized fetch, pull, and push routines."
    )

    doc.add_heading("4.2 Automated Continuous Integration (GitHub Actions)", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "To prevent regressions from entering the production branch, a GitHub Actions workflow was authored at "
        "'.github/workflows/ci.yml'. The workflow executes on every push to 'main' and on every Pull Request, running on ubuntu-latest:\n"
        "1. Checkout repository (actions/checkout@v4)\n"
        "2. Configure Node.js 20 environment with npm caching (actions/setup-node@v4)\n"
        "3. Clean dependency installation (npm ci)\n"
        "4. Static code analysis and linting (npm run lint / oxlint)\n"
        "5. Production bundle compilation (npm run build / vite build)"
    )

    doc.add_heading("4.3 Semantic Release Tagging (v1.0.0)", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "Upon stabilizing core functionality and validating CI checks, an annotated Git release tag was created:\n"
        "git tag -a v1.0.0 -m 'Release v1.0.0: IoT Lab Inventory Management System'\n"
        "git push origin v1.0.0\n"
        "This establishes an immutable milestone in GitHub's Releases dashboard."
    )

    # ==================== CHAPTER 5 ====================
    doc.add_heading("Chapter 5: Application System Architecture & Features", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    doc.add_heading("5.1 Technical Stack", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    t_stack = doc.add_table(rows=5, cols=2)
    t_stack.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_rows = [
        ("Layer", "Technology"),
        ("Frontend Framework", "React 19, Vite 8, Tailwind CSS v4"),
        ("Icons & Animation", "Lucide React, Framer Motion"),
        ("State Management & Storage", "React Context API, Supabase JS, LocalStorage Fallback"),
        ("Hosting & Deployment", "Vercel Global Edge Network")
    ]
    for r_idx, (c0, c1) in enumerate(s_rows):
        cell0 = t_stack.cell(r_idx, 0)
        cell1 = t_stack.cell(r_idx, 1)
        cell0.paragraphs[0].text = c0
        cell1.paragraphs[0].text = c1
        if r_idx == 0:
            cell0.paragraphs[0].runs[0].font.bold = True
            cell1.paragraphs[0].runs[0].font.bold = True
            set_cell_background(cell0, "E0E7FF")
            set_cell_background(cell1, "E0E7FF")

    doc.add_heading("5.2 Key System Modules", level=2).runs[0].font.color.rgb = COLOR_SECONDARY
    doc.add_paragraph(
        "• Student Portal: Item catalog with stock levels, 7-digit URN authentication, request submission, active loans, and overdue notifications.\n"
        "• Faculty / In-Charge Portal: Real-time request approvals/rejections with return date assignment, inventory creation/editing, stock decrementing, and overdue alerts.\n"
        "• 2nd-Year Roster Importer: Automated Node.js ingestion script (scripts/importStudents.js) to parse university class lists into structured accounts."
    )

    # ==================== CHAPTER 6 ====================
    doc.add_heading("Chapter 6: Testing, CI Verification & Deployment", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    doc.add_paragraph(
        "Testing was carried out across multiple dimensions:\n"
        "1. Static Linting: Executed oxlint across 24 source files to identify unhandled errors and hook purity violations.\n"
        "2. Production Build: Executed 'vite build' generating optimized client chunks in ~210ms with zero errors.\n"
        "3. Live Edge Deployment: Hosted on Vercel at https://iotinventorymanagement.vercel.app/ with continuous webhook updates upon GitHub pushes."
    )

    # ==================== CHAPTER 7 ====================
    doc.add_heading("Chapter 7: Conclusion & Future Scope", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    doc.add_paragraph(
        "This project successfully delivers an automated, secure laboratory inventory system while exemplifying modern Version Control System standards. "
        "By enforcing disciplined branch isolation, semantic commit messages, automated GitHub Actions pipelines, and cloud deployment synchronization, "
        "the project demonstrates complete proficiency in Git and GitHub methodologies.\n\n"
        "Future enhancements include:\n"
        "• QR Code / RFID physical hardware scanning.\n"
        "• Automated email / SMS overdue notifications.\n"
        "• Multi-lab federation across academic departments."
    )

    # ==================== APPENDIX A ====================
    doc.add_page_break()
    doc.add_heading("Appendix A: Git Commands Quick Reference", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    commands_data = [
        ("git init", "Initializes a new Git repository locally"),
        ("git status", "Shows working tree status (untracked, staged, modified files)"),
        ("git add <file> / git add .", "Adds file modifications to the staging area (index)"),
        ("git commit -m \"<msg>\"", "Creates a permanent snapshot of staged changes with a commit message"),
        ("git branch <name>", "Creates a new branch pointing to current HEAD"),
        ("git checkout -b <name>", "Creates and switches to a new branch"),
        ("git merge <branch>", "Merges changes from the specified branch into current branch"),
        ("git remote add origin <url>", "Links local repository to a remote GitHub URL"),
        ("git push -u origin <branch>", "Pushes local branch to remote repository and sets tracking"),
        ("git fetch origin", "Downloads remote commits and refs without modifying working files"),
        ("git pull origin <branch>", "Fetches and immediately merges remote changes into active branch"),
        ("git tag -a <tag> -m \"<msg>\"", "Creates an annotated release tag"),
        ("git push origin --tags", "Pushes all local tags to GitHub"),
        ("git log --oneline --graph", "Visualizes commit history in a single line compact format"),
        ("git diff", "Shows unstaged differences between working tree and staging index")
    ]
    t_cmd = doc.add_table(rows=len(commands_data)+1, cols=2)
    t_cmd.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0 = t_cmd.cell(0, 0)
    c1 = t_cmd.cell(0, 1)
    c0.paragraphs[0].text = "Git Command"
    c1.paragraphs[0].text = "Function / Description"
    c0.paragraphs[0].runs[0].font.bold = True
    c1.paragraphs[0].runs[0].font.bold = True
    set_cell_background(c0, "E0E7FF")
    set_cell_background(c1, "E0E7FF")

    for idx, (cmd, desc) in enumerate(commands_data, start=1):
        cell_cmd = t_cmd.cell(idx, 0)
        cell_desc = t_cmd.cell(idx, 1)
        cell_cmd.paragraphs[0].text = cmd
        cell_cmd.paragraphs[0].runs[0].font.name = 'Courier New'
        cell_desc.paragraphs[0].text = desc

    # ==================== APPENDIX B ====================
    doc.add_page_break()
    doc.add_heading("Appendix B: Top 15 VCS Viva Examination Q&A", level=1).runs[0].font.color.rgb = COLOR_PRIMARY
    
    viva_qa = [
        ("Q1: What is the primary difference between Git and GitHub?",
         "Git is a distributed version control command-line tool installed locally. GitHub is a cloud-based hosting service for Git repositories offering collaboration tools like Pull Requests, Issue trackers, and GitHub Actions."),
        
        ("Q2: What is the difference between 'git pull' and 'git fetch'?",
         "'git fetch' downloads remote changes and updates remote-tracking branches without altering local code. 'git pull' does a 'git fetch' followed immediately by 'git merge' into the active branch."),
        
        ("Q3: Explain the three areas in Git.",
         "The Working Directory (files on disk being edited), the Staging Area / Index (prepared snapshot staged via git add), and the Repository (permanent committed database in .git)."),
        
        ("Q4: What is a merge conflict and how is it resolved?",
         "A merge conflict occurs when competing changes are made to the same lines of a file across different branches. Git inserts conflict markers (<<<<<<<, =======, >>>>>>>). The developer manually reconciles the conflicting code, stages the file, and commits the resolution."),
        
        ("Q5: What is the difference between git merge and git rebase?",
         "git merge joins histories with a dedicated merge commit, preserving exact chronological order. git rebase replays your branch commits on top of another branch, rewriting commit history to produce a linear timeline."),
        
        ("Q6: What is a Pull Request (PR)?",
         "A GitHub mechanism proposing to merge changes from one branch into another, allowing team members to review diffs, comment on lines, and ensure automated CI checks pass before merging."),
        
        ("Q7: Why is .gitignore essential in professional development?",
         "It prevents cluttering the repository with machine-generated files (node_modules, build output) and safeguards confidential credentials (.env files) from being exposed publicly."),
        
        ("Q8: What is GitHub Actions and how did you utilize it in this project?",
         "GitHub Actions is a CI/CD platform. In this project, .github/workflows/ci.yml automatically triggers on every push and PR to verify dependency installation, execute oxlint, and build the Vite production bundle."),
        
        ("Q9: What is an annotated tag and what is Semantic Versioning?",
         "An annotated tag is a Git reference that stores the tagger's identity, date, and a release message. Semantic Versioning uses MAJOR.MINOR.PATCH format (e.g., v1.0.0) to communicate backward-compatible and breaking changes."),
        
        ("Q10: What does 'git status' vs 'git diff' show?",
         "'git status' outlines which files are untracked, modified, or staged. 'git diff' displays exact line-by-line code insertions and deletions."),
        
        ("Q11: How do you safely undo changes in Git?",
         "Use 'git restore <file>' to discard working directory edits. For staged files, use 'git restore --staged <file>'. To undo an already pushed commit, use 'git revert <commit-id>' to create an inverse commit safely."),
        
        ("Q12: What does HEAD represent in Git?",
         "HEAD is a symbolic pointer referencing the current branch and the latest commit checked out in the working directory."),
        
        ("Q13: How does Continuous Deployment work with GitHub and Vercel?",
         "A webhook notifies Vercel whenever commits are pushed to 'main'. Vercel clones the commit, executes npm run build, and updates the production URL automatically."),
        
        ("Q14: What are Conventional Commits?",
         "A structured formatting rule for commit messages using prefixes like 'feat:', 'fix:', 'chore:', and 'docs:', enabling automated changelog generation and clear history comprehension."),
        
        ("Q15: What command visualizes the branch and merge graph in Git?",
         "git log --oneline --graph --decorate --all displays a visual ASCII diagram of all branches, merges, and commit points.")
    ]

    for q, a in viva_qa:
        p_q = doc.add_paragraph()
        r_q = p_q.add_run(q)
        r_q.bold = True
        r_q.font.color.rgb = COLOR_PRIMARY
        p_a = doc.add_paragraph(a)
        p_a.paragraph_format.line_spacing = 1.2
        p_a.paragraph_format.space_after = Pt(8)

    output_path = "/Users/lakshayverma/.gemini/antigravity/scratch/iot-lab-inventory/IoT_Lab_Inventory_VCS_Report.docx"
    doc.save(output_path)
    print(f"Report saved successfully to {output_path}")

if __name__ == "__main__":
    create_report()

