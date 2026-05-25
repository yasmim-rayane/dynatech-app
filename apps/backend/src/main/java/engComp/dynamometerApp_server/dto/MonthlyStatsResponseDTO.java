package engComp.dynamometerApp_server.dto;

import java.time.YearMonth;

public class MonthlyStatsResponseDTO {

    private int month;
    private int year;
    private Long count;
    private Double avgPinchD1;
    private Double avgPinchD2;
    private Double avgPinchD3;
    private Double avgPinchD4;
    private Double avgPinchE1;
    private Double avgPinchE2;
    private Double avgPinchE3;
    private Double avgPinchE4;
    private Double maxPinchD1;
    private Double maxPinchD2;
    private Double maxPinchD3;
    private Double maxPinchD4;
    private Double maxPinchE1;
    private Double maxPinchE2;
    private Double maxPinchE3;
    private Double maxPinchE4;
    private Double avgPalmD;
    private Double avgPalmE;
    private Double maxPalmD;
    private Double maxPalmE;

    public MonthlyStatsResponseDTO(WeeklyStatsProjection projection, YearMonth yearMonth) {
        this.month = yearMonth.getMonthValue();
        this.year = yearMonth.getYear();
        this.count = projection.getCount();

        this.avgPinchD1 = projection.getAvgPinchD1();
        this.avgPinchD2 = projection.getAvgPinchD2();
        this.avgPinchD3 = projection.getAvgPinchD3();
        this.avgPinchD4 = projection.getAvgPinchD4();
        this.avgPinchE1 = projection.getAvgPinchE1();
        this.avgPinchE2 = projection.getAvgPinchE2();
        this.avgPinchE3 = projection.getAvgPinchE3();
        this.avgPinchE4 = projection.getAvgPinchE4();

        this.maxPinchD1 = projection.getMaxPinchD1();
        this.maxPinchD2 = projection.getMaxPinchD2();
        this.maxPinchD3 = projection.getMaxPinchD3();
        this.maxPinchD4 = projection.getMaxPinchD4();
        this.maxPinchE1 = projection.getMaxPinchE1();
        this.maxPinchE2 = projection.getMaxPinchE2();
        this.maxPinchE3 = projection.getMaxPinchE3();
        this.maxPinchE4 = projection.getMaxPinchE4();

        this.avgPalmD = projection.getAvgPalmD();
        this.avgPalmE = projection.getAvgPalmE();

        this.maxPalmD = projection.getMaxPalmD();
        this.maxPalmE = projection.getMaxPalmE();
    }

    // Getters
    public int getMonth() { return month; }
    public int getYear() { return year; }
    public Long getCount() { return count; }

    public Double getAvgPinchD1() {
        return avgPinchD1;
    }

    public Double getAvgPinchD2() {
        return avgPinchD2;
    }

    public Double getAvgPinchD3() {
        return avgPinchD3;
    }

    public Double getAvgPinchD4() {
        return avgPinchD4;
    }

    public Double getAvgPinchE1() {
        return avgPinchE1;
    }

    public Double getAvgPinchE2() {
        return avgPinchE2;
    }

    public Double getAvgPinchE3() {
        return avgPinchE3;
    }

    public Double getAvgPinchE4() {
        return avgPinchE4;
    }

    public Double getMaxPinchD1() {
        return maxPinchD1;
    }

    public Double getMaxPinchD2() {
        return maxPinchD2;
    }

    public Double getMaxPinchD3() {
        return maxPinchD3;
    }

    public Double getMaxPinchD4() {
        return maxPinchD4;
    }

    public Double getMaxPinchE1() {
        return maxPinchE1;
    }

    public Double getMaxPinchE2() {
        return maxPinchE2;
    }

    public Double getMaxPinchE3() {
        return maxPinchE3;
    }

    public Double getMaxPinchE4() {
        return maxPinchE4;
    }

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