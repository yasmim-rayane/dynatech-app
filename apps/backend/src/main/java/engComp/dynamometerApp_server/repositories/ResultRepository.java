package engComp.dynamometerApp_server.repositories;

import engComp.dynamometerApp_server.dto.WeeklyStatsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import engComp.dynamometerApp_server.entities.Result;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result,Integer> {
    @Query("SELECT r FROM Result r WHERE r.user.email = :email ORDER BY r.examDate DESC LIMIT :quantidade")
    List<Result> findLastResults(@Param("email") String email, @Param("quantidade") int quantidade);

    @Query("SELECT r FROM Result r WHERE r.user.email = :email AND r.examDate BETWEEN :d1 AND :d2 ORDER BY r.examDate DESC")
    List<Result> findByEmailAndDateRange(
            @Param("email") String email,
            @Param("d1") LocalDateTime d1,
            @Param("d2") LocalDateTime d2);

    List<Result> findByUserEmailOrderByExamDateDesc(String email);

    @Query("SELECT " +
            "COUNT(r) as count, " +
            "AVG(r.pinchMaxD1) as avgPinchD1, " +
            "AVG(r.pinchMaxD2) as avgPinchD2, " +
            "AVG(r.pinchMaxD3) as avgPinchD3, " +
            "AVG(r.pinchMaxD4) as avgPinchD4, " +
            "AVG(r.pinchMaxE1) as avgPinchE1, " +
            "AVG(r.pinchMaxE2) as avgPinchE2, " +
            "AVG(r.pinchMaxE3) as avgPinchE3, " +
            "AVG(r.pinchMaxE4) as avgPinchE4, " +
            "MAX(r.pinchMaxD1) as maxPinchD1, " +
            "MAX(r.pinchMaxD2) as maxPinchD2, " +
            "MAX(r.pinchMaxD3) as maxPinchD3, " +
            "MAX(r.pinchMaxD4) as maxPinchD4, " +
            "MAX(r.pinchMaxE1) as maxPinchE1, " +
            "MAX(r.pinchMaxE2) as maxPinchE2, " +
            "MAX(r.pinchMaxE3) as maxPinchE3, " +
            "MAX(r.pinchMaxE4) as maxPinchE4, " +
            "AVG(r.palmMaxD) as avgPalmD, " +
            "AVG(r.palmMaxE) as avgPalmE, " +
            "MAX(r.palmMaxD) as maxPalmD, " +
            "MAX(r.palmMaxE) as maxPalmE " +
            "FROM Result r " +
            "WHERE r.user.email = :email " +
            "AND r.examDate >= :startOfWeek AND r.examDate <= :endOfWeek")
    WeeklyStatsProjection findWeeklyStats(
            @Param("email") String email,
            @Param("startOfWeek") LocalDateTime startOfWeek,
            @Param("endOfWeek") LocalDateTime endOfWeek
    );

    @Query("SELECT " +
            "COUNT(r) as count, " +
            "AVG(r.pinchMaxD1) as avgPinchD1, " +
            "AVG(r.pinchMaxD2) as avgPinchD2, " +
            "AVG(r.pinchMaxD3) as avgPinchD3, " +
            "AVG(r.pinchMaxD4) as avgPinchD4, " +
            "AVG(r.pinchMaxE1) as avgPinchE1, " +
            "AVG(r.pinchMaxE2) as avgPinchE2, " +
            "AVG(r.pinchMaxE3) as avgPinchE3, " +
            "AVG(r.pinchMaxE4) as avgPinchE4, " +
            "MAX(r.pinchMaxD1) as maxPinchD1, " +
            "MAX(r.pinchMaxD2) as maxPinchD2, " +
            "MAX(r.pinchMaxD3) as maxPinchD3, " +
            "MAX(r.pinchMaxD4) as maxPinchD4, " +
            "MAX(r.pinchMaxE1) as maxPinchE1, " +
            "MAX(r.pinchMaxE2) as maxPinchE2, " +
            "MAX(r.pinchMaxE3) as maxPinchE3, " +
            "MAX(r.pinchMaxE4) as maxPinchE4, " +
            "AVG(r.palmMaxD) as avgPalmD, " +
            "AVG(r.palmMaxE) as avgPalmE, " +
            "MAX(r.palmMaxD) as maxPalmD, " +
            "MAX(r.palmMaxE) as maxPalmE " +
            "FROM Result r " +
            "WHERE r.user.email = :email " +
            "AND r.examDate >= :startOfMonth AND r.examDate <= :endOfMonth")
    WeeklyStatsProjection findMonthlyStats(
            @Param("email") String email,
            @Param("startOfMonth") LocalDateTime startOfMonth,
            @Param("endOfMonth") LocalDateTime endOfMonth
    );
}
