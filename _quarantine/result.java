package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

//Representa os dados recebidos do frontend

public class ResultCreateDTO {

    @NotBlank(message = "email obrigatório")
    @Email(message = "Email inválido")
    private String email;

    private Double pinchMaxD1;
    private Double pinchMaxD2;
    private Double pinchMaxD3;
    private Double pinchMaxD4;
    private Double pinchMaxE1;
    private Double pinchMaxE2;
    private Double pinchMaxE3;
    private Double pinchMaxE4;

    private Double palmMaxD;
    private Double palmMaxE;


    private LocalDateTime examDate;

    @AssertTrue(message = "pinchMax e palmMax não podem ser nulos ao mesmo tempo")
    public boolean isPinchOrPalmValid() {
        //o exame de pinca foi feito?
        boolean isPinchNotNull = pinchMaxD1!=null&&pinchMaxD2!=null&&pinchMaxD3!=null&&pinchMaxD4!=null&&
                                 pinchMaxE1!=null&&pinchMaxE2!=null&&pinchMaxE3!=null&pinchMaxE4!=null;
        //o exame palmar foi feito?
        boolean isPalmNotNull = palmMaxD!=null&&palmMaxE!=null;

        //retorna falso quando ambos forem completamente nulos
        return isPinchNotNull || isPalmNotNull;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getPinchMaxD1() {
        return pinchMaxD1;
    }

    public void setPinchMaxD1(Double pinchMaxD1) {
        this.pinchMaxD1 = pinchMaxD1;
    }

    public Double getPinchMaxD2() {
        return pinchMaxD2;
    }

    public void setPinchMaxD2(Double pinchMaxD2) {
        this.pinchMaxD2 = pinchMaxD2;
    }

    public Double getPinchMaxD3() {
        return pinchMaxD3;
    }

    public void setPinchMaxD3(Double pinchMaxD3) {
        this.pinchMaxD3 = pinchMaxD3;
    }

    public Double getPinchMaxD4() {
        return pinchMaxD4;
    }

    public void setPinchMaxD4(Double pinchMaxD4) {
        this.pinchMaxD4 = pinchMaxD4;
    }

    public Double getPinchMaxE1() {
        return pinchMaxE1;
    }

    public void setPinchMaxE1(Double pinchMaxE1) {
        this.pinchMaxE1 = pinchMaxE1;
    }

    public Double getPinchMaxE2() {
        return pinchMaxE2;
    }

    public void setPinchMaxE2(Double pinchMaxE2) {
        this.pinchMaxE2 = pinchMaxE2;
    }

    public Double getPinchMaxE3() {
        return pinchMaxE3;
    }

    public void setPinchMaxE3(Double pinchMaxE3) {
        this.pinchMaxE3 = pinchMaxE3;
    }

    public Double getPinchMaxE4() {
        return pinchMaxE4;
    }

    public void setPinchMaxE4(Double pinchMaxE4) {
        this.pinchMaxE4 = pinchMaxE4;
    }

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
