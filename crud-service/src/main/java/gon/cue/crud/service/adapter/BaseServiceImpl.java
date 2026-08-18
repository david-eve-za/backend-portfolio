package gon.cue.crud.service.adapter;

import gon.cue.crud.model.BaseEntity;
import gon.cue.crud.repository.BaseRepository;
import gon.cue.crud.service.port.BaseService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public abstract class BaseServiceImpl<T extends BaseEntity, R extends BaseRepository<T> & JpaRepository<T, Long>>
        implements BaseService<T> {

    protected final R repository;

    protected BaseServiceImpl(R repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<T> findAll() {
        return repository.findAllActive();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<T> findById(Long id) {
        return repository.findByIdActive(id);
    }

    @Override
    @Transactional
    public T save(T entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        repository.softDeleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return repository.findByIdActive(id).isPresent();
    }
}