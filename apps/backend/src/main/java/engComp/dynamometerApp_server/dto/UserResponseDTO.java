package engComp.dynamometerApp_server.dto;

import engComp.dynamometerApp_server.entities.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

//Representa como os dados do usuário retornados (permitidos/não sensíveis) à request

public class UserResponseDTO {
    private Integer id;
    private String name;
    private String username;
    private LocalDate dataNascimento;
    private String email;
    private Double peso;
    private String genero;
    private Integer altura;
    private String maoDominante;
    private String inativo;
    private LocalDateTime dataExclusao;

    //Construtor
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.username = user.getUserName();
        this.dataNascimento = user.getDataNascimento();
        this.email = user.getEmail();
        this.peso = user.getPeso();
        this.genero = user.getGenero();
        this.altura = user.getAltura();
        this.maoDominante = user.getMaoDominante();
        this.inativo = user.getInativo();
        this.dataExclusao = user.getDataExclusao();
    }

    //Getters
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getUsername() { return username; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public String getEmail() { return email; }
    public Double getPeso() { return peso; }
    public String getGenero() { return genero; }
    public Integer getAltura() { return altura; }
    public String getMaoDominante() { return maoDominante; }
    public String getInativo() { return inativo; }
    public LocalDateTime getDataExclusao() { return dataExclusao; }
}
