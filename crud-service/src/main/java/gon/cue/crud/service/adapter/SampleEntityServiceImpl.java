package gon.cue.crud.service.adapter;

import gon.cue.crud.model.SampleEntity;
import gon.cue.crud.repository.SampleEntityRepository;
import gon.cue.crud.service.port.SampleEntityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SampleEntityServiceImpl extends BaseServiceImpl<SampleEntity, SampleEntityRepository>
        implements SampleEntityService {

    private final SampleEntityRepository repository;

    public SampleEntityServiceImpl(SampleEntityRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SampleEntity> findByName(String name) {
        return repository.findByNameActive(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SampleEntity> findByActive(Boolean active) {
        return repository.findByActiveActive(active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SampleEntity> searchByName(String name) {
        return repository.findByNameContainingIgnoreCaseActive(name);
    }
}