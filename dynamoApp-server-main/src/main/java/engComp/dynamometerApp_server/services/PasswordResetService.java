package engComp.dynamometerApp_server.services;

import engComp.dynamometerApp_server.entities.PasswordResetToken;
import engComp.dynamometerApp_server.repositories.PasswordResetTokenRepository;
import engComp.dynamometerApp_server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Gerar Código e Enviar
    @Transactional
    public void sendResetCode(String email) {
        //email existe?
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        // deleta token se já existe token para o email passado
        tokenRepository.deleteByEmail(email);

        // Gerar codigo
        String code = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(1));

        tokenRepository.save(token);
        emailService.sendPasswordResetCode(email, code);
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

        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPassword(newPassword);
            userRepository.save(user);
        });

        // deleta o token, pois a operação com ele foi completa
        tokenRepository.deleteByEmail(email);
    }
}
