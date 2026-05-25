package engComp.dynamometerApp_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@EnableScheduling
public class DynamometerAppServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DynamometerAppServerApplication.class, args);
	}

    @Bean
    public CommandLineRunner runAlterTable(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL");
            } catch (Exception e) {
                System.out.println("Aviso ao alterar tabela users: " + e.getMessage());
            }
        };
    }
}
