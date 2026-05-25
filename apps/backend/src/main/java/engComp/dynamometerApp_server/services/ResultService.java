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
    //POST
    public ResultResponseDTO createResult(ResultCreateDTO dto) {
        // busca o usuário pelo email
        Optional<User> userOptional = userRepository.findByEmail(dto.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + dto.getEmail());
        }

        Result result = new Result();

        result.setUser(userOptional.get());

        result.setPinchMaxD1(dto.getPinchMaxD1());
        result.setPinchMaxD2(dto.getPinchMaxD2());
        result.setPinchMaxD3(dto.getPinchMaxD3());
        result.setPinchMaxD4(dto.getPinchMaxD4());
        result.setPinchMaxE1(dto.getPinchMaxE1());
        result.setPinchMaxE2(dto.getPinchMaxE2());
        result.setPinchMaxE3(dto.getPinchMaxE3());
        result.setPinchMaxE4(dto.getPinchMaxE4());

        result.setPalmMaxD(dto.getPalmMaxD());
        result.setPalmMaxE(dto.getPalmMaxE());

        result.setExamDate(LocalDateTime.now());

        return new ResultResponseDTO(resultRepository.save(result));
    }

    //DELETE
    public void deleteResult(Integer id) {
        if (!resultRepository.existsById(id)) {
            throw new RuntimeException("Resultado não encontrado com id: " + id);
        }
        resultRepository.deleteById(id);
    }
}