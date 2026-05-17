package engComp.dynamometerApp_server.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

//Representa dados recebidos do frontend

public class UserCreateDTO {
    @NotBlank(message = "Nome obrigatório")
    private String name;

    @NotBlank(message = "Username obrigatório")
    private String username;

    @NotNull(message = "Data de nascimento obrigatória")
    private LocalDate dataNascimento;

    @NotBlank(message = "Email obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha obrigatória")
//    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String password;

    @NotNull(message = "Peso obrigatório")
    private Double peso;

    @NotBlank(message = "Gênero obrigatório")
    private String genero;

    @NotNull(message = "Altura obrigatória")
    private Integer altura;

    @NotBlank(message = "Mão dominante obrigatória")
    private String maoDominante;

    private String inativo;
    private LocalDateTime dataExclusao;

    // Getters e Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public Integer getAltura() { return altura; }
    public void setAltura(Integer altura) { this.altura = altura; }

    public String getMaoDominante() { return maoDominante; }
    public void setMaoDominante(String maoDominante){ this.maoDominante = maoDominante; }

    public LocalDateTime getDataExclusao() { return dataExclusao; }
    public void setDataExclusao(LocalDateTime dataExclusao) { this.dataExclusao = dataExclusao; }

    public String getInativo() { return inativo; }
    public void setInativo(String inativo) { this.inativo = inativo; }
}
