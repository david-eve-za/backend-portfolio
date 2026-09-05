package gon.cue.crud.service.port;

import gon.cue.crud.model.Collection;

import java.util.List;

public interface CollectionService extends BaseService<Collection> {

    List<Collection> searchByName(String name);

    List<Collection> findByActive(Boolean active);

    List<Collection> findAllOrderedByCreatedAtDesc();
}