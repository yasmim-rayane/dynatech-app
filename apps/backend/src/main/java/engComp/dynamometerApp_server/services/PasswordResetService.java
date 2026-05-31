package engComp.dynamometerApp_server.services;

import engComp.dynamometerApp_server.entities.PasswordResetToken;
import engComp.dynamometerApp_server.repositories.DoctorRepository;
import engComp.dynamometerApp_server.repositories.PasswordResetTokenRepository;
import engComp.dynamometerApp_server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.logging.Logger;

@Service
public class PasswordResetService {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DoctorRepository doctorRepository;

    private static final Logger logger = Logger.getLogger(PasswordResetService.class.getName());

    // Gerar Código e Enviar
    @Transactional
    public void sendResetCode(String email) {
        //email existe?
        boolean isUser = userRepository.findByEmail(email).isPresent();
        boolean isDoctor = doctorRepository.findByEmail(email).isPresent();

        if (!isUser && !isDoctor) {
            throw new RuntimeException("Email não encontrado: " + email);
        }

        // deleta token se já existe token para o email passado
        tokenRepository.deleteByEmail(email);

        // Gerar codigo
        String code = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(3));

        tokenRepository.save(token);

        try {
            emailService.sendPasswordResetCode(email, code);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage());
        }
    }

    // Validar Codigo para determinado email
    public boolean validateCode(String email, String code) {
        //codigo foi enviado?
        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByEmail(email);

        if (tokenOptional.isEmpty()) return false;

        PasswordResetToken token = tokenOptional.get();

        // verifica se o código está correto e não expirou <- !!!
        return token.getCode().equals(code) &&
                token.getExpiresAt().isAfter(LocalDateTime.now());
    }

    // Mudar senha
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        if (!validateCode(email, code)) {
            throw new RuntimeException("Código inválido ou expirado");
        }

        //User
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPassword(newPassword);
            userRepository.save(user);
        });

        //Doctor
        doctorRepository.findByEmail(email).ifPresent(doctor -> {
            doctor.setPassword(newPassword);
            doctorRepository.save(doctor);
        });

        tokenRepository.deleteByEmail(email);
    }

    @Transactional
    @Scheduled(fixedRate = 60000) //intervalo para delecao de tokens
    public void deleteExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        logger.info("Tokens expirados deletados: " + LocalDateTime.now());
    }
}
