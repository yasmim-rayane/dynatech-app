package engComp.dynamometerApp_server.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Handler global de exceções.
 *
 * Captura RuntimeExceptions dos Services (que antes resultavam em HTTP 500
 * com stack trace Java) e retorna respostas JSON limpas com status adequado.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = Logger.getLogger(GlobalExceptionHandler.class.getName());

    /**
     * RuntimeExceptions lançadas pelos Services.
     * Mensagens que contêm "não encontrado" viram 404; as demais, 400.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        logger.warning("RuntimeException capturada: " + ex.getMessage());

        HttpStatus status = ex.getMessage() != null && ex.getMessage().contains("não encontrado")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(errorBody(status, ex.getMessage()));
    }

    /**
     * Erros de validação (@Valid) — retorna lista de campos inválidos.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        logger.warning("Erro de validação: " + ex.getMessage());

        StringBuilder sb = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                sb.append(err.getField()).append(": ").append(err.getDefaultMessage()).append("; ")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errorBody(HttpStatus.BAD_REQUEST, sb.toString()));
    }

    /**
     * Qualquer exceção não tratada — evita expor stack traces.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        logger.severe("Exceção não tratada: " + ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor."));
    }

    private Map<String, Object> errorBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }
}
