package com.classroom.prediction.service;

import com.classroom.prediction.dto.TimetableSlotDto;
import com.classroom.prediction.dto.TimetableSlotRequest;
import com.classroom.prediction.model.Classroom;
import com.classroom.prediction.model.TimetableSlot;
import com.classroom.prediction.repository.ClassroomRepository;
import com.classroom.prediction.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final ClassroomRepository classroomRepository;

    public List<TimetableSlotDto> getAllSlots() {
        return timetableSlotRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TimetableSlotDto> getSlotsByClassroom(Long classroomId) {
        return timetableSlotRepository.findByClassroomId(classroomId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TimetableSlotDto> searchSlots(String query) {
        if (query == null || query.isBlank()) {
            return getAllSlots();
        }
        return timetableSlotRepository.searchTimetable(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public boolean hasConflictingSlot(Long classroomId, DayOfWeek dayOfWeek, LocalTime start, LocalTime end) {
        List<TimetableSlot> conflicts = timetableSlotRepository.findConflictingTimetableSlots(
                classroomId, dayOfWeek, start, end);
        return !conflicts.isEmpty();
    }

    @Transactional
    public TimetableSlotDto createSlot(TimetableSlotRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));

        if (hasConflictingSlot(classroom.getId(), request.getDayOfWeek(), request.getStartTime(), request.getEndTime())) {
            throw new IllegalArgumentException("Timetable slot conflicts with an existing active schedule");
        }

        TimetableSlot slot = TimetableSlot.builder()
                .classroom(classroom)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .courseName(request.getCourseName().trim())
                .facultyName(request.getFacultyName().trim())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapToDto(timetableSlotRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(Long id) {
        timetableSlotRepository.deleteById(id);
    }

    public TimetableSlotDto mapToDto(TimetableSlot slot) {
        return TimetableSlotDto.builder()
                .id(slot.getId())
                .classroomId(slot.getClassroom().getId())
                .roomNumber(slot.getClassroom().getRoomNumber())
                .building(slot.getClassroom().getBuilding())
                .dayOfWeek(slot.getDayOfWeek())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .courseName(slot.getCourseName())
                .facultyName(slot.getFacultyName())
                .semester(slot.getSemester())
                .academicYear(slot.getAcademicYear())
                .isActive(slot.getIsActive())
                .build();
    }
}
