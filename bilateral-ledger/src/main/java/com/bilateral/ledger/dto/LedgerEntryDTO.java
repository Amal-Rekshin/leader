package com.bilateral.ledger.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LedgerEntryDTO {
    private String id;
    private LocalDateTime date;
    private String description;
    private BigDecimal debit;  // from Invoices
    private BigDecimal credit; // from Payments
    private BigDecimal balance; // Running balance
}
