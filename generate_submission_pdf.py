import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 800, "Expense Voucher Management System | Project Documentation & Submission")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 792, 541, 792)

        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 35, page_str)
        self.drawString(54, 35, "Confidential - Prachay Securities Pvt Ltd | Full Stack Internship")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 541, 48)
        self.restoreState()


def build_pdf(filename="Project_Presentation_and_Submission.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0F172A"),
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#2563EB"),
        alignment=TA_CENTER
    )

    org_style = ParagraphStyle(
        'OrgStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        alignment=TA_CENTER
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=3
    )

    caption_style = ParagraphStyle(
        'CaptionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#64748B"),
        alignment=TA_CENTER,
        spaceAfter=8
    )

    badge_label_style = ParagraphStyle(
        'BadgeLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#0F172A")
    )

    badge_val_style = ParagraphStyle(
        'BadgeVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    story = []

    # ------------------ COVER / HEADER SECTION ------------------
    story.append(Spacer(1, 15))
    story.append(Paragraph("EXPENSE VOUCHER MANAGEMENT SYSTEM", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Full Stack Developer Internship Assignment - Project Overview & Submission", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Evaluator: <b>Prachay Securities Private Limited</b> | Candidate: <b>Yash Ranpariya</b>", org_style))
    story.append(Spacer(1, 10))

    # Key Links Callout Table
    links_data = [
        [
            Paragraph("<b>GitHub Repository:</b>", badge_label_style),
            Paragraph('<a href="https://github.com/Yash-Ranpariya/voucher-create"><font color="#2563EB"><u>https://github.com/Yash-Ranpariya/voucher-create</u></font></a>', badge_val_style)
        ],
        [
            Paragraph("<b>Demo Video Walkthrough:</b>", badge_label_style),
            Paragraph('<a href="https://github.com/Yash-Ranpariya/voucher-create#demo-video-walkthrough"><font color="#2563EB"><u>https://github.com/Yash-Ranpariya/voucher-create#demo-video-walkthrough</u></font></a>', badge_val_style)
        ],
        [
            Paragraph("<b>Application Tech Stack:</b>", badge_label_style),
            Paragraph("React 18 + Vite + TypeScript | Node.js + Express + Prisma ORM (SQLite / PostgreSQL)", badge_val_style)
        ],
        [
            Paragraph("<b>Credentials (Password: Password@123):</b>", badge_label_style),
            Paragraph("Employee: <b>emp1@abc.com</b>, <b>emp2@abc.com</b> | Director: <b>director@abc.com</b> | Accounts: <b>accounts@abc.com</b>", badge_val_style)
        ]
    ]

    t_links = Table(links_data, colWidths=[150, 337])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 1: PROJECT OVERVIEW ------------------
    story.append(Paragraph("1. Project Overview & Objective", h1_style))
    story.append(Paragraph(
        "Company ABC historically managed employee expense vouchers manually through paper receipts and physical sign-offs. "
        "This project delivers an end-to-end, digital, role-based <b>Expense Voucher Approval & Reimbursement System</b> that "
        "automates voucher creation, dual-tier digital signatures, hierarchy approval rules, and financial ledger monitoring.",
        body_style
    ))
    story.append(Paragraph("<b>Three Core Stakeholder Roles:</b>", h2_style))
    story.append(Paragraph("• <b>Employee:</b> Create draft vouchers, upload receipt attachments with OCR scanning, draw/upload signature, submit for approval, track real-time reimbursement status.", bullet_style))
    story.append(Paragraph("• <b>Director (Admin):</b> Company-wide view of all submitted vouchers, filter by department/status, review expense receipts, approve with digital signature or reject with mandatory rejection remarks.", bullet_style))
    story.append(Paragraph("• <b>Accounts Team:</b> Organization-wide visibility, multi-field search & filtering (Bonus Point), verification of high-value vouchers, payment disbursement via Razorpay gateway, and CSV financial exports.", bullet_style))
    story.append(Spacer(1, 8))

    # ------------------ SECTION 2: WHAT MAKES THIS PROJECT UNIQUE ------------------
    story.append(Paragraph("2. Special Features & Innovations (What Makes This Project Stand Out)", h1_style))
    special_features = [
        ("1. Dynamic Hierarchy Approval Rule (INR 50,000+ Gateway)", "Vouchers below INR 50,000 go straight to Director for approval. Vouchers of INR 50,000 or greater automatically trigger <i>PENDING_ACCOUNTS_VERIFICATION</i> first so the finance team can audit budget allocations before Director sign-off."),
        ("2. Dual Digital Signatures (Canvas Pad + Image Upload)", "Full signature compliance: Employees and Directors can either physically sign on an interactive canvas pad or upload an image file. Signatures are snapshotted permanently to the voucher audit record."),
        ("3. AI Receipt OCR Scanner (Tesseract.js)", "Smart expense creation: Employees can upload a physical receipt photo, and built-in OCR automatically extracts the total amount, expense date, category, and expense title to save manual effort."),
        ("4. Payment Gateway Integration (Razorpay SDK)", "Accounts department can trigger direct online reimbursement payouts through an integrated Razorpay payment modal with transaction IDs logged directly in the ledger."),
        ("5. State-of-the-Art Fintech Glassmorphism UI", "Custom-crafted dark aesthetic with multi-layer mouse parallax background (vintage ticket watermark motifs), interactive Recharts donut distributions, and smooth Framer Motion transitions."),
        ("6. Complete Audit Trail & Notifications", "Every action (Draft Created, Updated, Submitted, Approved, Rejected, Paid) is chronologically stamped in the <i>VoucherActivity</i> log alongside in-app alerts and test emails.")
    ]

    for title, desc in special_features:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 10))

    # ------------------ SECTION 3: WORKFLOW TABLE ------------------
    story.append(Paragraph("3. Step-by-Step Voucher Lifecycle", h1_style))
    workflow_rows = [
        [Paragraph("<b>Stage</b>", badge_label_style), Paragraph("<b>Trigger / Actor</b>", badge_label_style), Paragraph("<b>Resulting Status & Logic</b>", badge_label_style)],
        [Paragraph("1. Create Draft", body_style), Paragraph("Employee", body_style), Paragraph("<b>DRAFT</b>. Fully editable and deletable by the employee.", body_style)],
        [Paragraph("2. Submit", body_style), Paragraph("Employee + Signature", body_style), Paragraph("If amount &lt; INR 50k: <b>PENDING_APPROVAL</b>.<br/>If amount &gt;= INR 50k: <b>PENDING_ACCOUNTS_VERIFICATION</b>.", body_style)],
        [Paragraph("3. Budget Check", body_style), Paragraph("Accounts Team", body_style), Paragraph("Verifies allocation: transitions to <b>PENDING_APPROVAL</b>.", body_style)],
        [Paragraph("4. Decision", body_style), Paragraph("Director + Signature / Reason", body_style), Paragraph("<b>APPROVED</b> (with signature) OR <b>REJECTED</b> (with mandatory reason).", body_style)],
        [Paragraph("5. Disbursement", body_style), Paragraph("Accounts Team", body_style), Paragraph("Processes payment via Razorpay: <b>PAID</b> (read-only final record).", body_style)],
    ]
    t_workflow = Table(workflow_rows, colWidths=[100, 130, 257])
    t_workflow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_workflow)

    # ------------------ PAGE BREAK FOR SCREENSHOTS ------------------
    story.append(PageBreak())

    # ------------------ SECTION 4: PROJECT SCREENSHOTS ------------------
    story.append(Paragraph("4. Application Visual Showcase (Screenshots)", h1_style))
    story.append(Paragraph("High-fidelity captures from the live running application demonstrating the glassmorphism design and role interfaces:", body_style))
    story.append(Spacer(1, 6))

    img_w = 460
    img_h = 240

    # Screenshot 1: Login Screen
    login_img_path = r"C:\Users\yashr\Downloads\assignment protliz\docs\screenshots\01_login.png"
    if os.path.exists(login_img_path):
        story.append(KeepTogether([
            Paragraph("<b>Figure 1: Role-Based Authentication & Sign In Screen</b>", h2_style),
            Image(login_img_path, width=img_w, height=img_h),
            Paragraph("<i>Glassmorphism sign-in card with role selector (Employee / Director / Accounts) and demo credentials helper.</i>", caption_style),
            Spacer(1, 8)
        ]))

    # Screenshot 2: Employee Dashboard
    emp_img_path = r"C:\Users\yashr\Downloads\assignment protliz\docs\screenshots\02_employee_dashboard.png"
    if os.path.exists(emp_img_path):
        story.append(KeepTogether([
            Paragraph("<b>Figure 2: Employee Dashboard (emp1 & emp2)</b>", h2_style),
            Image(emp_img_path, width=img_w, height=img_h),
            Paragraph("<i>Real-time expense distribution donut chart with interactive color guide, metric cards, and personal voucher history.</i>", caption_style),
            Spacer(1, 8)
        ]))

    story.append(PageBreak())

    # Screenshot 3: Director Dashboard
    dir_img_path = r"C:\Users\yashr\Downloads\assignment protliz\docs\screenshots\03_director_dashboard.png"
    if os.path.exists(dir_img_path):
        story.append(KeepTogether([
            Paragraph("<b>Figure 3: Director Management & Approval Dashboard</b>", h2_style),
            Image(dir_img_path, width=img_w, height=img_h),
            Paragraph("<i>Company-wide overview: Pending approval count, approved amounts, category breakdowns, and audit feed.</i>", caption_style),
            Spacer(1, 8)
        ]))

    # Screenshot 4: Voucher Management & Create
    list_img_path = r"C:\Users\yashr\Downloads\assignment protliz\docs\screenshots\05_vouchers_list.png"
    if os.path.exists(list_img_path):
        story.append(KeepTogether([
            Paragraph("<b>Figure 4: Voucher Tracking Table (Draft, Pending, Approved, Paid)</b>", h2_style),
            Image(list_img_path, width=img_w, height=img_h),
            Paragraph("<i>Interactive voucher listing table showing real-time statuses, auto-generated IDs (VCH-2026-XXXX), and action buttons.</i>", caption_style),
            Spacer(1, 8)
        ]))

    story.append(PageBreak())

    # Screenshot 5: Accounts Monitoring & Export
    acc_img_path = r"C:\Users\yashr\Downloads\assignment protliz\docs\screenshots\07_accounts_monitoring.png"
    if os.path.exists(acc_img_path):
        story.append(KeepTogether([
            Paragraph("<b>Figure 5: Accounts Team Monitoring & Export Hub</b>", h2_style),
            Image(acc_img_path, width=img_w, height=img_h),
            Paragraph("<i>Finance team portal equipped with instant search, multi-column filters, Razorpay payment triggers, and CSV export.</i>", caption_style),
            Spacer(1, 8)
        ]))

    # ------------------ SECTION 5: DEMO VIDEO & REPOSITORY ------------------
    story.append(Paragraph("5. Demo Video Walkthrough & Repository Submission", h1_style))
    story.append(Paragraph(
        "A complete video demonstration of the workflow has been organized into the GitHub repository documentation. "
        "You can review the full interactive walkthrough, test logins, signature signing, and voucher state transitions below:",
        body_style
    ))

    submission_box = [
        [
            Paragraph("<b>Direct GitHub Repo:</b>", badge_label_style),
            Paragraph('<a href="https://github.com/Yash-Ranpariya/voucher-create"><font color="#2563EB"><u>https://github.com/Yash-Ranpariya/voucher-create</u></font></a>', badge_val_style)
        ],
        [
            Paragraph("<b>Demo Video Link:</b>", badge_label_style),
            Paragraph('<a href="https://github.com/Yash-Ranpariya/voucher-create#demo-video-walkthrough"><font color="#2563EB"><u>https://github.com/Yash-Ranpariya/voucher-create#demo-video-walkthrough</u></font></a> (Direct video stream & animated demo)', badge_val_style)
        ],
        [
            Paragraph("<b>Local Setup:</b>", badge_label_style),
            Paragraph("Backend: <code>npm run dev</code> on port 5000 | Frontend: <code>npm run dev</code> on port 5173", badge_val_style)
        ],
        [
            Paragraph("<b>Candidate Name:</b>", badge_label_style),
            Paragraph("<b>Yash Ranpariya</b> (Full Stack Developer Internship Candidate)", badge_val_style)
        ]
    ]

    t_submission = Table(submission_box, colWidths=[140, 347])
    t_submission.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#2563EB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_submission)
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Evaluation Summary:</b> The project strictly adheres to all requirements from the assignment specification (RBAC security, audit trails, responsive glassmorphism design, digital signatures, validation rules, and automated unique voucher number generation).", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {filename}")

if __name__ == "__main__":
    build_pdf()
