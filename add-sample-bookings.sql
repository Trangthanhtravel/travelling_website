-- Sample bookings data for tours and services
INSERT INTO bookings (
    type,
    item_id,
    customer_name,
    customer_email,
    customer_phone,
    start_date,
    total_travelers,
    special_requests,
    total_amount,
    currency,
    status,
    contacted_at,
    confirmed_at,
    created_at,
    updated_at
) VALUES
-- Tour bookings
(
    'tour',
    1, -- Ha Long Bay 2-Day Cruise
    'Nguyen Van Minh',
    'minh.nguyen@email.com',
    '+84 901 234 567',
    '2025-09-15',
    2,
    'Vegetarian meals please, celebrating anniversary',
    598.00,
    'USD',
    'confirmed',
    datetime('now', '-5 days'),
    datetime('now', '-3 days'),
    datetime('now', '-7 days'),
    datetime('now', '-3 days')
),
(
    'tour',
    2, -- Sapa Trekking
    'Emily Johnson',
    'emily.johnson@gmail.com',
    '+1 555 123 4567',
    '2025-09-20',
    4,
    'Need pickup from hotel, one person has knee problems',
    756.00,
    'USD',
    'confirmed',
    datetime('now', '-3 days'),
    datetime('now', '-2 days'),
    datetime('now', '-5 days'),
    datetime('now', '-2 days')
),
(
    'tour',
    4, -- Vietnam Highlights 10-Day
    'David and Sarah Kim',
    'kim.family@email.com',
    '+82 10 1234 5678',
    '2025-10-05',
    2,
    'Honeymoon trip, prefer romantic restaurants',
    2598.00,
    'USD',
    'pending',
    NULL,
    NULL,
    datetime('now', '-2 days'),
    datetime('now', '-2 days')
),
(
    'tour',
    6, -- Japan Cherry Blossom
    'Tran Thi Lan',
    'lan.tran@yahoo.com',
    '+84 912 345 678',
    '2025-04-10',
    3,
    'First time to Japan, need photography tips',
    6597.00,
    'USD',
    'contacted',
    datetime('now', '-1 days'),
    NULL,
    datetime('now', '-3 days'),
    datetime('now', '-1 days')
),
(
    'tour',
    3, -- Mekong Delta Day Trip
    'Robert Williams',
    'r.williams@outlook.com',
    '+44 7700 900123',
    '2025-09-12',
    1,
    'Interested in local cooking class if available',
    79.00,
    'USD',
    'completed',
    datetime('now', '-10 days'),
    datetime('now', '-8 days'),
    datetime('now', '-12 days'),
    datetime('now', '-1 days')
),
(
    'tour',
    7, -- Thailand Beach & Culture
    'Le Hoang Nam',
    'nam.le@company.com',
    '+84 903 456 789',
    '2025-11-15',
    2,
    'Need halal food options',
    2198.00,
    'USD',
    'pending',
    NULL,
    NULL,
    datetime('now', '-1 days'),
    datetime('now', '-1 days')
),

-- Service bookings
(
    'service',
    1, -- Toyota Vios rental
    'Michael Chen',
    'michael.chen@email.com',
    '+65 9123 4567',
    '2025-09-18',
    2,
    'Need GPS in English, pickup at airport',
    270.00, -- 6 days * 45
    'USD',
    'confirmed',
    datetime('now', '-4 days'),
    datetime('now', '-3 days'),
    datetime('now', '-6 days'),
    datetime('now', '-3 days')
),
(
    'service',
    2, -- Honda CR-V rental
    'Pham Van Duc',
    'duc.pham@gmail.com',
    '+84 905 678 901',
    '2025-09-25',
    6,
    'Family trip to Sapa, need child safety seats',
    534.00, -- 6 days * 89
    'USD',
    'confirmed',
    datetime('now', '-2 days'),
    datetime('now', '-1 days'),
    datetime('now', '-4 days'),
    datetime('now', '-1 days')
),
(
    'service',
    5, -- Japan visa processing
    'Hoang Thi Mai',
    'mai.hoang@email.com',
    '+84 907 123 456',
    '2025-09-30',
    1,
    'Need express processing, traveling for business',
    150.00,
    'USD',
    'pending',
    NULL,
    NULL,
    datetime('now', '-1 days'),
    datetime('now', '-1 days')
),
(
    'service',
    9, -- Airport transfer
    'James Anderson',
    'j.anderson@email.com',
    '+1 555 987 6543',
    '2025-09-14',
    3,
    'Flight arrives at 11:30 PM, going to District 1',
    35.00,
    'USD',
    'completed',
    datetime('now', '-8 days'),
    datetime('now', '-7 days'),
    datetime('now', '-10 days'),
    datetime('now', '-6 days')
),
(
    'service',
    10, -- Travel insurance
    'Lisa Thompson',
    'lisa.t@email.com',
    '+61 400 123 456',
    '2025-10-01',
    2,
    'Backpacking trip, need adventure sports coverage',
    90.00, -- 2 people * 45
    'USD',
    'confirmed',
    datetime('now', '-3 days'),
    datetime('now', '-2 days'),
    datetime('now', '-5 days'),
    datetime('now', '-2 days')
),
(
    'service',
    7, -- Schengen visa
    'Vu Minh Quan',
    'quan.vu@company.vn',
    '+84 908 765 432',
    '2025-10-15',
    1,
    'Business trip to Germany and France',
    200.00,
    'USD',
    'contacted',
    datetime('now', '-2 days'),
    NULL,
    datetime('now', '-4 days'),
    datetime('now', '-2 days')
),
(
    'service',
    3, -- Ford Transit rental
    'Golden Travel Agency',
    'booking@goldentravel.com',
    '+84 909 111 222',
    '2025-09-22',
    15,
    'Corporate group, need professional driver for 3 days',
    360.00, -- 3 days * 120
    'USD',
    'confirmed',
    datetime('now', '-5 days'),
    datetime('now', '-4 days'),
    datetime('now', '-7 days'),
    datetime('now', '-4 days')
),
(
    'service',
    11, -- Hotel booking service
    'Anna Mueller',
    'anna.mueller@email.de',
    '+49 170 123 4567',
    '2025-10-20',
    2,
    'Looking for boutique hotel in Old Quarter Hanoi',
    25.00,
    'USD',
    'pending',
    NULL,
    NULL,
    datetime('now'),
    datetime('now')
),
(
    'service',
    4, -- Yamaha Exciter rental
    'Alex Rodriguez',
    'alex.r@adventure.com',
    '+34 600 123 456',
    '2025-09-28',
    1,
    'Planning Ha Giang Loop, need route advice',
    175.00, -- 7 days * 25
    'USD',
    'contacted',
    datetime('now', '-1 days'),
    NULL,
    datetime('now', '-3 days'),
    datetime('now', '-1 days')
),
(
    'service',
    6, -- Thailand visa
    'Phan Thi Hoa',
    'hoa.phan@email.com',
    '+84 906 234 567',
    '2025-09-26',
    1,
    'Tourist visa for Bangkok and Phuket trip',
    80.00,
    'USD',
    'confirmed',
    datetime('now', '-6 days'),
    datetime('now', '-5 days'),
    datetime('now', '-8 days'),
    datetime('now', '-5 days')
);
