package engComp.dynamometerApp_server.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/*
palmMax não é obrigatório, PORÉM AO MENOS 1 DEVE SER INSERIDA
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
