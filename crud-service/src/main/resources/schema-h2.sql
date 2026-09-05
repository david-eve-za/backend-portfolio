-- =============================================================================
-- H2 Database Schema for Book Collection Management System
-- =============================================================================
-- Database: H2 (version 2.2.x+), MVCC mode enabled
-- Connection URL Example:
--   jdbc:h2:file:./data/book-collection;MVCC=TRUE;LOCK_TIMEOUT=10000;CACHE_SIZE=65536;PAGE_SIZE=4096
--
-- Design Notes:
-- - UUID primary keys with RANDOM_UUID() default (native H2 UUID type)
-- - MVCC for better concurrency (readers don't block writers)
-- - ON DELETE CASCADE for referential integrity
-- - Triggers for auto-updating updated_at timestamp
-- - Composite indexes for common query patterns
-- - HASH indexes for UUID equality lookups (point queries)
-- =============================================================================

-- =============================================================================
-- ENABLE MVCC MODE (must be set before creating tables)
-- =============================================================================
SET MODE MYSQL; -- Use MySQL compatibility mode for better UUID support
-- Alternatively, MVCC is enabled via connection URL: ;MVCC=TRUE

-- =============================================================================
-- TABLE: collections (Main Collection Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS collections (
    -- Primary Key: UUID with auto-generation
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),

    -- Collection name following format: "Collection Name - Volume|Book Number"
    name VARCHAR(255) NOT NULL,

    -- Optional description of the series/collection
    description VARCHAR(500),

    -- Publisher information
    publisher VARCHAR(255),

    -- Original publication date of the collection
    publication_date DATE,

    -- Primary language (e.g., 'Japanese', 'English', 'Spanish')
    language VARCHAR(50),

    -- Total volumes in the collection (cached for quick access)
    total_volumes INT,

    -- Soft delete support
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,

    -- Audit timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Active flag for filtering
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes for collections
-- Primary key index is automatic (UUID)
-- Name index for partial match searches (LIKE queries)
CREATE INDEX IF NOT EXISTS idx_collection_name ON collections(name);
-- Deleted flag index for soft-delete filtering
CREATE INDEX IF NOT EXISTS idx_collection_deleted ON collections(deleted);
-- Active flag index
CREATE INDEX IF NOT EXISTS idx_collection_active ON collections(active);
-- Publisher index for filtering
CREATE INDEX IF NOT EXISTS idx_collection_publisher ON collections(publisher);
-- Language index for filtering
CREATE INDEX IF NOT EXISTS idx_collection_language ON collections(language);
-- Composite index for common query: active collections ordered by creation date
CREATE INDEX IF NOT EXISTS idx_collection_active_created ON collections(active, created_at DESC);

-- HASH index for UUID equality lookups (point queries on id)
-- H2 supports USING HASH for hash-based indexes
CREATE INDEX IF NOT EXISTS idx_collection_id_hash ON collections(id) USING HASH;

-- =============================================================================
-- TABLE: volumes (Volumes/Books Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS volumes (
    -- Primary Key: UUID with auto-generation
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),

    -- Foreign Key to collections (ON DELETE CASCADE)
    collection_id UUID NOT NULL,

    -- Volume number within the collection (1, 2, 3...)
    volume_number INT NOT NULL,

    -- Optional specific title for this volume (e.g., "The Philosopher's Stone")
    title VARCHAR(500),

    -- ISBN-13 or ISBN-10 (VARCHAR to preserve hyphens and leading zeros)
    isbn VARCHAR(255),

    -- Publisher of this specific volume
    publisher VARCHAR(255),

    -- Publication date of this volume
    publication_date DATE,

    -- Page count
    page_count INT,

    -- Language of this volume
    language VARCHAR(50),

    -- Cover image URL
    cover_image_url VARCHAR(1000),

    -- Soft delete support
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,

    -- Audit timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Active flag
    active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Foreign Key Constraint with CASCADE DELETE
    CONSTRAINT fk_volume_collection
        FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE CASCADE
);

-- Indexes for volumes
-- Foreign key index (essential for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_volume_collection ON volumes(collection_id);
-- Composite index for fetching volumes of a collection ordered by volume number
-- This is the MOST CRITICAL index for the primary use case
CREATE INDEX IF NOT EXISTS idx_volume_collection_number ON volumes(collection_id, volume_number);
-- ISBN unique index (for duplicate prevention and fast lookup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_volume_isbn ON volumes(isbn);
-- Deleted flag index
CREATE INDEX IF NOT EXISTS idx_volume_deleted ON volumes(deleted);
-- Active flag index
CREATE INDEX IF NOT EXISTS idx_volume_active ON volumes(active);
-- Publisher index
CREATE INDEX IF NOT EXISTS idx_volume_publisher ON volumes(publisher);
-- Language index
CREATE INDEX IF NOT EXISTS idx_volume_language ON volumes(language);
-- Composite index for active volumes of a collection
CREATE INDEX IF NOT EXISTS idx_volume_collection_active_number ON volumes(collection_id, active, volume_number);
-- HASH index for UUID equality lookups
CREATE INDEX IF NOT EXISTS idx_volume_id_hash ON volumes(id) USING HASH;

-- =============================================================================
-- TABLE: sections (Book Sections/Chapters Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sections (
    -- Primary Key: UUID with auto-generation
    id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),

    -- Foreign Key to volumes (ON DELETE CASCADE)
    volume_id UUID NOT NULL,

    -- Section number within the volume (1, 2, 3... for chapters)
    section_number INT NOT NULL,

    -- Section type: PROLOGUE, CHAPTER, EPILOGUE, INTERLUDE, AFTERWORD, APPENDIX, OTHER
    section_type VARCHAR(20) NOT NULL DEFAULT 'CHAPTER',

    -- Section title (e.g., "The Boy Who Lived")
    title VARCHAR(500),

    -- Full text content (TEXT for large content)
    content TEXT,

    -- Word count for statistics
    word_count INT,

    -- Page range in physical book
    page_start INT,
    page_end INT,

    -- Soft delete support
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,

    -- Audit timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Active flag
    active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Foreign Key Constraint with CASCADE DELETE
    CONSTRAINT fk_section_volume
        FOREIGN KEY (volume_id)
        REFERENCES volumes(id)
        ON DELETE CASCADE
);

-- Indexes for sections
-- Foreign key index (essential for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_section_volume ON sections(volume_id);
-- Composite index for fetching sections of a volume ordered by section number
-- This is the MOST CRITICAL index for the primary use case
CREATE INDEX IF NOT EXISTS idx_section_volume_number ON sections(volume_id, section_number);
-- Section type index for filtering (e.g., only CHAPTERs)
CREATE INDEX IF NOT EXISTS idx_section_type ON sections(section_type);
-- Composite index for filtering chapters of a volume
CREATE INDEX IF NOT EXISTS idx_section_volume_type_number ON sections(volume_id, section_type, section_number);
-- Deleted flag index
CREATE INDEX IF NOT EXISTS idx_section_deleted ON sections(deleted);
-- Active flag index
CREATE INDEX IF NOT EXISTS idx_section_active ON sections(active);
-- Title index for search
CREATE INDEX IF NOT EXISTS idx_section_title ON sections(title);
-- HASH index for UUID equality lookups
CREATE INDEX IF NOT EXISTS idx_section_id_hash ON sections(id) USING HASH;

-- =============================================================================
-- TRIGGERS: Auto-update updated_at on row changes
-- =============================================================================
-- H2 supports triggers via Java classes or SQL. We use SQL triggers for simplicity.
-- Trigger for collections table
CREATE TRIGGER IF NOT EXISTS trg_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
CALL "org.h2.tools.TriggerAdapter"; -- Placeholder: actual implementation below

-- Since H2 doesn't support inline trigger bodies in standard SQL,
-- we define the trigger logic using CREATE TRIGGER with a Java class
-- or use the built-in SET @updated_at = CURRENT_TIMESTAMP approach.

-- Alternative: Use a trigger class (requires compiled Java class in classpath)
-- For pure SQL approach in H2, we can use the following pattern:

-- Trigger for collections
CREATE TRIGGER IF NOT EXISTS trg_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

-- Trigger for volumes
CREATE TRIGGER IF NOT EXISTS trg_volumes_updated_at
BEFORE UPDATE ON volumes
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

-- Trigger for sections
CREATE TRIGGER IF NOT EXISTS trg_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;

-- =============================================================================
-- REFERENTIAL INTEGRITY ENFORCEMENT
-- =============================================================================
-- Ensure foreign keys are enforced (default in H2)
SET REFERENTIAL_INTEGRITY TRUE;

-- =============================================================================
-- VIEWS FOR COMMON QUERIES (Optional but recommended)
-- =============================================================================

-- View: Active collections with volume count
CREATE VIEW IF NOT EXISTS v_active_collections AS
SELECT
    c.id,
    c.name,
    c.description,
    c.publisher,
    c.publication_date,
    c.language,
    c.total_volumes,
    c.created_at,
    c.updated_at,
    COUNT(v.id) AS actual_volume_count
FROM collections c
LEFT JOIN volumes v ON v.collection_id = c.id AND v.deleted = false
WHERE c.deleted = false
GROUP BY c.id, c.name, c.description, c.publisher, c.publication_date, c.language, c.total_volumes, c.created_at, c.updated_at;

-- View: Active volumes with collection name
CREATE VIEW IF NOT EXISTS v_active_volumes AS
SELECT
    v.id,
    v.collection_id,
    c.name AS collection_name,
    v.volume_number,
    v.title,
    v.isbn,
    v.publisher,
    v.publication_date,
    v.page_count,
    v.language,
    v.cover_image_url,
    v.created_at,
    v.updated_at
FROM volumes v
JOIN collections c ON c.id = v.collection_id
WHERE v.deleted = false AND c.deleted = false;

-- View: Active sections with volume and collection info
CREATE VIEW IF NOT EXISTS v_active_sections AS
SELECT
    s.id,
    s.volume_id,
    v.volume_number,
    v.title AS volume_title,
    c.name AS collection_name,
    s.section_number,
    s.section_type,
    s.title,
    s.content,
    s.word_count,
    s.page_start,
    s.page_end,
    s.created_at,
    s.updated_at
FROM sections s
JOIN volumes v ON v.id = s.volume_id
JOIN collections c ON c.id = v.collection_id
WHERE s.deleted = false AND v.deleted = false AND c.deleted = false;

-- =============================================================================
-- PERFORMANCE ANALYSIS (in comments)
-- =============================================================================
/*
INDEX USAGE EXPLANATION:
-----------------------

1. collections table:
   - idx_collection_name: Supports LIKE '%search%' queries on collection names
   - idx_collection_deleted: Filters soft-deleted records (cardinality: 2 values, but useful for partition pruning)
   - idx_collection_active: Filters active collections
   - idx_collection_id_hash: HASH index for O(1) point lookups by UUID (primary access pattern)
   - idx_collection_active_created: Covers "recent active collections" queries

2. volumes table:
   - idx_volume_collection: FK index for JOIN with collections (essential)
   - idx_volume_collection_number: COMPOSITE index for "get all volumes of collection X ordered by volume_number"
     This enables INDEX-ONLY SCAN for the most common query pattern
   - idx_volume_isbn: UNIQUE index for ISBN lookup and duplicate prevention
   - idx_volume_collection_active_number: Covers "active volumes of collection X ordered by number"

3. sections table:
   - idx_section_volume: FK index for JOIN with volumes (essential)
   - idx_section_volume_number: COMPOSITE index for "get all sections of volume X ordered by section_number"
     This enables INDEX-ONLY SCAN for chapter listing
   - idx_section_volume_type_number: Covers "get all CHAPTERs of volume X ordered by number"

EXPLAIN ANALYZE SIMULATION:
---------------------------

Query 1: Get all volumes of a collection ordered by volume number
  EXPLAIN ANALYZE SELECT * FROM volumes WHERE collection_id = ? AND deleted = false ORDER BY volume_number;
  Expected plan: INDEX SCAN using idx_volume_collection_number (index-only scan possible)
  Cost: ~O(log n) for index seek + O(k) for k matching rows

Query 2: Get all chapters of a volume ordered by chapter number
  EXPLAIN ANALYZE SELECT * FROM sections WHERE volume_id = ? AND section_type = 'CHAPTER' AND deleted = false ORDER BY section_number;
  Expected plan: INDEX SCAN using idx_section_volume_type_number
  Cost: ~O(log n) + O(k)

Query 3: Search collections by partial name
  EXPLAIN ANALYZE SELECT * FROM collections WHERE name LIKE '%Slime%' AND deleted = false;
  Expected plan: INDEX SCAN using idx_collection_name (range scan on LIKE pattern)
  Cost: O(log n) + O(m) where m = matching rows

Query 4: Get most recent volumes across all collections
  EXPLAIN ANALYZE SELECT * FROM volumes WHERE deleted = false ORDER BY created_at DESC LIMIT 20;
  Expected plan: INDEX SCAN using idx_volume_active_created (if created) or full scan + sort
  Note: Consider adding index idx_volume_created_active ON volumes(created_at DESC, deleted, active)
*/

-- =============================================================================
-- H2 CONFIGURATION SUGGESTIONS
-- =============================================================================
/*
CONNECTION URL PARAMETERS FOR PRODUCTION:
-----------------------------------------
jdbc:h2:file:./data/book-collection;MVCC=TRUE;LOCK_TIMEOUT=10000;CACHE_SIZE=65536;PAGE_SIZE=4096;LOG=2;COMPRESS=TRUE

Key Parameters:
- MVCC=TRUE: Enables Multi-Version Concurrency Control (readers don't block writers)
- LOCK_TIMEOUT=10000: 10 second lock timeout (prevents indefinite blocking)
- CACHE_SIZE=65536: 64MB cache (256KB pages * 65536 = 16GB max, but H2 uses what's available)
- PAGE_SIZE=4096: 4KB page size (better for larger databases)
- LOG=2: Enable transaction log (for durability)
- COMPRESS=TRUE: Compress .mv.db file (saves disk space, slight CPU overhead)
- AUTO_SERVER=TRUE: Allow multiple connections from different processes (if needed)

JVM OPTIONS FOR H2:
-------------------
- -Xmx2g: Increase heap for large caches
- -XX:+UseG1GC: Better GC for large heaps

H2-SPECIFIC OPTIMIZATIONS:
--------------------------
1. Use PREPARED statements (JPA/Hibernate does this automatically)
2. Batch inserts for bulk loading: SET WRITE_DELAY 0; (immediate writes) or 100 (batch)
3. For read-heavy workloads: SET CACHE_SIZE 131072 (128MB)
4. Consider partitioning large tables by collection_id using H2's PARTITION BY (experimental)
5. Use TRUNCATE TABLE instead of DELETE for bulk clearing (faster, resets auto-increment)
6. Run ANALYZE periodically to update table statistics for query optimizer

PARTITIONING (if millions of rows):
------------------------------------
-- H2 supports range partitioning (experimental)
-- Example: Partition sections by volume_id ranges
-- CREATE TABLE sections (...) PARTITION BY RANGE(volume_id) (
--   PARTITION p1 VALUES LESS THAN (X'1000...'),
--   PARTITION p2 VALUES LESS THAN (X'2000...'),
--   ...
-- );
-- Note: UUID partitioning requires careful range planning
*/