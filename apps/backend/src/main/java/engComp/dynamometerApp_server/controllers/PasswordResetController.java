package engComp.dynamometerApp_server.controllers;

import engComp.dynamometerApp_server.services.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/token")
public class PasswordResetController {
    private static final Logger logger = Logger.getLogger(PasswordResetController.class.getName());

    @Autowired
    private PasswordResetService passwordResetService;

    // Enviar Codigo
    @PostMapping("/sendCode")
    public ResponseEntity<Void> sendCode(@RequestParam String email) {
        logger.info("Sending reset code to: " + email);

        passwordResetService.sendResetCode(email);

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    // Validar Codigo
    @PostMapping("/validateCode")
    public ResponseEntity<Void> validateCode(
            @RequestParam String email,
            @RequestParam String code) {
        logger.info("Validating reset code for: " + email);

        boolean valid = passwordResetService.validateCode(email, code);

        if (!valid) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    // Redefinir senha
    @PostMapping("/resetPassword")
    public ResponseEntity<Void> resetPassword(  @RequestParam String email,
                                                @RequestParam String code,
                                                @RequestParam String newPassword) {
        logger.info("Resetting password for: " + email);

        passwordResetService.resetPassword(email, code, newPassword);

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
