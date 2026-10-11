package com.classroom.prediction.config;

import com.classroom.prediction.model.*;
import com.classroom.prediction.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final BookingRepository bookingRepository;
    private final PredictionLogRepository predictionLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already populated. Skipping initialization.");
            return;
        }

        log.info("Starting database seeding with users, classrooms, timetable, and historical booking data...");

        // 1. Seed Users
        User admin = User.builder()
                .name("Campus Administrator")
                .email("admin@campus.edu")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .department("Academic Operations & Facility Management")
                .employeeOrStudentId("ADM-901")
                .build();

        User facultyAlan = User.builder()
                .name("Dr. Alan Turing")
                .email("dr.alan@campus.edu")
                .password(passwordEncoder.encode("Faculty@123"))
                .role(Role.FACULTY)
                .department("Computer Science & AI")
                .employeeOrStudentId("FAC-102")
                .build();

        User facultySarah = User.builder()
                .name("Prof. Sarah Connor")
                .email("prof.sarah@campus.edu")
                .password(passwordEncoder.encode("Faculty@123"))
                .role(Role.FACULTY)
                .department("Robotics & Mechanical Engineering")
                .employeeOrStudentId("FAC-205")
                .build();

        User facultyElena = User.builder()
                .name("Dr. Elena Rostova")
                .email("dr.elena@campus.edu")
                .password(passwordEncoder.encode("Faculty@123"))
                .role(Role.FACULTY)
                .department("Mathematics & Theoretical Physics")
                .employeeOrStudentId("FAC-310")
                .build();

        User student = User.builder()
                .name("Alex Morgan")
                .email("student@campus.edu")
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.STUDENT)
                .department("Computer Science")
                .employeeOrStudentId("STU-8821")
                .build();

        userRepository.saveAll(List.of(admin, facultyAlan, facultySarah, facultyElena, student));

        // 2. Seed Classrooms
        Classroom lh101 = Classroom.builder()
                .roomNumber("A-101")
                .building("Science Block A")
                .floor(1)
                .capacity(120)
                .facilities(new HashSet<>(Arrays.asList("Projector", "Audio system", "Smart board", "Air conditioning", "Accessible seating")))
                .roomType(RoomType.LECTURE_HALL)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom lab204 = Classroom.builder()
                .roomNumber("B-204")
                .building("Computing Center B")
                .floor(2)
                .capacity(45)
                .facilities(new HashSet<>(Arrays.asList("Computers", "Projector", "Air conditioning", "Whiteboard", "High-speed LAN")))
                .roomType(RoomType.LABORATORY)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom sem301 = Classroom.builder()
                .roomNumber("C-301")
                .building("Technology Tower C")
                .floor(3)
                .capacity(80)
                .facilities(new HashSet<>(Arrays.asList("Projector", "Audio system", "Smart board", "Air conditioning", "Accessible seating")))
                .roomType(RoomType.SEMINAR_HALL)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom mr105 = Classroom.builder()
                .roomNumber("A-105")
                .building("Science Block A")
                .floor(1)
                .capacity(20)
                .facilities(new HashSet<>(Arrays.asList("Whiteboard", "Smart board", "Air conditioning")))
                .roomType(RoomType.MEETING_ROOM)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom lh202 = Classroom.builder()
                .roomNumber("B-202")
                .building("Computing Center B")
                .floor(2)
                .capacity(150)
                .facilities(new HashSet<>(Arrays.asList("Projector", "Audio system", "Smart board", "Air conditioning", "Accessible seating")))
                .roomType(RoomType.LECTURE_HALL)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom lab102 = Classroom.builder()
                .roomNumber("C-102")
                .building("Technology Tower C")
                .floor(1)
                .capacity(40)
                .facilities(new HashSet<>(Arrays.asList("Computers", "Air conditioning", "Whiteboard")))
                .roomType(RoomType.LABORATORY)
                .status(RoomStatus.ACTIVE)
                .build();

        Classroom lh305 = Classroom.builder()
                .roomNumber("A-305")
                .building("Science Block A")
                .floor(3)
                .capacity(90)
                .facilities(new HashSet<>(Arrays.asList("Projector", "Whiteboard", "Air conditioning")))
                .roomType(RoomType.LECTURE_HALL)
                .status(RoomStatus.MAINTENANCE)
                .build();

        classroomRepository.saveAll(List.of(lh101, lab204, sem301, mr105, lh202, lab102, lh305));

        // 3. Seed Recurring Timetable Slots
        TimetableSlot slot1 = TimetableSlot.builder()
                .classroom(lh101)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .courseName("CS-301: Advanced Algorithms")
                .facultyName("Dr. Alan Turing")
                .semester("Fall 2026")
                .academicYear("2026-2027")
                .isActive(true)
                .build();

        TimetableSlot slot2 = TimetableSlot.builder()
                .classroom(lh101)
                .dayOfWeek(DayOfWeek.WEDNESDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .courseName("CS-301: Advanced Algorithms")
                .facultyName("Dr. Alan Turing")
                .semester("Fall 2026")
                .academicYear("2026-2027")
                .isActive(true)
                .build();

        TimetableSlot slot3 = TimetableSlot.builder()
                .classroom(lab204)
                .dayOfWeek(DayOfWeek.TUESDAY)
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .courseName("AI-402: Neural Networks & Deep Learning Lab")
                .facultyName("Prof. Sarah Connor")
                .semester("Fall 2026")
                .academicYear("2026-2027")
                .isActive(true)
                .build();

        TimetableSlot slot4 = TimetableSlot.builder()
                .classroom(lh202)
                .dayOfWeek(DayOfWeek.THURSDAY)
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 30))
                .courseName("MATH-201: Multivariable Calculus")
                .facultyName("Dr. Elena Rostova")
                .semester("Fall 2026")
                .academicYear("2026-2027")
                .isActive(true)
                .build();

        timetableSlotRepository.saveAll(List.of(slot1, slot2, slot3, slot4));

        // 4. Seed Historical Bookings (for statistical AI model training & accuracy)
        LocalDate today = LocalDate.now();
        List<Booking> seedBookings = new ArrayList<>();

        // Generate past 8 weeks of historical records
        for (int week = 1; week <= 8; week++) {
            LocalDate pastDate = today.minusWeeks(week);

            // A-101 Monday 14:00 - 16:00
            seedBookings.add(Booking.builder()
                    .classroom(lh101)
                    .faculty(facultyAlan)
                    .bookingDate(pastDate.with(DayOfWeek.MONDAY))
                    .startTime(LocalTime.of(14, 0))
                    .endTime(LocalTime.of(16, 0))
                    .requiredCapacity(100)
                    .requiredFacilities(new HashSet<>(List.of("Projector", "Audio system")))
                    .purpose(BookingPurpose.EXTRA_CLASS)
                    .subjectOrCourse("CS-301: Midterm Review")
                    .status(BookingStatus.COMPLETED)
                    .build());

            // B-204 Tuesday 14:00 - 16:00
            seedBookings.add(Booking.builder()
                    .classroom(lab204)
                    .faculty(facultySarah)
                    .bookingDate(pastDate.with(DayOfWeek.TUESDAY))
                    .startTime(LocalTime.of(14, 0))
                    .endTime(LocalTime.of(16, 0))
                    .requiredCapacity(40)
                    .requiredFacilities(new HashSet<>(List.of("Computers")))
                    .purpose(BookingPurpose.LABORATORY_SESSION)
                    .subjectOrCourse("ROB-305: Hands-on Robotics Lab")
                    .status(BookingStatus.COMPLETED)
                    .build());

            // C-301 Thursday 10:00 - 12:00
            seedBookings.add(Booking.builder()
                    .classroom(sem301)
                    .faculty(facultyElena)
                    .bookingDate(pastDate.with(DayOfWeek.THURSDAY))
                    .startTime(LocalTime.of(10, 0))
                    .endTime(LocalTime.of(12, 0))
                    .requiredCapacity(70)
                    .requiredFacilities(new HashSet<>(List.of("Smart board", "Audio system")))
                    .purpose(BookingPurpose.SEMINAR)
                    .subjectOrCourse("PHYS-401: Quantum Computing Foundations")
                    .status(BookingStatus.COMPLETED)
                    .build());
        }

        // 5. Seed Current & Upcoming Bookings (Today and this week)
        seedBookings.add(Booking.builder()
                .classroom(lh101)
                .faculty(facultyAlan)
                .bookingDate(today)
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 30))
                .requiredCapacity(80)
                .requiredFacilities(new HashSet<>(List.of("Projector", "Audio system")))
                .purpose(BookingPurpose.EXTRA_CLASS)
                .subjectOrCourse("CS-301: Extra Problem Solving Session")
                .notes("Open to all 3rd year CS students")
                .status(BookingStatus.APPROVED)
                .build());

        seedBookings.add(Booking.builder()
                .classroom(sem301)
                .faculty(facultyElena)
                .bookingDate(today.plusDays(1))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .requiredCapacity(60)
                .requiredFacilities(new HashSet<>(List.of("Smart board", "Projector")))
                .purpose(BookingPurpose.WORKSHOP)
                .subjectOrCourse("MATH-399: Applied Cryptography Workshop")
                .notes("Guest lecture included")
                .status(BookingStatus.APPROVED)
                .build());

        seedBookings.add(Booking.builder()
                .classroom(lab204)
                .faculty(facultySarah)
                .bookingDate(today.plusDays(2))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(17, 0))
                .requiredCapacity(35)
                .requiredFacilities(new HashSet<>(List.of("Computers")))
                .purpose(BookingPurpose.LABORATORY_SESSION)
                .subjectOrCourse("AI-402: Project Demo & Evaluations")
                .notes("Demo submissions batch 1")
                .status(BookingStatus.PENDING)
                .build());

        bookingRepository.saveAll(seedBookings);

        // 6. Seed Sample Evaluated Prediction Logs for model tracking dashboard
        PredictionLog log1 = PredictionLog.builder()
                .classroom(lh101)
                .requestedDate(today.minusDays(2))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .predictedAvailability(82.0)
                .confidence("HIGH")
                .explanation("Historical booking analysis of 8 past weeks on Mondays")
                .actualBooked(false)
                .outcomeTracked(true)
                .build();

        PredictionLog log2 = PredictionLog.builder()
                .classroom(lab204)
                .requestedDate(today.minusDays(3))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .predictedAvailability(12.5)
                .confidence("HIGH")
                .explanation("Occupied due to recurring timetable lab slot")
                .actualBooked(true)
                .outcomeTracked(true)
                .build();

        PredictionLog log3 = PredictionLog.builder()
                .classroom(sem301)
                .requestedDate(today.minusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .predictedAvailability(78.5)
                .confidence("MEDIUM")
                .explanation("Mid-morning high demand window with moderate frequency")
                .actualBooked(false)
                .outcomeTracked(true)
                .build();

        predictionLogRepository.saveAll(List.of(log1, log2, log3));

        log.info("Database seeding successfully completed!");
    }
}
