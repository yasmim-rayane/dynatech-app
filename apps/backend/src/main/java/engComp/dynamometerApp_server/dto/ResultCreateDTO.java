package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

//Representa os dados recebidos do frontend

public class ResultCreateDTO {

    @NotBlank(message = "email obrigatório")
    @Email(message = "Email inválido")
    private String email;

    private Double palmMaxD;
    private Double palmMaxE;

    private LocalDateTime examDate;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getPalmMaxD() {
        return palmMaxD;
    }

    public void setPalmMaxD(Double palmMaxD) {
        this.palmMaxD = palmMaxD;
    }

    public Double getPalmMaxE() {
        return palmMaxE;
    }

    public void setPalmMaxE(Double palmMaxE) {
        this.palmMaxE = palmMaxE;
    }

    public LocalDateTime getExamDate() { return examDate; }
    public void setExamDate(LocalDateTime examDate) { this.examDate = examDate; }

}
