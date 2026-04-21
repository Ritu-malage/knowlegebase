# Introduction

# Working of the Human brain

- There are many neurons and these are connected via multiples connections
- The brain tries to identify patterns
- For eg. when the baby is exposed to the image of the fruit apple, the baby has no prior knowledge, but on repeated exposure of the same image, the brain of the baby will try creating patterns like this is red, it is round .etc. Due to which after a few attempts the baby will be able to recognize that its an apple

# Neural Networks

- Used for **classififcation** and **regression** tasks
- Its **inspired** by the **biological neuron**
- Used to identify the **non linear patterns** present in the data
- No of **neurons** in the **input layer** will be **equal to the no of features**
- No of **neurons** in the **output layer** depends on the **no of classes** present in the given dataset
- When the neural network is trained the model will automatically learn the optimal feature crosses to perform on the input data to minimize the loss
- Given the set of inputs the NN will try to **create patterns** and then it predicts the output
- Each neuron will **store different values** and these are used to **identify the patterns** from the given input
- Given an input **all neurons will not be activated only neurons thats responsible for the given input will be activated**
- For eg: If the input images are of apples and oranges then a few set of neurons that are responsible for identifying the red colour of the apple, and a few other neurons that will be responsible to identify the orange colour of the oranges and so on
- Processing happens in the hidden and output layer
- It can be used to solve both classification and regression problem statements

# Layers of NN

## 1. Input layer

- Holds the input dataset
- No of neurons in the input layer will be equal to the no of features present in our dataset
- For eg: if the input image is an apple which is coloured and is of size 28x28 then the image has 3 channels thus no of neurons in the input layer will be 28x28x3. So each neuron will hold the colour value of each pixel
- Each neuron present in the input layer will have connections to every neuron present in the hidden layer i.e. if 3 neurons are there in hidden layer and 2 neurons in the input layer then neuron1 from input layer will have connections to neuron1, 2, and 3 of the hidden layer similarly neuron2 from input layer will have connections to neuron1, 2, and 3 of the hidden layer
- The input layer must be normalised or standardised

## 2. Hidden Layer

- Layers between the input and hidden layer
- Used to hold the patterns present in the input dataset
- The first hidden layer may be responsible to identify the shape of the object in the image, while the second hidden layer might be responsible to identify the colour present in the middle of an image
- The no of layers and no of neurons present in the hidden layer depends on your task, if your task is simple and has less no of patterns to be recognised like the apple v/s orange then use 1 or 2 hidden layers. But if your task is complex like dogs v/s cats then use 5-6 hidden layers or more
- More the neurons more the calculations and more time it takes

## 3. Output layer

- Last layer
- If binary classification then only 1 neuron will be there, which will return the probability value which is between 0-1


# Weights

- Neurons of different layers are connected and each of these connections are associated with weights
- Initially weights are randomly assigned
- After training the weights are updated
- Through weights, model will be able to learn
- Weights will be non zero if that neuron is responsible or related to the input feature else will be 0
- 

# Backward error propogation

- When the predictions are wrong, a feedback will be provided stating that the output is wrong. This is when the neurons will update their weights even before making its next prediction

# Deep learning

- When the no of hidden layers is more than 1
- When there is only 1 hidden layer then it is called as the neural network

# What happens inside the neuron

- Weighted sum: $\sum(W_{i} \times x_{i})$
- Activation function is applied to the weighted sum that was computer in the previous step

# Backpropogation
- It is an algorithm that is used to train the neural networks by updating the weights based on the error in predictions
- The neural network makes a prediction
- Compute the error by comparing the prediction value with actual value
- That propagation sends the error backward through the network
- Each weight will be adjusted based on its contribution to the error
- The main aim is to reduce the error step-by-step
- It uses chain rule from calculus to compute the gradient layer by layer
- $ \hat{w} = w - \eta \frac{\partial L}{\partial w}$
- Where,
    - $\hat{w}$: New Weight
    - $w$: Previous weight
    - L: Loss function
    - $\eta$: Learning Rate

# Training of a DL model with Stochastic Gradient Descent

- Randomly initialize the weights to a small number close to 0, but not zero
- Pass the input data set in the  layer
- The data flows in the forward direction from the input layer to the hidden layer, and then to the final output layer. This is known
- Then compute the error via the cost function
- Perform back propagation that is The error is back propagated from the output layer to the hidden layer to update the weights, such that error is reduced. The learning rate decides how much should the weight be updated by
- Repeat all of these steps until the cost function or the error is minimised
- Once all of these steps are done across all the input samples  be completed in order to make the predictions more    must be trained using multiple epochs

# Feature scaling is a must in DL
- Skipping will make training slower, unstable, or just fail.
- Results in Vanishing and expoding gradients
