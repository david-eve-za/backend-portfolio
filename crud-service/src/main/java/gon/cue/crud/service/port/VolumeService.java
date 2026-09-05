package gon.cue.crud.service.port;

import gon.cue.crud.model.Volume;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VolumeService extends BaseService<Volume> {

    List<Volume> findByCollectionIdOrderByVolumeNumber(UUID collectionId);

    List<Volume> findAllOrderedByCreatedAtDesc();

    List<Volume> searchByTitle(String title);

    Optional<Volume> findByIsbn(String isbn);
}