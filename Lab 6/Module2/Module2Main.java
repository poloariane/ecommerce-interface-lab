import java.util.*;
import java.util.stream.*;

// Record class (given sa module)
record Order(Long orderId, String description, int amount) {}

public class Module2Main {

    public static void main(String[] args) {

        // Generate orders (minimum 100 based sa module)
        List<Order> orders = orderGenerator(100);

        // =====================================================
        // 1. Print all orders
        // =====================================================
        System.out.println("ALL ORDERS:");
        orders.forEach(o -> 
            System.out.println("ID: " + o.orderId() + 
                               ", Desc: " + o.description() + 
                               ", Amount: " + o.amount())
        );

        // =====================================================
        // 2. Add new order and sort (descending by amount)
        // =====================================================
        orders.add(new Order(999L, "New Order", 180));

        orders.sort((a, b) -> b.amount() - a.amount());

        System.out.println("\nSORTED ORDERS (DESC):");
        orders.forEach(System.out::println);

        // =====================================================
        // 3. Filter amount > 150 and map description
        // =====================================================
        List<String> filtered = orders.stream()
                .filter(o -> o.amount() > 150)
                .map(o -> o.description())
                .toList();

        System.out.println("\nFILTERED (>150) DESCRIPTIONS:");
        filtered.forEach(System.out::println);

        // =====================================================
        // 4. Average amount
        // =====================================================
        double average = orders.stream()
                .mapToInt(o -> o.amount())
                .average()
                .orElse(0);

        System.out.println("\nAVERAGE AMOUNT: " + average);

        // =====================================================
        // 5. Group by description and sum amounts
        // =====================================================
        Map<String, Integer> grouped = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.description(),
                        Collectors.summingInt(o -> o.amount())
                ));

        System.out.println("\nGROUPED (DESCRIPTION -> TOTAL AMOUNT):");
        grouped.forEach((k, v) -> System.out.println(k + " = " + v));
    }

    // =====================================================
    // Generator method (same as module)
    // =====================================================
    static List<Order> orderGenerator(int numberOfOrders) {

        if (numberOfOrders < 100) {
            throw new RuntimeException("Invalid value");
        }

        var generatedOrder = new ArrayList<Order>();

        for (var i = 0; i <= numberOfOrders; i++) {
            long orderId = (int) (Math.random() * 10);

            generatedOrder.add(new Order(
                    orderId,
                    "Order " + orderId,
                    (int) (Math.random() * 200)
            ));
        }

        return generatedOrder;
    }
}