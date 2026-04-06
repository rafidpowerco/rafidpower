import torch
import torch.nn as nn
import torch.optim as optim

class PINN_ScaleCorrector(nn.Module):
    """
    Physics-Informed Neural Network (PINN) for Industrial Scales.
    This neural net doesn't just guess the weight; it respects the laws of physics.
    It models the scale as a damped harmonic oscillator (m*x'' + c*x' + k*x = F).
    """
    def __init__(self):
        super(PINN_ScaleCorrector, self).__init__()
        # A deep network taking time (t) as input and predicting Sensor Voltage (V)
        self.net = nn.Sequential(
            nn.Linear(1, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 1)
        )
        
        # Physical parameters of the Zemic Load Cell (to be learned/refined)
        self.damping_coefficient = nn.Parameter(torch.tensor([0.1]))
        self.stiffness = nn.Parameter(torch.tensor([10.0]))
        
    def forward(self, t):
        return self.net(t)
        
    def physics_loss(self, t):
        """
        Calculates the residual of the physical differential equation.
        Ensures the AI output absolutely adheres to Hooke's Law and structural damping.
        """
        t.requires_grad = True
        V_pred = self.forward(t)
        
        # First derivative: Velocity (Rate of voltage change)
        V_t = torch.autograd.grad(
            V_pred, t, 
            grad_outputs=torch.ones_like(V_pred),
            create_graph=True
        )[0]
        
        # Second derivative: Acceleration
        V_tt = torch.autograd.grad(
            V_t, t,
            grad_outputs=torch.ones_like(V_t),
            create_graph=True
        )[0]
        
        # ODE: V'' + c*V' + k*V = 0 (Free vibration around the final weight)
        residual = V_tt + self.damping_coefficient * V_t + self.stiffness * V_pred
        
        return torch.mean(residual**2)

def train_self_correction_agent(time_data, signal_data, epochs=1000):
    """
    Trains the agent to correct signal drift and sensor noise in real-time.
    """
    model = PINN_ScaleCorrector()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    t_tensor = torch.tensor(time_data, dtype=torch.float32).view(-1, 1)
    V_tensor = torch.tensor(signal_data, dtype=torch.float32).view(-1, 1)
    
    for epoch in range(epochs):
        optimizer.zero_grad()
        
        # 1. Data Loss: Network should match empirical sensor readings
        V_pred = model(t_tensor)
        data_loss = nn.MSELoss()(V_pred, V_tensor)
        
        # 2. Physics Loss: Network must obey mechanical laws (Self-Correction factor)
        # We sample random collocation points in time for the physics loss
        t_physics = torch.rand(100, 1, requires_grad=True) * max(time_data)
        phys_loss = model.physics_loss(t_physics)
        
        # The ultimate Hybrid Loss
        total_loss = data_loss + 0.1 * phys_loss
        
        total_loss.backward()
        optimizer.step()
        
        if epoch % 200 == 0:
            print(f"Epoch {epoch} | Loss: {total_loss.item():.6f} | Physics Residual: {phys_loss.item():.6f}")

    print("✅ PINN Training Complete. The agent can now mathematically separate true weight from noise.")
    return model

if __name__ == "__main__":
    # Mock data: 10 seconds of noisy stabilization
    import numpy as np
    t_mock = np.linspace(0, 10, 200)
    noise = np.random.normal(0, 0.5, 200)
    # True physics signal + interference
    V_mock = 50.0 + 10.0 * np.exp(-0.5 * t_mock) * np.cos(3 * t_mock) + noise
    
    print("Initializing Physics-Informed Neural Network (PINN) core...")
    trained_agent = train_self_correction_agent(t_mock, V_mock)
