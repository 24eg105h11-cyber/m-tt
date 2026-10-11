package com.classroom.prediction.controller;

import com.classroom.prediction.dto.BookingApprovalRequest;
import com.classroom.prediction.dto.BookingDto;
import com.classroom.prediction.dto.BookingRequest;
import com.classroom.prediction.model.Role;
import com.classroom.prediction.model.User;
import com.classroom.prediction.service.AuthService;
import com.classroom.prediction.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDto created = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUserEntity(userDetails.getUsername());
        return ResponseEntity.ok(bookingService.getFacultyBookings(user.getId()));
    }

    @GetMapping("/public/allocations")
    public ResponseEntity<List<BookingDto>> getPublicAllocations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String query) {
        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(bookingService.searchApprovedAllocations(date, query));
        }
        return ResponseEntity.ok(bookingService.getPublicApprovedAllocations(date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDto> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingApprovalRequest request) {
        if (request == null) {
            request = new BookingApprovalRequest(com.classroom.prediction.model.BookingStatus.APPROVED, null);
        } else {
            request.setStatus(com.classroom.prediction.model.BookingStatus.APPROVED);
        }
        return ResponseEntity.ok(bookingService.approveOrRejectBooking(id, request));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDto> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingApprovalRequest request) {
        if (request == null) {
            request = new BookingApprovalRequest(com.classroom.prediction.model.BookingStatus.REJECTED, "Rejected by administrator");
        } else {
            request.setStatus(com.classroom.prediction.model.BookingStatus.REJECTED);
        }
        return ResponseEntity.ok(bookingService.approveOrRejectBooking(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUserEntity(userDetails.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getEmail(), isAdmin));
    }
}
