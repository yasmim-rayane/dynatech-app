package engComp.dynamometerApp_server.services;

import engComp.dynamometerApp_server.dto.UserUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import engComp.dynamometerApp_server.dto.UserCreateDTO;
import engComp.dynamometerApp_server.dto.UserResponseDTO;
import engComp.dynamometerApp_server.entities.User;
import engComp.dynamometerApp_server.repositories.UserRepository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Optional;
import java.util.logging.Logger;

import java.util.logging.Logger;

@Service
public class UserService {
    private static final Logger logger = Logger.getLogger(UserService.class.getName());

    @Autowired
    private UserRepository userRepository;

    //GET request methods
    public Optional<UserResponseDTO> getUserById(int userId) {
        logger.info("Getting the user by Id: " + userId);

        //se usuário encontrado -> ele é retornado como uma instancia do DTO correspondente no Optional
        return userRepository.findById(userId)
                .map(UserResponseDTO::new);
    }

    public Optional<UserResponseDTO> getUserByEmail(String email) {
        logger.info("Getting the user by email: " + email);

        return userRepository.findByEmail(email)
                .map(UserResponseDTO::new);
    }

    public Optional<User> getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    //POST request methods
    public UserResponseDTO createUser(UserCreateDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setUserName(dto.getUsername());
        user.setDataNascimento(dto.getDataNascimento());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setAltura(dto.getAltura());
        user.setPeso(dto.getPeso());
        user.setGenero(dto.getGenero());
        user.setMaoDominante(dto.getMaoDominante());
        user.setInativo(null);
        user.setDataExclusao(null);

        return new UserResponseDTO(userRepository.save(user));
    }

    //PATCH request methods
    public Optional<UserResponseDTO> toggleInativo(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        if (user.getInativo() == null) {
            user.setInativo("s");
            user.setDataExclusao(LocalDateTime.now());
        } else {
            user.setInativo(null);
            user.setDataExclusao(null);
        }

        return Optional.of(new UserResponseDTO(userRepository.save(user)));
    }

    public Optional<UserResponseDTO> updateUser(String email, UserUpdateDTO dto) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        User user = userOptional.get();

        if (dto.getName() != null)           user.setName(dto.getName());
        if (dto.getUsername() != null)       user.setUserName(dto.getUsername());
        if (dto.getDataNascimento() != null) user.setDataNascimento(dto.getDataNascimento());
        if (dto.getEmail() != null)          user.setEmail(dto.getEmail());
        if (dto.getPeso() != null)           user.setPeso(dto.getPeso());
        if (dto.getGenero() != null)         user.setGenero(dto.getGenero());
        if (dto.getAltura() != null)         user.setAltura(dto.getAltura());
        if (dto.getMaoDominante() != null)   user.setMaoDominante(dto.getMaoDominante());

        return Optional.of(new UserResponseDTO(userRepository.save(user)));
    }
}
