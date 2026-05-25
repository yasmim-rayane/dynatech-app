package engComp.dynamometerApp_server.dto;

public interface WeeklyStatsProjection {
    Long getCount();

    Double getAvgPinchD1();
    Double getAvgPinchD2();
    Double getAvgPinchD3();
    Double getAvgPinchD4();
    Double getAvgPinchE1();
    Double getAvgPinchE2();
    Double getAvgPinchE3();
    Double getAvgPinchE4();

    Double getMaxPinchD1();
    Double getMaxPinchD2();
    Double getMaxPinchD3();
    Double getMaxPinchD4();
    Double getMaxPinchE1();
    Double getMaxPinchE2();
    Double getMaxPinchE3();
    Double getMaxPinchE4();

    Double getAvgPalmD();
    Double getAvgPalmE();
    Double getMaxPalmD();
    Double getMaxPalmE();
}
