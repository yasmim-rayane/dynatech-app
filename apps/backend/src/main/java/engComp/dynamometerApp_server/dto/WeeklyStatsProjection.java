package engComp.dynamometerApp_server.dto;

public interface WeeklyStatsProjection {
    Long getCount();

    Double getAvgPalmD();
    Double getAvgPalmE();
    Double getMaxPalmD();
    Double getMaxPalmE();
}
