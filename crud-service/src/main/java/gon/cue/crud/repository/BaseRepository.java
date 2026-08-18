package gon.cue.crud.repository;

import gon.cue.crud.model.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BaseRepository<T extends BaseEntity> extends JpaRepository<T, Long> {

    @Query("SELECT e FROM #{#entityName} e WHERE e.deleted = false")
    List<T> findAllActive();

    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.deleted = false")
    Optional<T> findByIdActive(@Param("id") Long id);

    @Query("UPDATE #{#entityName} e SET e.deleted = true, e.updatedAt = CURRENT_TIMESTAMP WHERE e.id = :id")
    void softDeleteById(@Param("id") Long id);
}