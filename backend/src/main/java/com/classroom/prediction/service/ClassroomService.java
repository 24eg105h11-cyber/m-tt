package com.classroom.prediction.service;

import com.classroom.prediction.dto.ClassroomDto;
import com.classroom.prediction.dto.ClassroomRequest;
import com.classroom.prediction.model.Classroom;
import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import com.classroom.prediction.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;

    public List<ClassroomDto> getAllClassrooms(RoomStatus status, String building, RoomType roomType, Integer minCapacity) {
        return classroomRepository.findAll().stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> building == null || building.isBlank() || c.getBuilding().equalsIgnoreCase(building.trim()))
                .filter(c -> roomType == null || c.getRoomType() == roomType)
                .filter(c -> minCapacity == null || c.getCapacity() >= minCapacity)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClassroomDto getClassroomById(Long id) {
        Classroom c = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
        return mapToDto(c);
    }

    public Classroom getClassroomEntity(Long id) {
        return classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
    }

    @Transactional
    public ClassroomDto createClassroom(ClassroomRequest request) {
        if (classroomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new IllegalArgumentException("Room number " + request.getRoomNumber() + " already exists");
        }

        Classroom classroom = Classroom.builder()
                .roomNumber(request.getRoomNumber().trim())
                .building(request.getBuilding().trim())
                .floor(request.getFloor())
                .capacity(request.getCapacity())
                .facilities(request.getFacilities() != null ? request.getFacilities() : new HashSet<>())
                .roomType(request.getRoomType())
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.ACTIVE)
                .build();

        return mapToDto(classroomRepository.save(classroom));
    }

    @Transactional
    public ClassroomDto updateClassroom(Long id, ClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));

        if (!classroom.getRoomNumber().equalsIgnoreCase(request.getRoomNumber()) &&
                classroomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new IllegalArgumentException("Room number " + request.getRoomNumber() + " already in use");
        }

        classroom.setRoomNumber(request.getRoomNumber().trim());
        classroom.setBuilding(request.getBuilding().trim());
        classroom.setFloor(request.getFloor());
        classroom.setCapacity(request.getCapacity());
        if (request.getFacilities() != null) {
            classroom.setFacilities(request.getFacilities());
        }
        classroom.setRoomType(request.getRoomType());
        if (request.getStatus() != null) {
            classroom.setStatus(request.getStatus());
        }

        return mapToDto(classroomRepository.save(classroom));
    }

    @Transactional
    public ClassroomDto updateStatus(Long id, RoomStatus status) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
        classroom.setStatus(status);
        return mapToDto(classroomRepository.save(classroom));
    }

    @Transactional
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
        classroomRepository.delete(classroom);
    }

    public List<String> getBuildings() {
        return classroomRepository.findDistinctBuildings();
    }

    public ClassroomDto mapToDto(Classroom c) {
        return ClassroomDto.builder()
                .id(c.getId())
                .roomNumber(c.getRoomNumber())
                .building(c.getBuilding())
                .floor(c.getFloor())
                .capacity(c.getCapacity())
                .facilities(c.getFacilities())
                .roomType(c.getRoomType())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
