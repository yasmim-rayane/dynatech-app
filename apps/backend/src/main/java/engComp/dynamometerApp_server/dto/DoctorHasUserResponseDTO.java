package engComp.dynamometerApp_server.dto;

public class DoctorHasUserResponseDTO {

    private String doctorName;
    private String doctorEmail;

    public DoctorHasUserResponseDTO(engComp.dynamometerApp_server.entities.DoctorHasUser doctorHasUser) {
        this.doctorName = doctorHasUser.getDoctor().getName();
        this.doctorEmail = doctorHasUser.getDoctor().getEmail();
    }

    // Getters
    public String getDoctorName() { return doctorName; }
    public String getDoctorEmail() { return doctorEmail; }
}