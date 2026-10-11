package com.classroom.prediction.repository;

import com.classroom.prediction.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findByClassroomId(Long classroomId);

    List<TimetableSlot> findByClassroomIdAndDayOfWeekAndIsActiveTrue(Long classroomId, DayOfWeek dayOfWeek);

    List<TimetableSlot> findByDayOfWeekAndIsActiveTrue(DayOfWeek dayOfWeek);

    @Query("SELECT t FROM TimetableSlot t WHERE t.classroom.id = :classroomId " +
           "AND t.dayOfWeek = :dayOfWeek " +
           "AND t.isActive = true " +
           "AND t.startTime < :endTime AND t.endTime > :startTime")
    List<TimetableSlot> findConflictingTimetableSlots(
            @Param("classroomId") Long classroomId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT t FROM TimetableSlot t WHERE t.isActive = true " +
           "AND (LOWER(t.facultyName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(t.courseName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(t.classroom.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<TimetableSlot> searchTimetable(@Param("query") String query);
}
