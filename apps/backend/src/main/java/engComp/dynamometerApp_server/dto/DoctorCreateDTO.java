package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.*;

public class DoctorCreateDTO {

    @NotBlank(message = "Nome obrigatório")
    private String name;

    @NotBlank(message = "Username obrigatório")
    private String userName;

    @NotBlank(message = "Email obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha obrigatória")
    @Size(max = 12, message = "Senha deve ter no máximo 12 caracteres")
    private String password;

    // Getters e Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}