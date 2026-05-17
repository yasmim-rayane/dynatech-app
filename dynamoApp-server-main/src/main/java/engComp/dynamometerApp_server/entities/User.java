package engComp.dynamometerApp_server.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false,length = 90)
    private String name;

    @Column(name = "username",nullable = false,length = 15,unique = true)
    private String userName;

    @Column(name = "email",nullable = false,unique = true)
    private String email;

    @Column(name = "password",nullable = false,length = 12)
    private String password;

    @Column(name = "dataNascimento",nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "peso",nullable = false)
    private double peso;

    @Column(name = "genero",nullable = false)
    private String genero;

    @Column(name = "altura",nullable = false)
    private int altura;

    @Column(name = "maoDominante", nullable = false)
    private String maoDominante;

    @Column(name = "inativo")
    private String inativo;

    @Column(name = "dataExclusao")
    private LocalDateTime dataExclusao;

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public double getPeso() {
        return peso;
    }

    public void setPeso(double peso) {
        this.peso = peso;
    }

    public int getAltura() {
        return altura;
    }

    public void setAltura(int altura) {
        this.altura = altura;
    }

    public String getMaoDominante() {
        return maoDominante;
    }

    public void setMaoDominante(String maoDominante) {
        this.maoDominante = maoDominante;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public LocalDateTime getDataExclusao() { return dataExclusao; }

    public void setDataExclusao(LocalDateTime dataExclusao) {
        this.dataExclusao = dataExclusao;
    }

    public String getInativo() { return inativo; }

    public void setInativo(String inativo) {
        this.inativo = inativo;
    }
}
