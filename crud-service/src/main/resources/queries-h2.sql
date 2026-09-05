-- =============================================================================
-- SAMPLE SELECT QUERIES FOR BOOK COLLECTION MANAGEMENT SYSTEM
-- =============================================================================
-- Common use case queries demonstrating index usage and best practices
-- =============================================================================

-- =============================================================================
-- 1. FETCH ALL VOLUMES OF A GIVEN COLLECTION, SORTED BY VOLUME NUMBER
-- =============================================================================
-- Use Case: Display all volumes in a series/collection in reading order
-- Index Used: idx_volume_collection_number (composite: collection_id, volume_number)
-- Expected Plan: INDEX SCAN (index-only scan possible if only indexed columns selected)

SELECT
    v.id,
    v.volume_number,
    v.title,
    v.isbn,
    v.publication_date,
    v.page_count,
    v.language,
    v.cover_image_url,
    v.created_at
FROM volumes v
WHERE v.collection_id = ?  -- Parameter: collection UUID
  AND v.deleted = false
ORDER BY v.volume_number ASC;

-- With collection name join (denormalized for display)
SELECT
    v.id,
    v.volume_number,
    v.title,
    v.isbn,
    v.publication_date,
    v.page_count,
    c.name AS collection_name
FROM volumes v
JOIN collections c ON c.id = v.collection_id
WHERE v.collection_id = ?
  AND v.deleted = false
  AND c.deleted = false
ORDER BY v.volume_number ASC;


-- =============================================================================
-- 2. FETCH ALL CHAPTERS OF A SPECIFIC VOLUME, SORTED BY CHAPTER NUMBER
-- =============================================================================
-- Use Case: Table of contents / chapter list for a volume
-- Index Used: idx_section_volume_type_number (composite: volume_id, section_type, section_number)
-- Expected Plan: INDEX SCAN

SELECT
    s.id,
    s.section_number,
    s.section_type,
    s.title,
    s.word_count,
    s.page_start,
    s.page_end,
    s.created_at
FROM sections s
WHERE s.volume_id = ?  -- Parameter: volume UUID
  AND s.section_type = 'CHAPTER'
  AND s.deleted = false
ORDER BY s.section_number ASC;

-- All sections (including prologue, epilogue, etc.) for full TOC
SELECT
    s.id,
    s.section_number,
    s.section_type,
    s.title,
    s.word_count,
    s.page_start,
    s.page_end
FROM sections s
WHERE s.volume_id = ?
  AND s.deleted = false
ORDER BY
    CASE s.section_type
        WHEN 'PROLOGUE' THEN 0
        WHEN 'CHAPTER' THEN 1
        WHEN 'INTERLUDE' THEN 2
        WHEN 'EPILOGUE' THEN 3
        WHEN 'AFTERWORD' THEN 4
        WHEN 'APPENDIX' THEN 5
        ELSE 6
    END,
    s.section_number ASC;


-- =============================================================================
-- 3. SEARCH FOR A COLLECTION BY NAME (PARTIAL MATCH USING LIKE)
-- =============================================================================
-- Use Case: Search box / autocomplete for collection names
-- Index Used: idx_collection_name (btree on name column)
-- Note: Leading wildcard (%) prevents index seek, but trailing wildcard works
-- For full-text search, consider H2's full-text search or external search engine

-- Prefix search (uses index efficiently)
SELECT
    id,
    name,
    description,
    publisher,
    publication_date,
    total_volumes,
    active
FROM collections
WHERE name LIKE 'Harry Potter%'  -- Trailing wildcard = index range scan
  AND deleted = false
ORDER BY name;

-- Contains search (full scan on index, still faster than table scan)
SELECT
    id,
    name,
    description,
    publisher,
    publication_date,
    total_volumes,
    active
FROM collections
WHERE name LIKE '%Slime%'  -- Leading wildcard = full index scan
  AND deleted = false
ORDER BY
    CASE
        WHEN name LIKE 'That Time I Got Reincarnated as a Slime%' THEN 0
        ELSE 1
    END,
    name;

-- Case-insensitive search (H2 default is case-insensitive for LIKE)
SELECT * FROM collections
WHERE UPPER(name) LIKE UPPER('%slime%')
  AND deleted = false;


-- =============================================================================
-- 4. GET THE MOST RECENT VOLUMES ACROSS ALL COLLECTIONS
-- =============================================================================
-- Use Case: "New Releases" dashboard / recent additions
-- Index Used: idx_volume_created_active (if created) or full scan + sort
-- Recommendation: Add index idx_volume_created_desc ON volumes(created_at DESC, deleted, active)

SELECT
    v.id,
    v.volume_number,
    v.title,
    v.isbn,
    v.publication_date,
    v.page_count,
    v.cover_image_url,
    v.created_at,
    c.name AS collection_name
FROM volumes v
JOIN collections c ON c.id = v.collection_id
WHERE v.deleted = false
  AND c.deleted = false
ORDER BY v.created_at DESC
LIMIT 20;

-- Most recent by publication date (not creation date)
SELECT
    v.id,
    v.volume_number,
    v.title,
    v.publication_date,
    c.name AS collection_name
FROM volumes v
JOIN collections c ON c.id = v.collection_id
WHERE v.deleted = false
  AND c.deleted = false
  AND v.publication_date IS NOT NULL
ORDER BY v.publication_date DESC
LIMIT 20;


-- =============================================================================
-- 5. GET FULL COLLECTION DETAIL WITH ALL VOLUMES AND SECTION COUNTS
-- =============================================================================
-- Use Case: Collection detail page
-- Uses: Multiple indexes, JOINs

SELECT
    c.id,
    c.name,
    c.description,
    c.publisher,
    c.publication_date,
    c.language,
    c.total_volumes,
    c.active,
    c.created_at,
    COUNT(v.id) AS actual_volume_count,
    SUM(
        SELECT COUNT(*)
        FROM sections s
        WHERE s.volume_id = v.id AND s.deleted = false
    ) AS total_sections
FROM collections c
LEFT JOIN volumes v ON v.collection_id = c.id AND v.deleted = false
WHERE c.id = ?  -- Parameter: collection UUID
  AND c.deleted = false
GROUP BY c.id, c.name, c.description, c.publisher, c.publication_date, c.language, c.total_volumes, c.active, c.created_at;


-- =============================================================================
-- 6. GET VOLUME DETAIL WITH ALL SECTIONS
-- =============================================================================
-- Use Case: Volume detail page / reader view
-- Index Used: idx_section_volume_number

SELECT
    v.id,
    v.volume_number,
    v.title,
    v.isbn,
    v.publisher,
    v.publication_date,
    v.page_count,
    v.language,
    v.cover_image_url,
    c.name AS collection_name
FROM volumes v
JOIN collections c ON c.id = v.collection_id
WHERE v.id = ?  -- Parameter: volume UUID
  AND v.deleted = false
  AND c.deleted = false;

-- Sections for the volume (separate query for pagination)
SELECT
    s.id,
    s.section_number,
    s.section_type,
    s.title,
    s.content,
    s.word_count,
    s.page_start,
    s.page_end
FROM sections s
WHERE s.volume_id = ?
  AND s.deleted = false
ORDER BY
    CASE s.section_type
        WHEN 'PROLOGUE' THEN 0
        WHEN 'CHAPTER' THEN 1
        WHEN 'INTERLUDE' THEN 2
        WHEN 'EPILOGUE' THEN 3
        WHEN 'AFTERWORD' THEN 4
        WHEN 'APPENDIX' THEN 5
        ELSE 6
    END,
    s.section_number ASC;


-- =============================================================================
-- 7. GET SPECIFIC SECTION CONTENT (FOR READER)
-- =============================================================================
-- Use Case: Reading a specific chapter
-- Index Used: idx_section_volume_number (or primary key)

SELECT
    s.id,
    s.section_number,
    s.section_type,
    s.title,
    s.content,
    s.word_count,
    s.page_start,
    s.page_end,
    v.title AS volume_title,
    v.volume_number,
    c.name AS collection_name
FROM sections s
JOIN volumes v ON v.id = s.volume_id
JOIN collections c ON c.id = v.collection_id
WHERE s.id = ?  -- Parameter: section UUID
  AND s.deleted = false
  AND v.deleted = false
  AND c.deleted = false;


-- =============================================================================
-- 8. STATISTICS QUERIES
-- =============================================================================

-- Total collections, volumes, sections (active)
SELECT
    (SELECT COUNT(*) FROM collections WHERE deleted = false) AS total_collections,
    (SELECT COUNT(*) FROM volumes WHERE deleted = false) AS total_volumes,
    (SELECT COUNT(*) FROM sections WHERE deleted = false) AS total_sections;

-- Volumes per collection with stats
SELECT
    c.name,
    COUNT(v.id) AS volume_count,
    SUM(v.page_count) AS total_pages,
    MIN(v.publication_date) AS first_published,
    MAX(v.publication_date) AS last_published
FROM collections c
LEFT JOIN volumes v ON v.collection_id = c.id AND v.deleted = false
WHERE c.deleted = false
GROUP BY c.id, c.name
ORDER BY volume_count DESC;

-- Word count statistics per volume
SELECT
    v.title,
    v.volume_number,
    COUNT(s.id) AS section_count,
    SUM(s.word_count) AS total_words,
    AVG(s.word_count) AS avg_words_per_section
FROM volumes v
LEFT JOIN sections s ON s.volume_id = v.id AND s.deleted = false
WHERE v.deleted = false
GROUP BY v.id, v.title, v.volume_number
ORDER BY total_words DESC;

-- Chapter count per volume (only CHAPTER type)
SELECT
    v.title,
    COUNT(s.id) AS chapter_count
FROM volumes v
LEFT JOIN sections s ON s.volume_id = v.id AND s.section_type = 'CHAPTER' AND s.deleted = false
WHERE v.deleted = false
GROUP BY v.id, v.title
ORDER BY chapter_count DESC;


-- =============================================================================
-- 9. ADVANCED QUERIES WITH WINDOW FUNCTIONS (H2 2.0+)
-- =============================================================================

-- Next/Previous volume navigation
SELECT
    v.*,
    LAG(v.volume_number) OVER (PARTITION BY v.collection_id ORDER BY v.volume_number) AS prev_volume,
    LEAD(v.volume_number) OVER (PARTITION BY v.collection_id ORDER BY v.volume_number) AS next_volume
FROM volumes v
WHERE v.collection_id = ?
  AND v.deleted = false
ORDER BY v.volume_number;

-- Section word count percentile within volume
SELECT
    s.*,
    PERCENT_RANK() OVER (PARTITION BY s.volume_id ORDER BY s.word_count) AS word_count_percentile
FROM sections s
WHERE s.volume_id = ?
  AND s.deleted = false
  AND s.section_type = 'CHAPTER';


-- =============================================================================
-- 10. SOFT DELETE OPERATIONS (CASCADE)
-- =============================================================================

-- Soft delete a collection (cascades to volumes and sections via triggers/app logic)
-- Note: ON DELETE CASCADE only works for HARD deletes.
-- For soft delete, application must cascade or use triggers.

-- Application-level cascade soft delete:
UPDATE collections SET deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

UPDATE volumes SET deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE collection_id = ?;

UPDATE sections SET deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
WHERE volume_id IN (SELECT id FROM volumes WHERE collection_id = ?);


-- =============================================================================
-- 11. BULK OPERATIONS
-- =============================================================================

-- Bulk insert volumes (use prepared statement batching in application)
-- INSERT INTO volumes (id, collection_id, volume_number, title, isbn, publisher, publication_date, page_count, language, active, created_at, updated_at)
-- VALUES (RANDOM_UUID(), ?, ?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Bulk insert sections
-- INSERT INTO sections (id, volume_id, section_number, section_type, title, content, word_count, page_start, page_end, active, created_at, updated_at)
-- VALUES (RANDOM_UUID(), ?, ?, 'CHAPTER', ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- =============================================================================
-- PERFORMANCE NOTES
-- =============================================================================
/*
QUERY OPTIMIZATION TIPS:
-----------------------

1. Always filter by deleted = false first (uses idx_*_deleted indexes)
2. Use LIMIT for pagination (avoids full result set materialization)
3. For LIKE queries:
   - Prefix search (name LIKE 'prefix%') -> uses index range scan
   - Contains search (name LIKE '%term%') -> full index scan (still faster than table scan)
   - Consider H2 full-text search: CREATE ALIAS IF NOT EXISTS FT_INIT FOR "org.h2.fulltext.FullTextLucene.init"; CALL FT_INIT();

4. JOIN order: Start with most selective filter
   - If filtering by collection_id, start with volumes table
   - If searching by name, start with collections table

5. Index-only scans: Select only indexed columns when possible
   - idx_volume_collection_number covers (collection_id, volume_number)
   - Add INCLUDE columns if H2 version supports it (2.2+)

6. Connection pooling: Use HikariCP with appropriate pool size (see application.yml)

7. Batch size: For bulk inserts, use batch size 500-1000
*/