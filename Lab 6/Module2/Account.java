import java.math.BigDecimal;

public abstract class Account {

    protected BigDecimal balance;

    public Account(BigDecimal initialBalance) {
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.balance = initialBalance;
    }

    public abstract void deposit(BigDecimal amount) throws InvalidInputException;

    public abstract void withdraw(BigDecimal amount) throws InvalidInputException, InsufficientFundsException;

    public BigDecimal getBalance() {
        return balance;
    }
}