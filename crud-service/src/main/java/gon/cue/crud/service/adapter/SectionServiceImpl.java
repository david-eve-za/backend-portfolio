package gon.cue.crud.service.adapter;

import gon.cue.crud.model.Section;
import gon.cue.crud.model.Section.SectionType;
import gon.cue.crud.repository.SectionRepository;
import gon.cue.crud.service.port.SectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SectionServiceImpl extends BaseServiceImpl<Section, SectionRepository>
        implements SectionService {

    public SectionServiceImpl(SectionRepository repository) {
        super(repository);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Section> findByVolumeIdOrderBySectionNumber(UUID volumeId) {
        return repository.findByVolumeIdOrderBySectionNumber(volumeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Section> findByVolumeIdAndType(UUID volumeId, SectionType type) {
        return repository.findByVolumeIdAndSectionType(volumeId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Section> searchByTitle(String title) {
        return repository.findByTitleContainingIgnoreCase(title);
    }
}