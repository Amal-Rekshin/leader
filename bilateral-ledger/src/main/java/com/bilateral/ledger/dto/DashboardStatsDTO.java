package com.bilateral.ledger.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDTO {
    private long totalUsers;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private BigDecimal remainingBalance;
}
