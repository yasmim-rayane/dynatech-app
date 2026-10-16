package engComp.dynamometerApp_server.dto;

import java.time.YearMonth;

public class MonthlyStatsResponseDTO {

    private int month;
    private int year;
    private Long count;
    private Double avgPalmD;
    private Double avgPalmE;
    private Double maxPalmD;
    private Double maxPalmE;

    public MonthlyStatsResponseDTO(WeeklyStatsProjection projection, YearMonth yearMonth) {
        this.month = yearMonth.getMonthValue();
        this.year = yearMonth.getYear();
        this.count = projection.getCount();

        this.avgPalmD = projection.getAvgPalmD();
        this.avgPalmE = projection.getAvgPalmE();

        this.maxPalmD = projection.getMaxPalmD();
        this.maxPalmE = projection.getMaxPalmE();
    }

    // Getters
    public int getMonth() { return month; }
    public int getYear() { return year; }
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