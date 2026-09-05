package gon.cue.crud.service.adapter;

import gon.cue.crud.model.Collection;
import gon.cue.crud.repository.CollectionRepository;
import gon.cue.crud.service.port.CollectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollectionServiceImpl extends BaseServiceImpl<Collection, CollectionRepository>
        implements CollectionService {

    public CollectionServiceImpl(CollectionRepository repository) {
        super(repository);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Collection> searchByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Collection> findByActive(Boolean active) {
        return repository.findByActive(active);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Collection> findAllOrderedByCreatedAtDesc() {
        return repository.findAllOrderedByCreatedAtDesc();
    }
}