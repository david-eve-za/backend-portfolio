package gon.cue.crud.repository;

import gon.cue.crud.model.SampleEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SampleEntityRepository extends BaseRepository<SampleEntity> {

    @Query("SELECT e FROM SampleEntity e WHERE e.name = :name AND e.deleted = false")
    Optional<SampleEntity> findByNameActive(@Param("name") String name);

    @Query("SELECT e FROM SampleEntity e WHERE e.active = :active AND e.deleted = false")
    List<SampleEntity> findByActiveActive(@Param("active") Boolean active);

    @Query("SELECT e FROM SampleEntity e WHERE e.name LIKE %:name% AND e.deleted = false")
    List<SampleEntity> findByNameContainingIgnoreCaseActive(@Param("name") String name);
}