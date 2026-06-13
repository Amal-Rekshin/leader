package com.bilateral.ledger.config;

import com.bilateral.ledger.model.AppUser;
import com.bilateral.ledger.repository.AppUserRepository;
import com.bilateral.ledger.service.AdminLedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminLedgerService adminLedgerService;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
            adminLedgerService.createUser("Admin", "admin@admin.com", "admin", null, "ADMIN");
            log.info("Created default admin user: admin@admin.com / admin");
        }
        
        if (userRepository.findByEmail("user@user.com").isEmpty()) {
            adminLedgerService.createUser("Test User", "user@user.com", "user", null, "USER");
            log.info("Created default test user: user@user.com / user");
        }
    }
}
