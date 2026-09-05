-- =============================================================================
-- INSERT EXAMPLES FOR BOOK COLLECTION MANAGEMENT SYSTEM
-- =============================================================================
-- Run these after schema creation to populate sample data
-- =============================================================================

-- =============================================================================
-- 1. CREATE COLLECTIONS
-- =============================================================================

-- Collection 1: That Time I Got Reincarnated as a Slime
INSERT INTO collections (id, name, description, publisher, publication_date, language, total_volumes, active, created_at, updated_at)
VALUES (
    RANDOM_UUID(),
    'That Time I Got Reincarnated as a Slime - Volume 1',
    'A Japanese light novel series written by Fuse and illustrated by Mitz Vah. The story follows Satoru Mikami, a 37-year-old corporate worker who is stabbed to death and reincarnated in a fantasy world as a slime monster.',
    'Kodansha',
    '2013-05-01',
    'Japanese',
    25,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Store the collection ID for reference (in real app, use RETURNING or SELECT)
-- For demo, we'll use a fixed UUID - in practice use the generated one
-- Collection 2: Harry Potter
INSERT INTO collections (id, name, description, publisher, publication_date, language, total_volumes, active, created_at, updated_at)
VALUES (
    RANDOM_UUID(),
    'Harry Potter - The Philosopher''s Stone',
    'A series of seven fantasy novels written by British author J.K. Rowling. The novels chronicle the lives of a young wizard, Harry Potter, and his friends Hermione Granger and Ron Weasley.',
    'Bloomsbury Publishing',
    '1997-06-26',
    'English',
    7,
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Collection 3: The Lord of the Rings
INSERT INTO collections (id, name, description, publisher, publication_date, language, total_volumes, active, created_at, updated_at)
VALUES (
    RANDOM_UUID(),
    'The Lord of the Rings - The Fellowship of the Ring',
    'An epic high-fantasy novel written by English author and scholar J.R.R. Tolkien. The story began as a sequel to Tolkien''s 1937 fantasy novel The Hobbit.',
    'Allen & Unwin',
    '1954-07-29',
    'English',
    3,
    FALSE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Collection 4: One Piece
INSERT INTO collections (id, name, description, publisher, publication_date, language, total_volumes, active, created_at, updated_at)
VALUES (
    RANDOM_UUID(),
    'One Piece - Volume 1',
    'A Japanese manga series written and illustrated by Eiichiro Oda. It follows the adventures of Monkey D. Luffy and his pirate crew in search of the ultimate treasure "One Piece".',
    'Shueisha',
    '1997-07-22',
    'Japanese',
    108,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. ADD VOLUMES (Reference collections by their UUIDs)
-- =============================================================================
-- Note: In practice, you would SELECT the collection UUIDs first
-- For this script, we'll use subqueries to get the IDs

-- Volumes for "That Time I Got Reincarnated as a Slime"
INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 1, 'The Storm Dragon, Veldora', '978-4-06-381937-5', 'Kodansha', '2014-05-30', 288, 'Japanese', 'https://example.com/slime-v1.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'That Time I Got Reincarnated as a Slime%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 2, 'The Goblin Kingdom', '978-4-06-381938-2', 'Kodansha', '2014-09-30', 272, 'Japanese', 'https://example.com/slime-v2.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'That Time I Got Reincarnated as a Slime%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 19, 'The Saint''s Magic Power is Omnipotent', '978-4-06-523456-7', 'Kodansha', '2023-04-07', 192, 'Japanese', 'https://example.com/slime-v19.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'That Time I Got Reincarnated as a Slime%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 25, 'Final Volume Title', '978-4-06-529876-5', 'Kodansha', '2024-02-28', 256, 'Japanese', 'https://example.com/slime-v25.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'That Time I Got Reincarnated as a Slime%' LIMIT 1;

-- Volumes for "Harry Potter"
INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 1, 'The Philosopher''s Stone', '978-0-7475-3269-9', 'Bloomsbury Publishing', '1997-06-26', 223, 'English', 'https://example.com/hp1.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'Harry Potter%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 2, 'The Chamber of Secrets', '978-0-7475-3849-3', 'Bloomsbury Publishing', '1998-07-02', 251, 'English', 'https://example.com/hp2.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'Harry Potter%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 3, 'The Prisoner of Azkaban', '978-0-7475-4215-5', 'Bloomsbury Publishing', '1999-07-08', 317, 'English', 'https://example.com/hp3.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'Harry Potter%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 7, 'The Deathly Hallows', '978-0-7475-9105-4', 'Bloomsbury Publishing', '2007-07-21', 607, 'English', 'https://example.com/hp7.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'Harry Potter%' LIMIT 1;

-- Volumes for "The Lord of the Rings"
INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 1, 'The Fellowship of the Ring', '978-0-547-92821-0', 'Allen & Unwin', '1954-07-29', 423, 'English', 'https://example.com/lotr1.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'The Lord of the Rings%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 2, 'The Two Towers', '978-0-547-92822-7', 'Allen & Unwin', '1954-11-11', 352, 'English', 'https://example.com/lotr2.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'The Lord of the Rings%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 3, 'The Return of the King', '978-0-547-92823-4', 'Allen & Unwin', '1955-10-20', 416, 'English', 'https://example.com/lotr3.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'The Lord of the Rings%' LIMIT 1;

-- Volumes for "One Piece"
INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 1, 'Romance Dawn', '978-4-08-872509-0', 'Shueisha', '1997-12-24', 192, 'Japanese', 'https://example.com/op1.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'One Piece%' LIMIT 1;

INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, cover_image_url, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), c.id, 100, 'Proclamation', '978-4-08-882789-3', 'Shueisha', '2021-09-03', 192, 'Japanese', 'https://example.com/op100.jpg', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM collections c WHERE c.name LIKE 'One Piece%' LIMIT 1;

-- =============================================================================
-- 3. ADD SECTIONS/CHAPTERS (Reference volumes by their UUIDs)
-- =============================================================================

-- Sections for "That Time I Got Reincarnated as a Slime - Volume 1"
-- Prologue
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 0, 'PROLOGUE', 'Prologue: The End and The Beginning',
    'Satoru Mikami, 37 years old, single, worked for a general contractor. He was stabbed by a random passerby while protecting his junior colleague...',
    1200, 1, 5, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Storm Dragon, Veldora' LIMIT 1;

-- Chapter 1
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 1, 'CHAPTER', 'Chapter 1: The Slime',
    'When I came to, I was in a dark cave. My body felt strange... I had become a slime!',
    3500, 7, 25, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Storm Dragon, Veldora' LIMIT 1;

-- Chapter 2
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 2, 'CHAPTER', 'Chapter 2: The Storm Dragon',
    'I met the Storm Dragon Veldora. He was sealed in this cave for 300 years...',
    4200, 27, 48, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Storm Dragon, Veldora' LIMIT 1;

-- Chapter 3
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 3, 'CHAPTER', 'Chapter 3: The Goblin Village',
    'After naming the dragon, I gained a new skill. Now I need to help the goblins...',
    3800, 50, 72, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Storm Dragon, Veldora' LIMIT 1;

-- Epilogue
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 4, 'EPILOGUE', 'Epilogue: A New Journey Begins',
    'With the goblins safe and a new name, Rimuru Tempest, my adventure truly begins...',
    1500, 74, 78, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Storm Dragon, Veldora' LIMIT 1;

-- Sections for "Harry Potter - The Philosopher's Stone"
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 0, 'PROLOGUE', 'Prologue: The Boy Who Lived',
    'Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much...',
    2100, 1, 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Philosopher''s Stone' LIMIT 1;

INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 1, 'CHAPTER', 'Chapter 1: The Boy Who Lived',
    'The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it...',
    4500, 11, 30, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Philosopher''s Stone' LIMIT 1;

INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 2, 'CHAPTER', 'Chapter 2: The Vanishing Glass',
    'Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step...',
    4200, 31, 52, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Philosopher''s Stone' LIMIT 1;

-- Sections for "The Lord of the Rings - The Fellowship of the Ring"
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 0, 'PROLOGUE', 'Prologue: Concerning Hobbits',
    'This book is largely concerned with Hobbits, and from its pages a reader may discover much of their character...',
    3000, 1, 15, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Fellowship of the Ring' LIMIT 1;

INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 1, 'CHAPTER', 'Book I, Chapter 1: A Long-expected Party',
    'When Mr. Bilbo Baggins of Bag End announced that he would shortly be celebrating his eleventy-first birthday...',
    5500, 17, 45, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'The Fellowship of the Ring' LIMIT 1;

-- Sections for "One Piece - Volume 1"
INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 1, 'CHAPTER', 'Chapter 1: Romance Dawn',
    'On a small boat in the middle of the ocean, a barrel floats by. Inside is a young boy named Monkey D. Luffy...',
    2800, 3, 22, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'Romance Dawn' LIMIT 1;

INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
SELECT
    RANDOM_UUID(), v.id, 2, 'CHAPTER', 'Chapter 2: The Man Who Was Called "Pirate Hunter"',
    'Luffy meets Roronoa Zoro, a bounty hunter tied to a post. Luffy frees him and asks him to join his crew...',
    3200, 23, 42, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM volumes v WHERE v.title = 'Romance Dawn' LIMIT 1;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify collections created
-- SELECT id, name, total_volumes, active FROM collections WHERE deleted = false;

-- Verify volumes per collection
-- SELECT c.name, COUNT(v.id) as volume_count
-- FROM collections c
-- LEFT JOIN volumes v ON v.collection_id = c.id AND v.deleted = false
-- WHERE c.deleted = false
-- GROUP BY c.id, c.name;

-- Verify sections per volume
-- SELECT v.title, COUNT(s.id) as section_count
-- FROM volumes v
-- LEFT JOIN sections s ON s.volume_id = v.id AND s.deleted = false
-- WHERE v.deleted = false
-- GROUP BY v.id, v.title;