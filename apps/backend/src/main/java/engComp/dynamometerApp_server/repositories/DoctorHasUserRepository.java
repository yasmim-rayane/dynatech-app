package engComp.dynamometerApp_server.repositories;

import engComp.dynamometerApp_server.entities.DoctorHasUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorHasUserRepository extends JpaRepository<DoctorHasUser, Integer> {
    boolean existsByDoctorIdAndUserId(Integer doctorId, Integer userId);
    List<DoctorHasUser> findByUserEmailAndStatus(String email, String status);
    List<DoctorHasUser> findByDoctorEmailAndStatus(String email, String status);
    List<DoctorHasUser> findByDoctorEmail(String email);
    Optional<DoctorHasUser> findByDoctorEmailAndUserEmail(String doctorEmail, String userEmail);
}