package engComp.dynamometerApp_server.dto;

public class DoctorResponseDTO {

    private Integer id;
    private String name;
    private String userName;
    private String email;

    public DoctorResponseDTO(engComp.dynamometerApp_server.entities.Doctor doctor) {
        this.id = doctor.getId();
        this.name = doctor.getName();
        this.userName = doctor.getUserName();
        this.email = doctor.getEmail();
    }

    // Getters
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getUserName() { return userName; }
    public String getEmail() { return email; }
}