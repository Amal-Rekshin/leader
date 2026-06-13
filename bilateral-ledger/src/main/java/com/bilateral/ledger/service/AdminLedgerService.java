package com.bilateral.ledger.service;

import com.bilateral.ledger.dto.DashboardStatsDTO;
import com.bilateral.ledger.dto.LedgerEntryDTO;
import com.bilateral.ledger.model.AppUser;
import com.bilateral.ledger.model.Invoice;
import com.bilateral.ledger.model.Payment;
import com.bilateral.ledger.repository.AppUserRepository;
import com.bilateral.ledger.repository.InvoiceRepository;
import com.bilateral.ledger.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminLedgerService {

    private final AppUserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUser createUser(String name, String email, String password, String phone, String role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);

        return userRepository.save(user);
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public AppUser getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AppUser updateUser(Long userId, String name, String email, String phone) {
        AppUser user = getUser(userId);
        user.setName(name);
        user.setEmail(email);
        user.setPhoneNumber(phone);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        AppUser user = getUser(userId);
        
        List<Invoice> invoices = invoiceRepository.findByUserIdOrderByDateAsc(userId);
        invoiceRepository.deleteAll(invoices);
        
        List<Payment> payments = paymentRepository.findByUserIdOrderByDateAsc(userId);
        paymentRepository.deleteAll(payments);
        
        userRepository.delete(user);
    }

    public Invoice createInvoice(Long userId, String description, BigDecimal amount) {
        AppUser user = getUser(userId);
        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        invoice.setDescription(description);
        invoice.setAmount(amount);
        return invoiceRepository.save(invoice);
    }

    public Payment recordPayment(Long userId, String description, BigDecimal amount) {
        AppUser user = getUser(userId);
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setDescription(description);
        payment.setAmount(amount);
        return paymentRepository.save(payment);
    }

    public List<LedgerEntryDTO> getUserLedger(Long userId) {
        List<Invoice> invoices = invoiceRepository.findByUserIdOrderByDateAsc(userId);
        List<Payment> payments = paymentRepository.findByUserIdOrderByDateAsc(userId);

        List<LedgerEntryDTO> entries = new ArrayList<>();

        for (Invoice inv : invoices) {
            LedgerEntryDTO dto = new LedgerEntryDTO();
            dto.setId("INV-" + inv.getId());
            dto.setDate(inv.getDate());
            dto.setDescription(inv.getDescription() + " (Inv #" + inv.getInvoiceNumber() + ")");
            dto.setDebit(inv.getAmount());
            dto.setCredit(BigDecimal.ZERO);
            entries.add(dto);
        }

        for (Payment pay : payments) {
            LedgerEntryDTO dto = new LedgerEntryDTO();
            dto.setId("PAY-" + pay.getId());
            dto.setDate(pay.getDate());
            dto.setDescription(pay.getDescription());
            dto.setDebit(BigDecimal.ZERO);
            dto.setCredit(pay.getAmount());
            entries.add(dto);
        }

        entries.sort(Comparator.comparing(LedgerEntryDTO::getDate));

        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerEntryDTO entry : entries) {
            runningBalance = runningBalance.add(entry.getDebit()).subtract(entry.getCredit() != null ? entry.getCredit() : BigDecimal.ZERO);
            entry.setBalance(runningBalance);
        }

        return entries;
    }

    public List<LedgerEntryDTO> getAllLedger() {
        List<Invoice> invoices = invoiceRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        List<LedgerEntryDTO> entries = new ArrayList<>();

        for (Invoice inv : invoices) {
            LedgerEntryDTO dto = new LedgerEntryDTO();
            dto.setId("INV-" + inv.getId());
            dto.setDate(inv.getDate());
            dto.setDescription(inv.getUser().getName() + " - " + inv.getDescription() + " (Inv #" + inv.getInvoiceNumber() + ")");
            dto.setDebit(inv.getAmount());
            dto.setCredit(BigDecimal.ZERO);
            entries.add(dto);
        }

        for (Payment pay : payments) {
            LedgerEntryDTO dto = new LedgerEntryDTO();
            dto.setId("PAY-" + pay.getId());
            dto.setDate(pay.getDate());
            dto.setDescription(pay.getUser().getName() + " - " + pay.getDescription());
            dto.setDebit(BigDecimal.ZERO);
            dto.setCredit(pay.getAmount());
            entries.add(dto);
        }

        entries.sort(Comparator.comparing(LedgerEntryDTO::getDate));

        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerEntryDTO entry : entries) {
            runningBalance = runningBalance.add(entry.getDebit()).subtract(entry.getCredit() != null ? entry.getCredit() : BigDecimal.ZERO);
            entry.setBalance(runningBalance);
        }

        return entries;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        long totalUsers = userRepository.count() - 1;
        stats.setTotalUsers(totalUsers);

        BigDecimal totalDebit = invoiceRepository.findAll().stream()
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalDebit(totalDebit);

        BigDecimal totalCredit = paymentRepository.findAll().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalCredit(totalCredit);

        stats.setRemainingBalance(totalDebit.subtract(totalCredit));
        
        return stats;
    }
}
