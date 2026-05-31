package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.Email;

public class DoctorUpdateDTO {

    private String name;
    private String userName;

    @Email(message = "Email inválido")
    private String email;

    // Getters e Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}