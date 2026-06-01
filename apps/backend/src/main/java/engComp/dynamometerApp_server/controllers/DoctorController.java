package engComp.dynamometerApp_server.controllers;

import engComp.dynamometerApp_server.dto.*;
import engComp.dynamometerApp_server.entities.Doctor;
import engComp.dynamometerApp_server.entities.User;
import engComp.dynamometerApp_server.services.DoctorService;
import engComp.dynamometerApp_server.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import engComp.dynamometerApp_server.dto.DoctorHasUserResponseDTO;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {
    private static final Logger logger = Logger.getLogger(DoctorController.class.getName());

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;

    //GET
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorHasUserResponseDTO>> getDoctorsByUser(@RequestParam String email) {
        logger.info("Getting doctors for user: " + email);
        return ResponseEntity.ok(doctorService.getDoctorsByUser(email));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getUsersByDoctor(@RequestParam String email) {
        logger.info("Getting users for doctor: " + email);
        return ResponseEntity.ok(doctorService.getUsersByDoctor(email));
    }

    //POST
    @PostMapping("/create")
    public ResponseEntity<DoctorResponseDTO> createDoctor(@RequestBody @Valid DoctorCreateDTO dto) {
        logger.info("Creating new doctor");
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createDoctor(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<Void> loginDoctor(@RequestParam String email, @RequestParam String password) {
        logger.info("Doctor login");

        Optional<Doctor> doctorOptional = doctorService.getDoctorEntityByEmail(email);

        if (doctorOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!doctorService.checkPassword(password, doctorOptional.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/toggleStatus")
    public ResponseEntity<Void> toggleStatus(
            @RequestParam String doctorEmail,
            @RequestParam String userEmail) {
        logger.info("Toggling status for doctor: " + doctorEmail + " and user: " + userEmail);
        doctorService.toggleDoctorHasUserStatus(doctorEmail, userEmail);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/addUser")
    public ResponseEntity<Void> addUser(
            @RequestParam String doctorEmail,
            @RequestParam String userEmail) {
        logger.info("Adding user " + userEmail + " to doctor " + doctorEmail);
        doctorService.addUser(doctorEmail, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    //PATCH
    @PatchMapping
    public ResponseEntity<DoctorResponseDTO> updateDoctor(
            @RequestParam String email,
            @RequestBody @Valid DoctorUpdateDTO dto) {
        logger.info("Updating doctor: " + email);
        return doctorService.updateDoctor(email, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}