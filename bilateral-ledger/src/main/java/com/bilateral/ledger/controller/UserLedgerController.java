package com.bilateral.ledger.controller;

import com.bilateral.ledger.dto.DashboardStatsDTO;
import com.bilateral.ledger.dto.LedgerEntryDTO;
import com.bilateral.ledger.model.AppUser;
import com.bilateral.ledger.repository.AppUserRepository;
import com.bilateral.ledger.service.AdminLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserLedgerController {

    private final AdminLedgerService adminLedgerService;
    private final AppUserRepository appUserRepository;

    @GetMapping("/ledger")
    public ResponseEntity<?> getMyLedger() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        AppUser user = appUserRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
        }

        List<LedgerEntryDTO> ledger = adminLedgerService.getUserLedger(user.getId());
        
        // Calculate balance for the dashboard
        BigDecimal totalDebit = ledger.stream().map(LedgerEntryDTO::getDebit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = ledger.stream().map(LedgerEntryDTO::getCredit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal currentBalance = totalDebit.subtract(totalCredit);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "ledger", ledger,
            "totalDebit", totalDebit,
            "totalCredit", totalCredit,
            "currentBalance", currentBalance
        ));
    }
}
