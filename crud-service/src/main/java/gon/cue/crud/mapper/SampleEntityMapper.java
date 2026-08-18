package gon.cue.crud.mapper;

import gon.cue.crud.dto.SampleEntityDto;
import gon.cue.crud.dto.SampleEntityRequest;
import gon.cue.crud.model.SampleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SampleEntityMapper {

    SampleEntityMapper INSTANCE = Mappers.getMapper(SampleEntityMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    SampleEntity toEntity(SampleEntityRequest request);

    SampleEntityDto toDto(SampleEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    SampleEntity updateEntityFromRequest(SampleEntityRequest request, @MappingTarget SampleEntity entity);
}