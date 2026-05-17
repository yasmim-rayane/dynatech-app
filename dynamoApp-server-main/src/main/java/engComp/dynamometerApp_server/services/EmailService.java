package engComp.dynamometerApp_server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendPasswordResetCode(String toEmail, String code) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("DynaApp - Código de recuperação de senha");
        message.setText("Seu código de recuperação é: " + code + "\n\nEle expira em 25 minutos.");

        mailSender.send(message);
    }
}
