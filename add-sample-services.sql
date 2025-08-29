-- Sample services data including car rentals, visa services, and other travel services
-- Clear existing services first
DELETE FROM services;

INSERT INTO services (
    title,
    slug,
    subtitle,
    description,
    price,
    duration,
    images,
    included,
    excluded,
    category_id,
    service_type,
    status,
    created_at,
    updated_at
) VALUES
-- CAR RENTAL SERVICES (category_id = 4 for Car Rental)
(
    'Toyota Vios - Economy Car Rental',
    'toyota-vios-economy-car-rental',
    'Perfect for city driving and short trips',
    'Reliable and fuel-efficient sedan ideal for exploring Vietnam''s cities and nearby attractions. Features air conditioning, GPS navigation, and comprehensive insurance coverage.',
    45.00,
    'Per day',
    '["https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Comprehensive insurance", "GPS navigation system", "24/7 roadside assistance", "Unlimited mileage within city limits", "Air conditioning", "Basic maintenance"]',
    '["Fuel costs", "Highway tolls", "Parking fees", "Additional driver fees", "Cross-border travel", "Damage excess"]',
    4,
    'car-rental',
    'active',
    datetime('now', '-20 days'),
    datetime('now', '-20 days')
),
(
    'Honda CR-V - SUV Rental',
    'honda-crv-suv-rental',
    'Spacious SUV for family adventures',
    'Comfortable 7-seater SUV perfect for family trips and group travel. Ideal for mountain roads and longer journeys with ample luggage space.',
    89.00,
    'Per day',
    '["https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Full insurance coverage", "GPS and entertainment system", "24/7 support", "Child safety seats available", "All-weather tires", "Emergency kit"]',
    '["Fuel costs", "Toll fees", "Parking charges", "Additional driver fees", "International driving permit", "Cleaning fees if required"]',
    4,
    'car-rental',
    'active',
    datetime('now', '-18 days'),
    datetime('now', '-18 days')
),
(
    'Ford Transit - Mini Bus Rental',
    'ford-transit-mini-bus-rental',
    '16-seater for group transportation',
    'Spacious mini bus perfect for group tours, airport transfers, and corporate events. Professional driver service available.',
    120.00,
    'Per day',
    '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Professional driver", "Air conditioning", "Sound system", "Comfortable seating", "Luggage compartment", "Insurance coverage"]',
    '["Fuel costs", "Driver accommodation for multi-day trips", "Overtime charges", "Toll fees", "Parking fees", "Additional cleaning"]',
    4,
    'car-rental',
    'active',
    datetime('now', '-15 days'),
    datetime('now', '-15 days')
),
(
    'Yamaha Exciter - Motorbike Rental',
    'yamaha-exciter-motorbike-rental',
    'Adventure bike for exploring Vietnam',
    'Popular Vietnamese motorbike perfect for the Ha Giang Loop and other adventure routes. Includes helmet and basic maintenance.',
    25.00,
    'Per day',
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Quality helmet", "Basic tools", "Lock and chain", "Insurance coverage", "24/7 emergency contact", "Route recommendations"]',
    '["Fuel costs", "Fines and violations", "Damage repairs", "Personal accident insurance", "International driving license", "Protective gear"]',
    4,
    'car-rental',
    'active',
    datetime('now', '-12 days'),
    datetime('now', '-12 days')
),

-- VISA SERVICES (category_id = 5 for Visa Services)
(
    'Japan Tourist Visa Processing',
    'japan-tourist-visa-processing',
    'Fast and reliable Japan visa service',
    'Complete Japan tourist visa processing service with document preparation, appointment booking, and application submission. High success rate with experienced visa consultants.',
    150.00,
    '7-10 business days',
    '["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Document review and preparation", "Visa application form completion", "Embassy appointment booking", "Application submission", "Status tracking", "Visa collection"]',
    '["Embassy fees", "Document translation if required", "Express processing fees", "Travel to embassy", "Additional documentation", "Visa rejection fees"]',
    5,
    'other-services',
    'active',
    datetime('now', '-25 days'),
    datetime('now', '-25 days')
),
(
    'Thailand Visa Processing',
    'thailand-visa-processing',
    'Thailand tourist and business visa service',
    'Professional Thailand visa processing for tourism and business purposes. Includes visa on arrival assistance and document preparation.',
    80.00,
    '3-5 business days',
    '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Document verification", "Application form completion", "Embassy submission", "Status updates", "Visa collection service", "Consultation"]',
    '["Embassy visa fees", "Express processing charges", "Document courier fees", "Translation services", "Multiple entry fees", "Travel insurance"]',
    5,
    'other-services',
    'active',
    datetime('now', '-22 days'),
    datetime('now', '-22 days')
),

-- TRANSPORTATION SERVICES (category_id = 6 for Transportation)
(
    'Airport Transfer Service',
    'airport-transfer-service',
    'Comfortable airport pickup and drop-off',
    'Professional airport transfer service with meet & greet, flight monitoring, and comfortable vehicles. Available 24/7 for all major airports.',
    35.00,
    '1-way transfer',
    '["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Professional driver", "Meet & greet service", "Flight monitoring", "Air-conditioned vehicle", "Luggage assistance", "Child seats available"]',
    '["Highway tolls", "Parking fees", "Waiting time over 30 minutes", "Additional stops", "Large luggage surcharge", "Late night surcharge"]',
    6,
    'other-services',
    'active',
    datetime('now', '-16 days'),
    datetime('now', '-16 days')
),

-- HOTEL BOOKING SERVICES (category_id = 7 for Hotel Booking)
(
    'Hotel Booking Service',
    'hotel-booking-service',
    'Best rates guaranteed accommodation',
    'Professional hotel booking service with access to exclusive rates and room upgrades. Covers hotels, resorts, and boutique properties worldwide.',
    25.00,
    'Per booking',
    '["https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"]',
    '["Best rate guarantee", "Room upgrade requests", "Special occasion arrangements", "24/7 booking support", "Cancellation assistance", "Local recommendations"]',
    '["Hotel room charges", "Resort fees", "Tourism taxes", "Cancellation fees", "No-show charges", "Extra services at hotel"]',
    7,
    'other-services',
    'active',
    datetime('now', '-12 days'),
    datetime('now', '-12 days')
);
