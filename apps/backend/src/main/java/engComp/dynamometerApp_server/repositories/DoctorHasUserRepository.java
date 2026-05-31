package engComp.dynamometerApp_server.repositories;

import engComp.dynamometerApp_server.entities.DoctorHasUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorHasUserRepository extends JpaRepository<DoctorHasUser, Integer> {
    boolean existsByDoctorIdAndUserId(Integer doctorId, Integer userId);
    List<DoctorHasUser> findByUserEmail(String email);
    List<DoctorHasUser> findByDoctorEmail(String email);
}