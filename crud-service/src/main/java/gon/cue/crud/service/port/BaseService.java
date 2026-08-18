package gon.cue.crud.service.port;

import gon.cue.crud.model.BaseEntity;

import java.util.List;
import java.util.Optional;

public interface BaseService<T extends BaseEntity> {

    List<T> findAll();

    Optional<T> findById(Long id);

    T save(T entity);

    void deleteById(Long id);

    boolean existsById(Long id);
}