package engComp.dynamometerApp_server.dto;

import java.time.LocalDateTime;

//o que é devolvido como resposta ao request do front

public class ResultResponseDTO {
    private int id;
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

    public ResultResponseDTO(engComp.dynamometerApp_server.entities.Result result) {
        this.id = result.getId();
        this.pinchMaxD1 = result.getPinchMaxD1();
        this.pinchMaxD2 = result.getPinchMaxD2();
        this.pinchMaxD3 = result.getPinchMaxD3();
        this.pinchMaxD4 = result.getPinchMaxD4();
        this.pinchMaxE1 = result.getPinchMaxE1();
        this.pinchMaxE2 = result.getPinchMaxE2();
        this.pinchMaxE3 = result.getPinchMaxE3();
        this.pinchMaxE4 = result.getPinchMaxE4();
        this.palmMaxD = result.getPalmMaxD();
        this.palmMaxE = result.getPalmMaxE();
        this.examDate = result.getExamDate();
    }

    // Getters
    public int getId() { return id; };
    public Double getPinchMaxD1() { return pinchMaxD1; }
    public Double getPinchMaxD2() { return pinchMaxD2; }
    public Double getPinchMaxD3() { return pinchMaxD3; }
    public Double getPinchMaxD4() { return pinchMaxD4; }
    public Double getPinchMaxE1() { return pinchMaxE1; }
    public Double getPinchMaxE2() { return pinchMaxE2; }
    public Double getPinchMaxE3() { return pinchMaxE3; }
    public Double getPinchMaxE4() { return pinchMaxE4; }
    public Double getPalmMaxD() { return palmMaxD; }
    public Double getPalmMaxE() { return palmMaxE; }
    public LocalDateTime getExamDate() { return examDate; }
}
