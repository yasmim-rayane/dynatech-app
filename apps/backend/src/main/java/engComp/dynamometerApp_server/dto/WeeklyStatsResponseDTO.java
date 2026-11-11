package engComp.dynamometerApp_server.dto;

import java.time.LocalDate;

public class WeeklyStatsResponseDTO {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private Long count;
    private Double avgPalmD;
    private Double avgPalmE;
    private Double maxPalmD;
    private Double maxPalmE;

    //Constructor
    public WeeklyStatsResponseDTO(WeeklyStatsProjection projection, LocalDate weekStart, LocalDate weekEnd) {
        this.weekStart = weekStart;
        this.weekEnd = weekEnd;
        this.count = projection.getCount();

        this.avgPalmD = projection.getAvgPalmD();
        this.avgPalmE = projection.getAvgPalmE();

        this.maxPalmD = projection.getMaxPalmD();
        this.maxPalmE = projection.getMaxPalmE();
    }

    // Getters
    public LocalDate getWeekStart() { return weekStart; }
    public LocalDate getWeekEnd() { return weekEnd; }
    public Long getCount() { return count; }

    public Double getAvgPalmD() {
        return avgPalmD;
    }

    public Double getAvgPalmE() {
        return avgPalmE;
    }

    public Double getMaxPalmD() {
        return maxPalmD;
    }

    public Double getMaxPalmE() {
        return maxPalmE;
    }
}
