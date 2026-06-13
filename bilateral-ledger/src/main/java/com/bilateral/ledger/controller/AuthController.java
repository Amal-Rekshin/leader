package com.bilateral.ledger.controller;

import com.bilateral.ledger.model.AppUser;
import com.bilateral.ledger.repository.AppUserRepository;
import com.bilateral.ledger.security.JwtTokenProvider;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<AppUser> userOpt = userRepository.findByEmail(req.getEmail());
        
        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            if (passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {

                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "role", user.getRole(),
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "displayName", user.getName()
                ));
            }
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid credentials"));
        }
        
        return ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid account. Accounts can only be created by an Admin."));
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
}
