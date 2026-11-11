package engComp.dynamometerApp_server.repositories;

import engComp.dynamometerApp_server.dto.WeeklyStatsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import engComp.dynamometerApp_server.entities.Result;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result,Integer> {
    @Query("SELECT r FROM Result r WHERE r.user.email = :email ORDER BY r.examDate DESC LIMIT :quantidade")
    List<Result> findLastResults(@Param("email") String email, @Param("quantidade") int quantidade);

    @Query("SELECT r FROM Result r WHERE r.user.email = :email AND r.examDate BETWEEN :d1 AND :d2 ORDER BY r.examDate DESC")
    List<Result> findByEmailAndDateRange(
            @Param("email") String email,
            @Param("d1") LocalDateTime d1,
            @Param("d2") LocalDateTime d2);

    List<Result> findByUserEmailOrderByExamDateDesc(String email);

    List<Result> findByUserIdAndExamDateBetweenOrderByExamDateAsc(int userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT " +
            "COUNT(r) as count, " +
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
