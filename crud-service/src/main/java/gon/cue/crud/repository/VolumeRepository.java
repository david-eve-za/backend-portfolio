package gon.cue.crud.repository;

import gon.cue.crud.model.Volume;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolumeRepository extends BaseRepository<Volume> {

    @Query("SELECT v FROM Volume v WHERE v.collection.id = :collectionId AND v.deleted = false ORDER BY v.volumeNumber ASC")
    List<Volume> findByCollectionIdOrderByVolumeNumber(@Param("collectionId") UUID collectionId);

    @Query("SELECT v FROM Volume v WHERE v.collection.id = :collectionId AND v.volumeNumber = :volumeNumber AND v.deleted = false")
    Optional<Volume> findByCollectionIdAndVolumeNumber(@Param("collectionId") UUID collectionId, @Param("volumeNumber") Integer volumeNumber);

    @Query("SELECT v FROM Volume v WHERE v.isbn = :isbn AND v.deleted = false")
    Optional<Volume> findByIsbn(@Param("isbn") String isbn);

    @Query("SELECT v FROM Volume v WHERE v.title LIKE %:title% AND v.deleted = false")
    List<Volume> findByTitleContainingIgnoreCase(@Param("title") String title);

    @Query("SELECT v FROM Volume v WHERE v.active = :active AND v.deleted = false")
    List<Volume> findByActive(@Param("active") Boolean active);

    @Query("SELECT v FROM Volume v WHERE v.deleted = false ORDER BY v.createdAt DESC")
    List<Volume> findAllOrderedByCreatedAtDesc();

    @Query("SELECT COUNT(v) FROM Volume v WHERE v.collection.id = :collectionId AND v.deleted = false")
    Long countByCollectionId(@Param("collectionId") UUID collectionId);

    @Query("SELECT MAX(v.volumeNumber) FROM Volume v WHERE v.collection.id = :collectionId AND v.deleted = false")
    Integer findMaxVolumeNumberByCollectionId(@Param("collectionId") UUID collectionId);
}