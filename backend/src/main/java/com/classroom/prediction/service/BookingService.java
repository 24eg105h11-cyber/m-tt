package com.classroom.prediction.service;

import com.classroom.prediction.dto.BookingApprovalRequest;
import com.classroom.prediction.dto.BookingDto;
import com.classroom.prediction.dto.BookingRequest;
import com.classroom.prediction.model.*;
import com.classroom.prediction.repository.BookingRepository;
import com.classroom.prediction.repository.ClassroomRepository;
import com.classroom.prediction.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final NotificationService notificationService;
    private final AuthService authService;
    private final ClassroomService classroomService;

    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BookingDto> getFacultyBookings(Long facultyId) {
        return bookingRepository.findByFacultyIdOrderByBookingDateDescStartTimeDesc(facultyId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BookingDto> getPublicApprovedAllocations(LocalDate startDate) {
        LocalDate date = startDate != null ? startDate : LocalDate.now();
        return bookingRepository.findApprovedAllocationsFrom(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BookingDto> searchApprovedAllocations(LocalDate startDate, String query) {
        LocalDate date = startDate != null ? startDate : LocalDate.now();
        if (query == null || query.isBlank()) {
            return getPublicApprovedAllocations(date);
        }
        return bookingRepository.searchApprovedAllocations(date, query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + id));
        return mapToDto(booking);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingDto createBooking(BookingRequest request, String facultyEmail) {
        // Step 1: Validate date & time
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book a classroom for a past date");
        }

        if (request.getBookingDate().isEqual(LocalDate.now()) && request.getStartTime().isBefore(LocalTime.now())) {
            throw new IllegalArgumentException("Cannot book for a past time slot today");
        }

        // Step 2: Check classroom exists and is ACTIVE
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));

        if (classroom.getStatus() != RoomStatus.ACTIVE) {
            throw new IllegalStateException("Classroom " + classroom.getRoomNumber() + " is currently " + classroom.getStatus());
        }

        // Step 3: Check capacity and facilities
        if (request.getRequiredCapacity() > classroom.getCapacity()) {
            throw new IllegalArgumentException(String.format(
                    "Requested capacity (%d) exceeds room capacity (%d)",
                    request.getRequiredCapacity(), classroom.getCapacity()));
        }

        if (request.getRequiredFacilities() != null && !request.getRequiredFacilities().isEmpty()) {
            Set<String> roomFacilities = classroom.getFacilities() != null ? classroom.getFacilities() : Set.of();
            Set<String> missing = new HashSet<>(request.getRequiredFacilities());
            missing.removeAll(roomFacilities);
            if (!missing.isEmpty()) {
                throw new IllegalArgumentException("Classroom does not provide requested facilities: " + String.join(", ", missing));
            }
        }

        // Step 4: Detect overlapping approved bookings (Never permit two confirmed bookings to overlap)
        List<Booking> overlappingApproved = bookingRepository.findOverlappingBookings(
                classroom.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                List.of(BookingStatus.APPROVED)
        );

        if (!overlappingApproved.isEmpty()) {
            Booking conflict = overlappingApproved.get(0);
            throw new IllegalStateException(String.format(
                    "Classroom %s is already booked from %s to %s for %s",
                    classroom.getRoomNumber(), conflict.getStartTime(), conflict.getEndTime(), conflict.getSubjectOrCourse()));
        }

        // Also check against recurring timetable classes
        DayOfWeek dayOfWeek = request.getBookingDate().getDayOfWeek();
        List<TimetableSlot> timetableConflicts = timetableSlotRepository.findConflictingTimetableSlots(
                classroom.getId(), dayOfWeek, request.getStartTime(), request.getEndTime());

        if (!timetableConflicts.isEmpty()) {
            TimetableSlot ts = timetableConflicts.get(0);
            throw new IllegalStateException(String.format(
                    "Classroom %s has a scheduled timetable class (%s) from %s to %s",
                    classroom.getRoomNumber(), ts.getCourseName(), ts.getStartTime(), ts.getEndTime()));
        }

        // Step 5: Save booking
        User faculty = authService.getCurrentUserEntity(facultyEmail);

        // Approval workflow: Admin booking auto-approves, or default workflow
        BookingStatus initialStatus = faculty.getRole() == Role.ADMIN ? BookingStatus.APPROVED : BookingStatus.PENDING;

        Booking booking = Booking.builder()
                .classroom(classroom)
                .faculty(faculty)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .requiredCapacity(request.getRequiredCapacity())
                .requiredFacilities(request.getRequiredFacilities() != null ? request.getRequiredFacilities() : new HashSet<>())
                .purpose(request.getPurpose())
                .subjectOrCourse(request.getSubjectOrCourse().trim())
                .notes(request.getNotes())
                .status(initialStatus)
                .build();

        Booking saved = bookingRepository.save(booking);
        BookingDto dto = mapToDto(saved);

        // Notify faculty & broadcast allocation updates
        notificationService.notifyUser(faculty.getEmail(), "BOOKING_CREATED", dto);
        notificationService.broadcastAllocationChange("BOOKING_UPDATE", dto);

        return dto;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingDto approveOrRejectBooking(Long bookingId, BookingApprovalRequest approvalRequest) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (approvalRequest.getStatus() == BookingStatus.APPROVED) {
            // Re-verify no other booking was approved in the meantime
            List<Booking> conflicts = bookingRepository.findOverlappingBookingsExcluding(
                    booking.getClassroom().getId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    List.of(BookingStatus.APPROVED),
                    booking.getId()
            );

            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Cannot approve: Another overlapping booking has already been approved for this time slot.");
            }

            booking.setStatus(BookingStatus.APPROVED);
            booking.setRejectionReason(null);
        } else if (approvalRequest.getStatus() == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(approvalRequest.getRejectionReason());
        } else {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        Booking updated = bookingRepository.save(booking);
        BookingDto dto = mapToDto(updated);

        // Notify faculty of approval/rejection and broadcast update
        notificationService.notifyUser(booking.getFaculty().getEmail(), "BOOKING_STATUS_CHANGED", dto);
        notificationService.broadcastAllocationChange("BOOKING_UPDATE", dto);

        return dto;
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!isAdmin && !booking.getFaculty().getEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalStateException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Booking is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        BookingDto dto = mapToDto(updated);

        notificationService.broadcastAllocationChange("BOOKING_UPDATE", dto);
        return dto;
    }

    public BookingDto mapToDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .classroom(classroomService.mapToDto(b.getClassroom()))
                .faculty(authService.mapToDto(b.getFaculty()))
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .requiredCapacity(b.getRequiredCapacity())
                .requiredFacilities(b.getRequiredFacilities())
                .purpose(b.getPurpose())
                .subjectOrCourse(b.getSubjectOrCourse())
                .notes(b.getNotes())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
