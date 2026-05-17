package engComp.dynamometerApp_server.repositories;

import engComp.dynamometerApp_server.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByEmail(String email);

    void deleteByEmail(String email);
}
