package com.classroom.prediction.repository;

import com.classroom.prediction.model.Booking;
import com.classroom.prediction.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByFacultyIdOrderByBookingDateDescStartTimeDesc(Long facultyId);

    List<Booking> findByStatusOrderByBookingDateAscStartTimeAsc(BookingStatus status);

    List<Booking> findByBookingDateAndClassroomId(LocalDate bookingDate, Long classroomId);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    @Query("SELECT b FROM Booking b WHERE b.classroom.id = :classroomId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("classroomId") Long classroomId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    @Query("SELECT b FROM Booking b WHERE b.classroom.id = :classroomId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.id <> :excludeBookingId " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookingsExcluding(
            @Param("classroomId") Long classroomId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("excludeBookingId") Long excludeBookingId
    );

    // Student schedule query: approved bookings from a given date onwards
    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.bookingDate >= :startDate " +
           "ORDER BY b.bookingDate ASC, b.startTime ASC")
    List<Booking> findApprovedAllocationsFrom(@Param("startDate") LocalDate startDate);

    // Student filter query by faculty name or department
    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.bookingDate >= :startDate " +
           "AND (LOWER(b.faculty.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(b.faculty.department) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(b.classroom.roomNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY b.bookingDate ASC, b.startTime ASC")
    List<Booking> searchApprovedAllocations(@Param("startDate") LocalDate startDate, @Param("query") String query);

    // Historical bookings for a classroom
    @Query("SELECT b FROM Booking b WHERE b.classroom.id = :classroomId " +
           "AND b.status IN ('APPROVED', 'COMPLETED')")
    List<Booking> findHistoricalBookingsByClassroom(@Param("classroomId") Long classroomId);

    // Count bookings per classroom
    @Query("SELECT b.classroom.id, COUNT(b) FROM Booking b WHERE b.status IN ('APPROVED', 'COMPLETED') GROUP BY b.classroom.id")
    List<Object[]> countBookingsByClassroom();
}
