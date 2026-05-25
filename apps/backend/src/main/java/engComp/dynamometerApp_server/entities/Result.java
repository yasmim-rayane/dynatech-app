package engComp.dynamometerApp_server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/*
pinchMax e palmMax não são obrigatórios, PORÉM AO MENOS 1 DEVE SER INSERIDA
*/

@Entity
@Table(name = "results")
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "userId",nullable = false)
    private User user;

    @Column(name = "pinchMaxD1")
    private Double pinchMaxD1;

    @Column(name = "pinchMaxD2")
    private Double pinchMaxD2;

    @Column(name = "pinchMaxD3")
    private Double pinchMaxD3;

    @Column(name = "pinchMaxD4")
    private Double pinchMaxD4;

    @Column(name = "pinchMaxE1")
    private Double pinchMaxE1;

    @Column(name = "pinchMaxE2")
    private Double pinchMaxE2;

    @Column(name = "pinchMaxE3")
    private Double pinchMaxE3;

    @Column(name = "pinchMaxE4")
    private Double pinchMaxE4;

    @Column(name = "palmMaxD")
    private Double palmMaxD;

    @Column(name = "palmMaxE")
    private Double palmMaxE;

    @Column(name = "examDate",updatable = false)
    private LocalDateTime examDate;

    public int getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

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

    public LocalDateTime getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDateTime examDate) {
        this.examDate = examDate;
    }
}
