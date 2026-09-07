-- =====================================================================
-- Civic Issue Reporter — Dummy/Seed Data
-- Run after schema.sql. Uses fixed UUIDs (instead of gen_random_uuid())
-- purely so the IDs are readable/referenceable while testing the
-- backend — a real deployment would never hand-pick UUIDs like this.
-- =====================================================================

BEGIN;

-- -----------------------------------------------------------------
-- Departments
-- -----------------------------------------------------------------
INSERT INTO departments (department_id, name, description) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Electrical Maintenance', 'Wiring, lighting, power outlets, electrical safety.'),
    ('d0000000-0000-0000-0000-000000000002', 'Plumbing & Sanitation', 'Water supply, leaks, washrooms, drainage.'),
    ('d0000000-0000-0000-0000-000000000003', 'Civil & Structural', 'Building structure, walkways, fire safety systems.'),
    ('d0000000-0000-0000-0000-000000000004', 'Hostel Administration', 'Furniture, cleanliness, and general upkeep in hostel blocks.'),
    ('d0000000-0000-0000-0000-000000000005', 'Library Administration', 'Facilities and upkeep within the library building.'),
    ('d0000000-0000-0000-0000-000000000006', 'IT Services', 'Campus Wi-Fi, network ports, computer lab hardware.');

-- -----------------------------------------------------------------
-- Categories  (MVP: every threshold defaults to 5, per README §Auto-Escalation)
-- -----------------------------------------------------------------
INSERT INTO categories (category_id, name, department_id, escalation_threshold) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Electrical',        'd0000000-0000-0000-0000-000000000001', 5),
    ('c0000000-0000-0000-0000-000000000002', 'Plumbing',          'd0000000-0000-0000-0000-000000000002', 5),
    ('c0000000-0000-0000-0000-000000000003', 'Structural',        'd0000000-0000-0000-0000-000000000003', 5),
    ('c0000000-0000-0000-0000-000000000004', 'Fire Safety',       'd0000000-0000-0000-0000-000000000003', 5),
    ('c0000000-0000-0000-0000-000000000005', 'Furniture',         'd0000000-0000-0000-0000-000000000004', 5),
    ('c0000000-0000-0000-0000-000000000006', 'Cleanliness',       'd0000000-0000-0000-0000-000000000004', 5),
    ('c0000000-0000-0000-0000-000000000007', 'Wi-Fi / Network',   'd0000000-0000-0000-0000-000000000006', 5);

-- -----------------------------------------------------------------
-- Users
-- password_hash values below are dummy bcrypt-shaped strings for
-- testing only — NOT real hashes. Replace via your auth signup flow.
-- -----------------------------------------------------------------
INSERT INTO users (user_id, name, email, password_hash, role, department_id) VALUES
    -- Students
    ('a0000000-0000-0000-0000-000000000001', 'Aman Verma',    'averma_be23@thapar.edu', '$2b$12$dummyhash.student.aman.......', 'student', NULL),
    ('a0000000-0000-0000-0000-000000000002', 'Priya Nair',    'pnair_be23@thapar.edu',  '$2b$12$dummyhash.student.priya......', 'student', NULL),
    ('a0000000-0000-0000-0000-000000000003', 'Karan Mehta',   'kmehta_be24@thapar.edu', '$2b$12$dummyhash.student.karan......', 'student', NULL),
    ('a0000000-0000-0000-0000-000000000004', 'Simran Kaur',   'skaur_be24@thapar.edu',  '$2b$12$dummyhash.student.simran.....', 'student', NULL),

    -- Faculty
    ('a0000000-0000-0000-0000-000000000005', 'Dr. Rajesh Kumar', 'rkumar@thapar.edu',   '$2b$12$dummyhash.faculty.rajesh.....', 'faculty', NULL),
    ('a0000000-0000-0000-0000-000000000006', 'Dr. Anjali Singh', 'asingh@thapar.edu',   '$2b$12$dummyhash.faculty.anjali.....', 'faculty', NULL),

    -- Administrators (one per department that owns issues in this seed set)
    ('a0000000-0000-0000-0000-000000000007', 'Electrical Dept. Admin', 'admin.electrical@thapar.edu', '$2b$12$dummyhash.admin.electrical...', 'administrator', 'd0000000-0000-0000-0000-000000000001'),
    ('a0000000-0000-0000-0000-000000000008', 'Plumbing Dept. Admin',   'admin.plumbing@thapar.edu',   '$2b$12$dummyhash.admin.plumbing.....', 'administrator', 'd0000000-0000-0000-0000-000000000002'),
    ('a0000000-0000-0000-0000-000000000009', 'Structural Dept. Admin', 'admin.structural@thapar.edu', '$2b$12$dummyhash.admin.structural..', 'administrator', 'd0000000-0000-0000-0000-000000000003'),
    ('a0000000-0000-0000-0000-000000000010', 'Hostel Admin Office',    'admin.hostel@thapar.edu',     '$2b$12$dummyhash.admin.hostel......', 'administrator', 'd0000000-0000-0000-0000-000000000004'),

    -- Super-Admin
    ('a0000000-0000-0000-0000-000000000011', 'Facilities Super-Admin', 'superadmin@thapar.edu', '$2b$12$dummyhash.superadmin........', 'super_admin', NULL);

-- -----------------------------------------------------------------
-- Issues
-- -----------------------------------------------------------------
INSERT INTO issues (
    issue_id, reporter_id, category_id, department_id, was_department_overridden,
    title, description, photo_url, building, floor, area_room,
    status, priority, created_at, updated_at, resolved_at
) VALUES
    -- 1. Safety-critical, escalated (5 upvotes cast below -> High)
    ('e0000000-0000-0000-0000-000000000001',
     'a0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000001', FALSE,
     'Exposed live wiring near washroom entrance',
     'There is a loose, exposed wire hanging near the ground-floor washroom entrance in Hostel-3. It sparked once when it touched the wall. Needs urgent attention.',
     NULL, 'Hostel-3', 'Ground', 'Washroom entrance, near Room 104',
     'ongoing', 'high', now() - interval '6 days', now() - interval '5 days', NULL),

    -- 2. Duplicate of #1 that was instead upvoted (see duplicate_checks below) — not created as its own issue.

    -- 3. Plumbing, resolved
    ('e0000000-0000-0000-0000-000000000003',
     'a0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000002',
     'd0000000-0000-0000-0000-000000000002', FALSE,
     'Leaking tap flooding the washroom floor',
     'The middle tap in the girls'' washroom on the 2nd floor of Hostel-1 has been leaking continuously for two days, water is pooling on the floor.',
     NULL, 'Hostel-1', '2', 'Girls'' Washroom',
     'finished', 'normal', now() - interval '10 days', now() - interval '7 days', now() - interval '7 days'),

    -- 4. Structural / fire safety, reported, not yet acted on
    ('e0000000-0000-0000-0000-000000000004',
     'a0000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000004',
     'd0000000-0000-0000-0000-000000000003', FALSE,
     'Fire extinguisher missing from 3rd floor corridor',
     'The fire extinguisher mount outside Room 301 in Block A is empty — the extinguisher itself appears to have been removed.',
     NULL, 'Block A', '3', 'Corridor outside Room 301',
     'reported', 'normal', now() - interval '2 days', now() - interval '2 days', NULL),

    -- 5. Furniture, low severity, cosmetic, still reported
    ('e0000000-0000-0000-0000-000000000005',
     'a0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000005',
     'd0000000-0000-0000-0000-000000000004', FALSE,
     'Broken chair in common room',
     'One of the plastic chairs in the Hostel-2 common room has a cracked leg and wobbles badly.',
     NULL, 'Hostel-2', 'Ground', 'Common Room',
     'reported', 'normal', now() - interval '1 day', now() - interval '1 day', NULL),

    -- 6. Wi-Fi / Network, ongoing, department override example
    ('e0000000-0000-0000-0000-000000000006',
     'a0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000007',
     'd0000000-0000-0000-0000-000000000006', TRUE,
     'No Wi-Fi signal in library reading hall',
     'The reading hall on the library''s first floor has had no Wi-Fi signal for the last 3 days. Auto-suggested department was Library Administration but this is a network issue, so it was manually re-routed to IT Services.',
     NULL, 'Library', '1', 'Reading Hall (East Wing)',
     'ongoing', 'normal', now() - interval '3 days', now() - interval '2 days', NULL),

    -- 7. Cleanliness, high-traffic area, reported
    ('e0000000-0000-0000-0000-000000000007',
     'a0000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000006',
     'd0000000-0000-0000-0000-000000000004', FALSE,
     'Overflowing garbage bin near cafeteria entrance',
     'The garbage bin right outside the main cafeteria entrance has been overflowing since yesterday evening.',
     NULL, 'Cafeteria Block', 'Ground', 'Main Entrance',
     'reported', 'normal', now() - interval '12 hours', now() - interval '12 hours', NULL);

-- -----------------------------------------------------------------
-- Upvotes
-- Issue #1 gets 5 upvotes (from 5 distinct users) to cross the
-- default escalation_threshold of 5 for its category — this is why
-- its priority was seeded as 'high' above. In the running app, the
-- backend's upvote-transaction would flip this automatically the
-- moment the 5th upvote lands (see SCHEMA_DESIGN.md §3).
-- -----------------------------------------------------------------
INSERT INTO upvotes (issue_id, user_id, created_at) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', now() - interval '5 days'),
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', now() - interval '5 days'),
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', now() - interval '4 days'),
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', now() - interval '4 days'),
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', now() - interval '3 days'),

    -- A couple of lighter upvote counts on other issues
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', now() - interval '2 days'),
    ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', now() - interval '1 day'),
    ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', now() - interval '10 hours');

-- -----------------------------------------------------------------
-- Status history (audit trail — optional table)
-- -----------------------------------------------------------------
INSERT INTO status_history (issue_id, old_status, new_status, changed_by, changed_at) VALUES
    ('e0000000-0000-0000-0000-000000000001', NULL, 'reported', 'a0000000-0000-0000-0000-000000000001', now() - interval '6 days'),
    ('e0000000-0000-0000-0000-000000000001', 'reported', 'ongoing', 'a0000000-0000-0000-0000-000000000007', now() - interval '5 days'),

    ('e0000000-0000-0000-0000-000000000003', NULL, 'reported', 'a0000000-0000-0000-0000-000000000002', now() - interval '10 days'),
    ('e0000000-0000-0000-0000-000000000003', 'reported', 'ongoing', 'a0000000-0000-0000-0000-000000000008', now() - interval '9 days'),
    ('e0000000-0000-0000-0000-000000000003', 'ongoing', 'finished', 'a0000000-0000-0000-0000-000000000008', now() - interval '7 days'),

    ('e0000000-0000-0000-0000-000000000004', NULL, 'reported', 'a0000000-0000-0000-0000-000000000005', now() - interval '2 days'),
    ('e0000000-0000-0000-0000-000000000005', NULL, 'reported', 'a0000000-0000-0000-0000-000000000003', now() - interval '1 day'),

    ('e0000000-0000-0000-0000-000000000006', NULL, 'reported', 'a0000000-0000-0000-0000-000000000004', now() - interval '3 days'),
    ('e0000000-0000-0000-0000-000000000006', 'reported', 'ongoing', 'a0000000-0000-0000-0000-000000000010', now() - interval '2 days'),

    ('e0000000-0000-0000-0000-000000000007', NULL, 'reported', 'a0000000-0000-0000-0000-000000000006', now() - interval '12 hours');

-- -----------------------------------------------------------------
-- Duplicate checks (optional table)
-- Simran attempted to report the same exposed-wiring issue (#1) two
-- days after Aman filed it; the system matched it and she upvoted
-- instead of creating a new report.
-- -----------------------------------------------------------------
INSERT INTO duplicate_checks (new_report_description, matched_issue_id, submitted_by, similarity_score, decision, created_at) VALUES
    ('Live wire hanging near the washroom on the ground floor, saw it spark.',
     'e0000000-0000-0000-0000-000000000001',
     'a0000000-0000-0000-0000-000000000004',
     0.8600, 'upvoted', now() - interval '4 days'),

    -- A near-miss that the reporter decided was NOT the same issue, so it was filed separately
    ('Chair with a broken armrest in the Hostel-2 common room, different from the wobbly one.',
     'e0000000-0000-0000-0000-000000000005',
     'a0000000-0000-0000-0000-000000000004',
     0.4100, 'filed_as_new', now() - interval '18 hours');

-- -----------------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------------
INSERT INTO notifications (user_id, issue_id, type, message, read_status, created_at) VALUES
    -- New report lands in a department -> that department's admin
    ('a0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'new_report',
     'A new Electrical issue was reported in Hostel-3: "Exposed live wiring near washroom entrance".', TRUE, now() - interval '6 days'),

    -- Escalation -> Super-Admin, regardless of which department owns it
    ('a0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000001', 'escalation',
     'Issue "Exposed live wiring near washroom entrance" (Electrical Maintenance) crossed its escalation threshold and is now High Priority.', FALSE, now() - interval '3 days'),

    -- Status change -> original reporter
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'status_change',
     'Your report "Exposed live wiring near washroom entrance" moved from Reported to Ongoing.', TRUE, now() - interval '5 days'),

    ('a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'status_change',
     'Your report "Leaking tap flooding the washroom floor" moved from Ongoing to Finished.', FALSE, now() - interval '7 days'),

    -- Upvote/duplicate activity -> original reporter
    ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'upvote_activity',
     'Your report "Exposed live wiring near washroom entrance" just received its 5th upvote.', FALSE, now() - interval '3 days'),

    ('a0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000006', 'new_report',
     'A Wi-Fi / Network issue originally routed to your department was re-routed to IT Services.', TRUE, now() - interval '3 days');

COMMIT;
