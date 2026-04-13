import java.math.BigDecimal;

public class CheckingAccount extends Account {

    public CheckingAccount(BigDecimal initialBalance) {
        super(initialBalance);
    }

    @Override
    public void deposit(BigDecimal amount) throws InvalidInputException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Deposit must be greater than zero");
        }
        balance = balance.add(amount);
    }

    @Override
    public void withdraw(BigDecimal amount) throws InvalidInputException, InsufficientFundsException {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Withdrawal must be greater than zero");
        }

        if (amount.compareTo(balance) > 0) {
            throw new InsufficientFundsException("Not enough balance");
        }

        balance = balance.subtract(amount);
    }
}