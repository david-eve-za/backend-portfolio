package gon.cue.crud.service.port;

import gon.cue.crud.model.Section;
import gon.cue.crud.model.Section.SectionType;

import java.util.List;
import java.util.UUID;

public interface SectionService extends BaseService<Section> {

    List<Section> findByVolumeIdOrderBySectionNumber(UUID volumeId);

    List<Section> findByVolumeIdAndType(UUID volumeId, SectionType type);

    List<Section> searchByTitle(String title);
}