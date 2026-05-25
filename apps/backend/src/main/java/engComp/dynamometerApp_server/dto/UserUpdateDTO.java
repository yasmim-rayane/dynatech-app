package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class UserUpdateDTO {
    private String name;
    private String username;
    private LocalDate dataNascimento;

    @Email(message = "Email inválido")
    private String email;

    private Double peso;
    private String genero;
    private Integer altura;
    private String maoDominante;

    // Getters e Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMaoDominante() { return maoDominante; }
    public void setMaoDominante(String maoDominante) { this.maoDominante = maoDominante; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public Integer getAltura() { return altura; }
    public void setAltura(Integer altura) { this.altura = altura; }
}
