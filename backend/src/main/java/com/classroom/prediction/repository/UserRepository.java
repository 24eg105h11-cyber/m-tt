package com.classroom.prediction.repository;

import com.classroom.prediction.model.Role;
import com.classroom.prediction.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Role> findByRole(Role role);
    List<User> findAllByRole(Role role);
    List<User> findByRoleAndDepartmentContainingIgnoreCase(Role role, String department);
    List<User> findByRoleAndNameContainingIgnoreCase(Role role, String name);
}
