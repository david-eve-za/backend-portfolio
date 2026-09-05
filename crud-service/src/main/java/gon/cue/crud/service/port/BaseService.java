package gon.cue.crud.service.port;

import gon.cue.crud.model.BaseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BaseService<T extends BaseEntity> {

    List<T> findAll();

    Optional<T> findById(UUID id);

    T save(T entity);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}