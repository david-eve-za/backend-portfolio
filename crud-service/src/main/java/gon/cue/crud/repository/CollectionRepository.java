package gon.cue.crud.repository;

import gon.cue.crud.model.Collection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionRepository extends BaseRepository<Collection> {

    @Query("SELECT c FROM Collection c WHERE c.name LIKE %:name% AND c.deleted = false")
    List<Collection> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT c FROM Collection c WHERE c.active = :active AND c.deleted = false")
    List<Collection> findByActive(@Param("active") Boolean active);

    @Query("SELECT c FROM Collection c WHERE c.publisher = :publisher AND c.deleted = false")
    List<Collection> findByPublisher(@Param("publisher") String publisher);

    @Query("SELECT c FROM Collection c WHERE c.language = :language AND c.deleted = false")
    List<Collection> findByLanguage(@Param("language") String language);

    @Query("SELECT c FROM Collection c WHERE c.deleted = false ORDER BY c.createdAt DESC")
    List<Collection> findAllOrderedByCreatedAtDesc();

    @Query("SELECT COUNT(c) FROM Collection c WHERE c.deleted = false")
    Long countActive();
}