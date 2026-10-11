package com.classroom.prediction.repository;

import com.classroom.prediction.model.Classroom;
import com.classroom.prediction.model.RoomStatus;
import com.classroom.prediction.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long>, JpaSpecificationExecutor<Classroom> {
    Optional<Classroom> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);

    List<Classroom> findByStatus(RoomStatus status);
    List<Classroom> findByBuildingIgnoreCase(String building);
    List<Classroom> findByRoomType(RoomType roomType);
    List<Classroom> findByCapacityGreaterThanEqual(Integer capacity);

    @Query("SELECT DISTINCT c.building FROM Classroom c ORDER BY c.building")
    List<String> findDistinctBuildings();
}
