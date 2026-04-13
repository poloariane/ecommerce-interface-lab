import java.math.BigDecimal;

public class Exercise1Main {
    public static void main(String[] args) {

        try {
            SavingsAccount savings = new SavingsAccount(new BigDecimal("1000"));
            CheckingAccount checking = new CheckingAccount(new BigDecimal("500"));

            savings.deposit(new BigDecimal("200"));
            checking.deposit(new BigDecimal("300"));

            savings.withdraw(new BigDecimal("150"));
            checking.withdraw(new BigDecimal("100"));

            System.out.println("Savings Balance: " + savings.getBalance());
            System.out.println("Savings Interest: " + savings.calculateInterest());

            System.out.println("Checking Balance: " + checking.getBalance());

            savings.withdraw(new BigDecimal("5000")); // error test

        } catch (InvalidInputException | InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}