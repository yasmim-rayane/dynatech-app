package engComp.dynamometerApp_server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendPasswordResetCode(String toEmail, String code) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(toEmail);
        helper.setSubject("DynaApp - Código de recuperação de senha");
        helper.setText(buildEmailHtml(code), true); // true = é HTML
        mailSender.send(message);
    }

    private String buildEmailHtml(String code) {
        return """
            <div style="background-color: #f5f5f5; padding: 2rem; font-family: Arial, sans-serif;">
                <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; overflow: hidden;">
    
                    <div style="background: #1a1a2e; padding: 2rem; text-align: center;">
                        <p style="margin: 0; font-size: 20px; font-weight: 500; color: #ffffff; letter-spacing: 1px;">Token de Segurança</p>
                    </div>
    
                    <div style="padding: 2rem 2rem 1.5rem;">
                        <p style="font-size: 14px; color: #666666; line-height: 1.7; margin: 0 0 1.5rem;">
                        Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar. Se não foi você, ignore este email.
                        </p>
    
                        <div style="background: #f5f5f5; border-radius: 8px; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                            <p style="font-size: 38px; font-weight: 500; letter-spacing: 12px; color: #222222; margin: 0; font-family: monospace;">%s</p>
                        </div>
    
                        <div style="background: #fff8e1; border-radius: 8px; padding: 0.75rem 1rem; text-align: center;">
                            <p style="font-size: 13px; color: #b45309; margin: 0;">Este código expira em <strong>3 minutos</strong>.</p>
                        </div>
                    </div>
    
                    <div style="border-top: 1px solid #e0e0e0; padding: 1rem 2rem; text-align: center;">
                        <p style="font-size: 12px; color: #aaaaaa; margin: 0;">Este é um email automático — não responda.</p>
                    </div>
                </div>
            </div>
        """.formatted(code);
    }
}
