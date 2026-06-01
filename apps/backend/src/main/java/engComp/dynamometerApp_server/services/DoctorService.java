package engComp.dynamometerApp_server.services;

import engComp.dynamometerApp_server.dto.*;
import engComp.dynamometerApp_server.entities.*;
import engComp.dynamometerApp_server.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class DoctorService {
    private static final Logger logger = Logger.getLogger(DoctorService.class.getName());
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorHasUserRepository doctorHasUserRepository;

    //POST
    public DoctorResponseDTO createDoctor(DoctorCreateDTO dto) {
        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setUserName(dto.getUserName());
        doctor.setEmail(dto.getEmail());
        doctor.setPassword(dto.getPassword());
        return new DoctorResponseDTO(doctorRepository.save(doctor));
    }

    //adiciona vinculo entre o medico e o usuario passados
    public void addUser(String doctorEmail, String userEmail) {
        Doctor doctor = doctorRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Médico não encontrado: " + doctorEmail));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + userEmail));

        if (doctorHasUserRepository.existsByDoctorIdAndUserId(doctor.getId(), user.getId())) {
            throw new RuntimeException("Vínculo já existe entre médico e usuário");
        }

        DoctorHasUser doctorHasUser = new DoctorHasUser();
        doctorHasUser.setDoctor(doctor);
        doctorHasUser.setUser(user);
        doctorHasUser.setStatus("s");

        doctorHasUserRepository.save(doctorHasUser);
    }

    public boolean checkPassword(String rawPassword, String storedPassword) {
<<<<<<< Updated upstream
=======
        if (storedPassword == null) {
            return false;
        }
>>>>>>> Stashed changes
        // Se a senha armazenada começa com "$2a$" ou "$2b$", é um hash BCrypt
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        // Fallback: senha legada em texto puro (migração gradual)
        return rawPassword.equals(storedPassword);
    }

    //PATCH
    public void toggleDoctorHasUserStatus(String doctorEmail, String userEmail) {
        DoctorHasUser doctorHasUser = doctorHasUserRepository
                .findByDoctorEmailAndUserEmail(doctorEmail, userEmail)
                .orElseThrow(() -> new RuntimeException("Vínculo não encontrado"));

        if (doctorHasUser.getStatus().equals("s")) {
            doctorHasUser.setStatus("n");
        } else {
            doctorHasUser.setStatus("s");
        }

        doctorHasUserRepository.save(doctorHasUser);
    }

    public Optional<DoctorResponseDTO> updateDoctor(String email, DoctorUpdateDTO dto) {
        Optional<Doctor> doctorOptional = doctorRepository.findByEmail(email);

        if (doctorOptional.isEmpty()) return Optional.empty();

        Doctor doctor = doctorOptional.get();

        if (dto.getName() != null)     doctor.setName(dto.getName());
        if (dto.getUserName() != null) doctor.setUserName(dto.getUserName());
        if (dto.getEmail() != null)    doctor.setEmail(dto.getEmail());

        return Optional.of(new DoctorResponseDTO(doctorRepository.save(doctor)));
    }

    //GET
    public Optional<Doctor> getDoctorEntityByEmail(String email) {
        return doctorRepository.findByEmail(email);
    }

    public List<UserResponseDTO> getUsersByDoctor(String doctorEmail) {
        if (doctorRepository.findByEmail(doctorEmail).isEmpty()) {
            throw new RuntimeException("Médico não encontrado com email: " + doctorEmail);
        }

<<<<<<< Updated upstream
        return doctorHasUserRepository.findByDoctorEmailAndStatus(doctorEmail, "s")
                .stream()
                .map(dhu -> new UserResponseDTO(dhu.getUser()))
=======
        return doctorHasUserRepository.findByDoctorEmail(doctorEmail)
                .stream()
                .map(dhu -> new UserResponseDTO(dhu.getUser(), dhu.getStatus()))
>>>>>>> Stashed changes
                .toList();
    }

    public List<DoctorHasUserResponseDTO> getDoctorsByUser(String userEmail) {
        if (userRepository.findByEmail(userEmail).isEmpty()) {
            throw new RuntimeException("Usuário não encontrado com email: " + userEmail);
        }

        return doctorHasUserRepository.findByUserEmailAndStatus(userEmail, "s")
                .stream()
                .map(DoctorHasUserResponseDTO::new)
                .toList();
    }
}