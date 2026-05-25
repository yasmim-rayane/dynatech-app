package engComp.dynamometerApp_server.controllers;

import engComp.dynamometerApp_server.dto.MonthlyStatsResponseDTO;
import engComp.dynamometerApp_server.dto.ResultCreateDTO;
import engComp.dynamometerApp_server.dto.ResultResponseDTO;
import engComp.dynamometerApp_server.dto.WeeklyStatsResponseDTO;
import engComp.dynamometerApp_server.services.ResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;


@RestController
@RequestMapping("/api/result")
public class ResultController {
    private static final Logger logger = Logger.getLogger(ResultController.class.getName());

    @Autowired
    private ResultService resultService;

    //Métodos GET
    @GetMapping("/all")
    public ResponseEntity<List<ResultResponseDTO>> getAllResults(@RequestParam String email) {
        logger.info("Getting all results for user: " + email);

        List<ResultResponseDTO> results = resultService.getAllResults(email);

        return ResponseEntity.status(HttpStatus.OK).body(results);
    }

    @GetMapping("/getLastX")
    public ResponseEntity<List<ResultResponseDTO>> getLastResults(@RequestParam String email, @RequestParam int quantidade) {
        logger.info("Getting last " + quantidade + " results for user: " + email);

        List<ResultResponseDTO> results = resultService.getLastResults(email, quantidade);

        return ResponseEntity.status(HttpStatus.OK).body(results);
    }

    @GetMapping("/getDateRange")
    public ResponseEntity<List<ResultResponseDTO>> getResultsByDateRange(
            @RequestParam String email,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime d1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)LocalDateTime d2) {
        logger.info("Getting results for user: " + email + " between " + d1 + " and " + d2);

        List<ResultResponseDTO> results = resultService.getResultsByDateRange(email, d1, d2);

        return ResponseEntity.status(HttpStatus.OK).body(results);
    }

    @GetMapping("/weeklyStats")
    public ResponseEntity<List<WeeklyStatsResponseDTO>> getWeeklyStats(@RequestParam String email,
                                                                       @RequestParam int semanas)
    {
        logger.info("Getting last " + semanas + " weeks stats for user: " + email);

        List<WeeklyStatsResponseDTO> stats = resultService.getWeeklyStats(email, semanas);

        return ResponseEntity.status(HttpStatus.OK).body(stats);
    }

    @GetMapping("/monthlyStats")
    public ResponseEntity<List<MonthlyStatsResponseDTO>> getMonthlyStats(
            @RequestParam String email,
            @RequestParam int meses) {

        logger.info("Getting last " + meses + " months stats for user: " + email);
        List<MonthlyStatsResponseDTO> stats = resultService.getMonthlyStats(email, meses);
        return ResponseEntity.status(HttpStatus.OK).body(stats);
    }

    //Métodos POST
    @PostMapping("/create")
    public ResponseEntity<ResultResponseDTO> createResult(@RequestBody @Valid ResultCreateDTO dto) {
        logger.info("Creating new result for user: " + dto.getEmail());

        ResultResponseDTO newResult = resultService.createResult(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(newResult);
    }

    //Métodos DELETE
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteResult(@RequestParam Integer id) {
        logger.info("Deleting result: " + id);
        resultService.deleteResult(id);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
