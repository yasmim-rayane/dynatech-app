package engComp.dynamometerApp_server.dto;

import java.time.LocalDateTime;

//o que é devolvido como resposta ao request do front

public class ResultResponseDTO {
    private int id;
    private Double palmMaxD;
    private Double palmMaxE;
    private LocalDateTime examDate;

    public ResultResponseDTO(engComp.dynamometerApp_server.entities.Result result) {
        this.id = result.getId();
        this.palmMaxD = result.getPalmMaxD();
        this.palmMaxE = result.getPalmMaxE();
        this.examDate = result.getExamDate();
    }

    // Getters
    public int getId() { return id; }
    public Double getPalmMaxD() { return palmMaxD; }
    public Double getPalmMaxE() { return palmMaxE; }
    public LocalDateTime getExamDate() { return examDate; }
}
