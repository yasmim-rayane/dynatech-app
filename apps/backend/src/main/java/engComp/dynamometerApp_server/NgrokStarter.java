package engComp.dynamometerApp_server;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NgrokStarter implements ApplicationListener<ApplicationReadyEvent> {

    private Process ngrokProcess;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            String authToken = System.getenv("NGROK_AUTHTOKEN");

            new ProcessBuilder("ngrok", "config", "add-authtoken", authToken)
                    .start()
                    .waitFor();

            ngrokProcess = new ProcessBuilder("ngrok", "http", "--domain=powdering-discharge-washhouse.ngrok-free.dev", "8080")
                    .start();

            System.out.println("ngrok iniciado!");

            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                if (ngrokProcess != null && ngrokProcess.isAlive()) {
                    ngrokProcess.destroy();
                    System.out.println("ngrok encerrado!");
                }
            }));

        } catch (Exception e) {
            System.out.println("Erro ao iniciar ngrok: " + e.getMessage());
        }
    }
}