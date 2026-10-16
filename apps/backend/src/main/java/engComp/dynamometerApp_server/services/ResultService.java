package engComp.dynamometerApp_server.services;

import engComp.dynamometerApp_server.dto.*;
import engComp.dynamometerApp_server.entities.Result;
import engComp.dynamometerApp_server.entities.User;
import engComp.dynamometerApp_server.repositories.ResultRepository;
import engComp.dynamometerApp_server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class ResultService {
    private static final Logger logger = Logger.getLogger(ResultService.class.getName());

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    //GET
    public List<ResultResponseDTO> getLastResults(String email, int quantidade) {
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        return resultRepository.findLastResults(email, quantidade)
                .stream()
                .map(ResultResponseDTO::new)
                .toList();
    }

    public List<ResultResponseDTO> getResultsByDateRange(String email, LocalDateTime d1, LocalDateTime d2) {
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        return resultRepository.findByEmailAndDateRange(email, d1, d2)
                .stream()
                .map(ResultResponseDTO::new)
                .toList();
    }

    public List<ResultResponseDTO> getAllResults(String email) {
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        return resultRepository.findByUserEmailOrderByExamDateDesc(email)
                .stream()
                .map(ResultResponseDTO::new)
                .toList();
    }

    public List<WeeklyStatsResponseDTO> getWeeklyStats(String email, int semanas) {
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        List<WeeklyStatsResponseDTO> resultado = new ArrayList<>();

        //Gera uma lista com as estatisticas das ultimas X semanas (x = ao param "semanas")
        for (int i = 0; i < semanas; i++) {
            LocalDate weekStart = LocalDate.now()
                    .minusWeeks(i)
                    .with(DayOfWeek.MONDAY);

            LocalDate weekEnd = weekStart.with(DayOfWeek.SUNDAY);

            WeeklyStatsProjection projection = resultRepository.findWeeklyStats(
                    email,
                    weekStart.atStartOfDay(),
                    weekEnd.atTime(23, 59, 59)
            );

            if(projection.getCount()>0){
                resultado.add(new WeeklyStatsResponseDTO(projection, weekStart, weekEnd));
            }
        }

        return resultado;
    }

    public List<MonthlyStatsResponseDTO> getMonthlyStats(String email, int meses) {
        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + email);
        }

        List<MonthlyStatsResponseDTO> resultado = new ArrayList<>();

        for (int i = 0; i < meses; i++) {
            YearMonth yearMonth = YearMonth.now().minusMonths(i);

            LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);

            WeeklyStatsProjection projection = resultRepository.findMonthlyStats(
                    email,
                    startOfMonth,
                    endOfMonth
            );

            //Só retorna as stats do mes se count > 0
            if (projection.getCount()>0 ){resultado.add(new MonthlyStatsResponseDTO(projection, yearMonth));}
        }

        return resultado;
    }

    public ResultResponseDTO consolidateDailyResults(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        List<Result> todayResults = resultRepository
                .findByUserIdAndExamDateBetweenOrderByExamDateAsc(user.getId(), startOfDay, endOfDay);

        if (todayResults.isEmpty()) {
            throw new RuntimeException("Nenhum resultado encontrado para hoje");
        }

        // calcula média de cada campo desconsiderando null e 0
        Result consolidated = new Result();
        consolidated.setUser(user);
        consolidated.setExamDate(LocalDateTime.now());

        consolidated.setPalmMaxD(calcAverage(todayResults, Result::getPalmMaxD));
        consolidated.setPalmMaxE(calcAverage(todayResults, Result::getPalmMaxE));

        // deleta todos os registros do dia
        resultRepository.deleteAll(todayResults);

        // salva o registro consolidado
        return new ResultResponseDTO(resultRepository.save(consolidated));
    }

    private Double calcAverage(List<Result> results, java.util.function.Function<Result, Double> getter) {
        List<Double> values = results.stream()
                .map(getter)
                .filter(v -> v != null && v > 0)
                .toList();

        if (values.isEmpty()) return null;

        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    //POST
    public ResultResponseDTO createResult(ResultCreateDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + dto.getEmail()));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        List<Result> todayResults = resultRepository.findByUserIdAndExamDateBetweenOrderByExamDateAsc(
                user.getId(), startOfDay, endOfDay);

        List<Result> availableResults = todayResults.stream()
                .filter(r -> isAvailable(r, dto))
                .toList();

        Result result;
        if (availableResults.isEmpty()) {
            result = new Result();
            result.setUser(user);
            result.setExamDate(LocalDateTime.now());
        } else {
            result = availableResults.get(0);
        }

        if (dto.getPalmMaxD() != null && dto.getPalmMaxD() > 0) result.setPalmMaxD(dto.getPalmMaxD());
        if (dto.getPalmMaxE() != null && dto.getPalmMaxE() > 0) result.setPalmMaxE(dto.getPalmMaxE());

        return new ResultResponseDTO(resultRepository.save(result));
    }

    //DELETE
    public void deleteResult(Integer id) {
        if (!resultRepository.existsById(id)) {
            throw new RuntimeException("Resultado não encontrado com id: " + id);
        }
        resultRepository.deleteById(id);
    }

    private boolean isAvailable(Result r, ResultCreateDTO dto) {
        if (dto.getPalmMaxD() != null && dto.getPalmMaxD() > 0
                && (r.getPalmMaxD() != null && r.getPalmMaxD() > 0)) return false;
        if (dto.getPalmMaxE() != null && dto.getPalmMaxE() > 0
                && (r.getPalmMaxE() != null && r.getPalmMaxE() > 0)) return false;
        return true;
    }
}