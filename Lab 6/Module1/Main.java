abstract class Vehicle {

    public abstract void startEngine();

    public void stopEngine() {
        System.out.println("Engine stopped.");
    }
}

// Car class
class Car extends Vehicle {

    @Override
    public void startEngine() {
        System.out.println("Car engine started.");
    }

    public void drive() {
        System.out.println("Car is driving.");
    }
}

// Motorcycle class
class Motorcycle extends Vehicle {

    @Override
    public void startEngine() {
        System.out.println("Motorcycle engine started.");
    }

    public void ride() {
        System.out.println("Motorcycle is riding.");
    }
}

// Interface
interface ElectricVehicle {
    void chargeBattery();
}

// Tesla class
class Tesla extends Car implements ElectricVehicle {

    @Override
    public void chargeBattery() {
        System.out.println("Tesla battery is charging.");
    }

    @Override
    public void startEngine() {
        System.out.println("Tesla starts silently (electric engine).");
    }

    public void autopilot() {
        System.out.println("Tesla is driving in autopilot mode.");
    }
}

// ONLY public class
public class Main {
    public static void main(String[] args) {

        Vehicle car = new Car();
        Vehicle motorcycle = new Motorcycle();
        Vehicle tesla = new Tesla();

        System.out.println("=== CAR ===");
        car.startEngine();

        System.out.println("\n=== MOTORCYCLE ===");
        motorcycle.startEngine();

        System.out.println("\n=== TESLA ===");
        tesla.startEngine();

        Tesla myTesla = new Tesla();
        myTesla.chargeBattery();
        myTesla.autopilot();
        myTesla.drive();
    }
}