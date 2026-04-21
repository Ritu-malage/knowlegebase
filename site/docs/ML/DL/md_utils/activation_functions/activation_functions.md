# Activation Function

# What is an activation function


# Types of Activation Function
- Sigmoid
- Tanh
- ReLU
    - Parametric ReLU ( PReLU)
    - Leaky ReLU
    - Scaled ReLU
- GELU (Gaussian error linear unit)
- Soft max

# Why is it required?

- Without activation functions, the entire neural network becomes just a linear 
    - In forward propogation the formula is $y=wx+b$
    - For layer 1  $y = W_{1}x + b_{1}$
    - For a 2nd layer, the output of the first layer becomes the input  
    - Thus in 2nd layer it will be $y = W_{2}x + b_{2}$, where x = previous output i.e. W_{1}x + b_{1}. Therefore $y = W_{2}(W_{1}x + b_{1}) + b_{2}$. which is $y = W_{2}W_{1}x + W_{2}b_{1} + b_{2}$.
    - If we substitute $W_{2}W_{1}$ as $W$ and $W_{2}b_{1} + b_{2}$ as b then we will get back same linear equation back i.e. $y = W_{1}x + b_{1}$
    - Hence, no matter how many layers you add, it behaves like a single linear layer  
- A linear model cannot learn complex patterns 
- Activation allows the network to learn more complex patterns
- They help squash values based on the function used  
    - Example: Sigmoid brings values into the range 0-1
- Activation function introduces non linearity
- When activation function is applied to the 2nd layer it will be $y = W_{2} f(W_{1}x + b_{1}) + b_{2}$