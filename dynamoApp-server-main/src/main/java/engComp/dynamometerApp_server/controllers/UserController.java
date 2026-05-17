package engComp.dynamometerApp_server.controllers;

import engComp.dynamometerApp_server.dto.UserCreateDTO;
import engComp.dynamometerApp_server.dto.UserResponseDTO;
import engComp.dynamometerApp_server.dto.UserUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import engComp.dynamometerApp_server.entities.User;
import engComp.dynamometerApp_server.services.UserService;

import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private static final Logger logger = Logger.getLogger(UserController.class.getName());

    @Autowired
    private UserService userService;

    //Métodos GET
    @GetMapping
    public ResponseEntity<UserResponseDTO> getUserByEmail(@RequestParam String email) {
        logger.info("Getting user by email: " + email);
        Optional<UserResponseDTO> userOptional = userService.getUserByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(userOptional.get()); //lembrete: aqui é retornado o UserResponseDTO (sem senha, status inativo ou exclusão)
    }

    //Métodos POST
    @PostMapping("/login")
    public ResponseEntity<Void> loginUser(@RequestParam String email, @RequestParam String password) {
        logger.info("User login");

        Optional<User> userOptional = userService.getUserEntityByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!password.equals(userOptional.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/create")
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody @Valid UserCreateDTO dto) {
        logger.info("Creating New User");
        UserResponseDTO newUser = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    //Métodos PATCH
    @PatchMapping("/deactivateAcc")
    public ResponseEntity<UserResponseDTO> toggleInativo(@RequestParam String email) {
        logger.info("Toggling inativo for user: " + email);

        Optional<UserResponseDTO> userOptional = userService.toggleInativo(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(userOptional.get());
    }

    @PatchMapping("/updateUserInfo")
    public ResponseEntity<UserResponseDTO> updateUser(@RequestParam String email, @RequestBody @Valid UserUpdateDTO dto) {

        logger.info("Updating user: " + email);

        Optional<UserResponseDTO> userOptional = userService.updateUser(email, dto);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(userOptional.get());
    }
}
