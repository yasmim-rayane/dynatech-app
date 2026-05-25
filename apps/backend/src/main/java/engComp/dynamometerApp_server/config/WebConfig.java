package engComp.dynamometerApp_server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuração global de CORS.
 *
 * Em desenvolvimento o Vite roda em localhost:5173 e faz proxy para 8080.
 * Em produção (Capacitor / Android) a origem é "https://localhost" ou
 * "capacitor://localhost", então ambas devem ser permitidas.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",       // Vite dev server
                        "http://localhost:4173",       // Vite preview
                        "https://localhost",           // Capacitor Android (https scheme)
                        "capacitor://localhost",       // Capacitor iOS
                        "http://localhost"             // Fallback
                )
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
