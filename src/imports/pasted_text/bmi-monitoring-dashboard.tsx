Build a dedicated BMI Monitoring Dashboard inside the Admin Panel of a school health and midday meal monitoring web app called MealSync. Use React + TypeScript + Tailwind CSS with a clean, production-grade admin dashboard design. The backend is Django REST API.

The goal of this screen is to help government/admin users monitor whether every school uploads BMI data for all students every month, identify non-compliant schools quickly, send reminders, and track health risks and trends.

Core Admin BMI Dashboard Requirements
Build a dedicated Admin page called BMI Monitoring Dashboard with the following sections:

1. Top Summary Cards
Show KPI cards for:

Total schools

Fully compliant schools

Partially updated schools

Non-compliant schools

Total students pending BMI update

Schools requiring immediate action

2. School-Level BMI Compliance Table
Display a searchable, filterable table of all schools with columns:

School Name

Total Students

Students with BMI updated

Pending BMI entries

Last BMI update date

BMI Updated for Current Month: Yes / No

Completion Percentage

Status Indicator

Use status colors:

Green = Fully Updated

Yellow = Partially Updated / Pending

Red = Not Updated / Non-Compliant

Example:

School A → 90% updated

School B → 0% updated and highlighted red

3. Reminder and Warning Alerts
Add an alerts panel at the top or side:

Reminder alert shown 2–3 days before month end for schools with incomplete BMI submission

Warning alert shown from the 1st day of next month for schools that missed previous month BMI updates
Use clear UI priority:

Yellow for reminder

Red for warning

Messages:

'Reminder: Please upload BMI data for all students before month end.'

'Warning: BMI data not submitted for previous month.'

4. Automated Notification Actions
Provide admin action buttons to:

Send reminder to all schools

Send reminder only to non-compliant schools

Send reminder only to partially updated schools

For now, design this as in-app notification actions. Structure it so email can be added later.

5. Priority List
Add a section called Schools Requiring Immediate Action.
Auto-populate this list based on:

No BMI data uploaded

Very low completion percentage

Overdue monthly submission

High number of pending student entries

This should be visually prominent and sorted by urgency.

6. Detailed School View
When admin clicks a school row, open a detailed page, modal, or drawer showing:

School name and school summary

Student-wise BMI status

Missing BMI entries

Last update timeline

Pending students

Overdue students

Low BMI students

Sudden BMI drop indicators if available

7. Analytics and Reports
Add chart and analytics sections for:

% of schools compliant

% of schools pending

% of schools non-compliant

Monthly BMI compliance trend

School-wise comparison chart

Pending vs updated students chart

Top overdue schools

Low BMI risk distribution if data is available

Use reusable chart components.

8. Enforcement / Compliance UI
Add a visible label or badge for schools with missing BMI data:

Compliant

Partially Compliant

Non-Compliant

If possible, show a warning note for non-compliant schools like:
'This school is non-compliant for monthly BMI submission.'

UX Requirements
This should feel like a serious government monitoring dashboard, not a marketing page.

Use cards, tables, tabs, banners, status badges, alerts, filters, and charts.

Make the dashboard data-dense but readable.

Prioritize quick scanning and clear actionability.

Status colors must be consistent throughout the page.

Include loading, empty, and error states.

Add sticky filters/header if useful.

Support responsive layout, but optimize primarily for desktop admin usage.

Filtering and Controls
Add filters for:

Month

Year

Status

District / location (if available)

School name search

Reusable Components
Generate reusable components for:

KPI card

Compliance status badge

Alert banner

School compliance table

Priority action list

Notification action bar

School detail drawer/modal

Student BMI status list

Charts section

Expected Output
Please generate:

Folder structure

Route structure

Reusable component architecture

TypeScript interfaces for SchoolBMIStatus, StudentBMIStatus, DashboardSummary, NotificationAction

Mock API integration layer for Django endpoints

Full page code for BMI Monitoring Dashboard

Detail view component for one school

Sample mock data for testing

Clean, modular, production-style code

Design style:

Professional admin dashboard

Clear hierarchy

Accessible colors and tables

Minimal but strong visual feedback

Built for compliance tracking, alerts, and monitoring"


Short version
If you want a shorter version for Bolt, v0, Lovable, or Cursor, use this:

"Build a React + TypeScript + Tailwind Admin BMI Monitoring Dashboard for MealSync. The page should show school-wise monthly BMI submission compliance across all schools with KPI cards, a compliance table, reminder/warning alerts, notification actions, a priority list of schools requiring immediate action, detailed school drill-down view, analytics charts, completion percentages, and color-coded statuses (green fully updated, yellow partially updated, red non-compliant). The UI should feel like a serious government monitoring dashboard connected to a Django backend API."

Extra line to improve output
Add this line too for better results:

"Focus on making non-compliant schools instantly visible and actionable, with red highlights, urgency ordering, and admin-friendly monitoring workflows."

If you want, I can now write: