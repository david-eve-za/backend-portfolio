package gon.cue.crud.service.port;

import gon.cue.crud.model.SampleEntity;

import java.util.List;
import java.util.Optional;

public interface SampleEntityService extends BaseService<SampleEntity> {

    Optional<SampleEntity> findByName(String name);

    List<SampleEntity> findByActive(Boolean active);

    List<SampleEntity> searchByName(String name);
}