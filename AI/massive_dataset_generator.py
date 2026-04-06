import json
import random
import uuid
import sys

def generate_massive_dataset(count=500):
    """
    Generates a massive, deeply detailed synthetic dataset.
    This creates the 500 complex JSON scenarios requested for the proprietary asset.
    """
    
    failure_modalities = [
        "Thermal Expansion Drift",
        "Electromagnetic Interference (EMI) Spikes",
        "Mechanical Binding (Friction)",
        "Moisture Ingress in Junction Box",
        "Creep Recovery Failure",
        "Non-linear Hysteresis Loop",
        "Cable Integrity Degradation",
        "Corner Difference Anomaly"
    ]
    
    sensor_models = ["Zemic HM9B", "Zemic L6E", "Zemic H8C", "HBM C16A", "Keli QS-A", "Mettler Toledo Powercell"]
    
    pinn_solutions = [
        "PINN triggered: Recalculated stiffness matrix (k) to compensate for localized thermal expansion. Shifted baseline by -12.4kg.",
        "PINN triggered: Applied low-pass digital filter leveraging derived damping coefficient to negate 50Hz EMI hum.",
        "PINN ODE check failed: Detected structural friction. Auto-corrected utilizing hysteresis compensation loop.",
        "PINN triggered: Ignored erroneous high-frequency oscillation, extrapolated true weight via asymptotic regression.",
        "PINN triggered: Reconstructed missing data packets by enforcing kinematic constraints (d2F/dt2).",
        "PINN triggered: Evaluated RC continuous time constant; identified resistive shift, adjusted microvolt conversion ratio dynamically."
    ]

    dataset = []

    print(f"Generating {count} high-fidelity industrial scale scenarios...")
    
    for i in range(count):
        noise_level = round(random.uniform(0.1, 8.5), 3) # in mV
        drift_rate = round(random.uniform(-2.0, 2.0), 4) # kg/hr
        load_applied = round(random.uniform(500, 80000), 1) # kg
        
        scenario = {
            "scenario_uuid": str(uuid.uuid4()),
            "timestamp_simulated": f"2026-10-{random.randint(1,28):02d}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z",
            "hardware_context": {
                "sensor_array": random.choice(sensor_models),
                "analog_to_digital": "HX711 / 24-bit AD",
                "ambient_temp_C": random.randint(-15, 60)
            },
            "anomaly_signature": {
                "modality": random.choice(failure_modalities),
                "signal_noise_mV": noise_level,
                "dynamic_drift_kg_per_hr": drift_rate,
                "apparent_weight_variance": round(load_applied * random.uniform(0.01, 0.05), 2),
                "is_fraud_attempt": random.random() < 0.05  # 5% chance of being a fraud attempt
            },
            "pinn_self_correction_logic": {
                "state_before_correction_kg": load_applied + (drift_rate * 6) + (noise_level * 10),
                "action_executed": random.choice(pinn_solutions),
                "state_after_correction_kg": load_applied,
                "accuracy_recovery_percent": round(random.uniform(99.0, 99.99), 2)
            }
        }
        dataset.append(scenario)

    return dataset

if __name__ == "__main__":
    file_path = "c:/Users/Administrator/Desktop/rafid-scale-website/AI/rafid_500_scenarios_dataset.json"
    dataset = generate_massive_dataset(500)
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=4, ensure_ascii=False)
        
    print(f"✅ Successfully written 500 complex JSON scenarios to: {file_path}")
    print("Filesize is significant. Asset securely generated.")
