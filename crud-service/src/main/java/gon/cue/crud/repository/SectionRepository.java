package gon.cue.crud.repository;

import gon.cue.crud.model.Section;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionRepository extends BaseRepository<Section> {

    @Query("SELECT s FROM Section s WHERE s.volume.id = :volumeId AND s.deleted = false ORDER BY s.sectionNumber ASC")
    List<Section> findByVolumeIdOrderBySectionNumber(@Param("volumeId") UUID volumeId);

    @Query("SELECT s FROM Section s WHERE s.volume.id = :volumeId AND s.sectionNumber = :sectionNumber AND s.deleted = false")
    Optional<Section> findByVolumeIdAndSectionNumber(@Param("volumeId") UUID volumeId, @Param("sectionNumber") Integer sectionNumber);

    @Query("SELECT s FROM Section s WHERE s.volume.id = :volumeId AND s.sectionType = :sectionType AND s.deleted = false ORDER BY s.sectionNumber ASC")
    List<Section> findByVolumeIdAndSectionType(@Param("volumeId") UUID volumeId, @Param("sectionType") Section.SectionType sectionType);

    @Query("SELECT s FROM Section s WHERE s.title LIKE %:title% AND s.deleted = false")
    List<Section> findByTitleContainingIgnoreCase(@Param("title") String title);

    @Query("SELECT s FROM Section s WHERE s.active = :active AND s.deleted = false")
    List<Section> findByActive(@Param("active") Boolean active);

    @Query("SELECT COUNT(s) FROM Section s WHERE s.volume.id = :volumeId AND s.deleted = false")
    Long countByVolumeId(@Param("volumeId") UUID volumeId);

    @Query("SELECT MAX(s.sectionNumber) FROM Section s WHERE s.volume.id = :volumeId AND s.sectionType = 'CHAPTER' AND s.deleted = false")
    Integer findMaxChapterNumberByVolumeId(@Param("volumeId") UUID volumeId);

    @Query("SELECT SUM(s.wordCount) FROM Section s WHERE s.volume.id = :volumeId AND s.deleted = false")
    Long sumWordCountByVolumeId(@Param("volumeId") UUID volumeId);
}