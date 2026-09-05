package gon.cue.crud.service.adapter;

import gon.cue.crud.model.Volume;
import gon.cue.crud.repository.VolumeRepository;
import gon.cue.crud.service.port.VolumeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VolumeServiceImpl extends BaseServiceImpl<Volume, VolumeRepository>
        implements VolumeService {

    public VolumeServiceImpl(VolumeRepository repository) {
        super(repository);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Volume> findByCollectionIdOrderByVolumeNumber(UUID collectionId) {
        return repository.findByCollectionIdOrderByVolumeNumber(collectionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Volume> findAllOrderedByCreatedAtDesc() {
        return repository.findAllOrderedByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Volume> searchByTitle(String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Volume> findByIsbn(String isbn) {
        return repository.findByIsbn(isbn);
    }
}