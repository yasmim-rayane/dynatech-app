package engComp.dynamometerApp_server.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 90)
    private String name;

    @Column(name = "userName", nullable = false, length = 15, unique = true)
    private String userName;

    @Column(name = "password", nullable = false, length = 12)
    private String password;

    @Column(name = "email", nullable = false, length = 45, unique = true)
    private String email;

    // Getters e Setters
    public Integer getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
