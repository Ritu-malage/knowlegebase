# Introduction
- Black and white image will be a 2D array
- Coloured image will be a 3D image - Red, Blue and Green Channel
- Each pixel will have a value between 0 to 255


# Pixels
- The smallest unit of the image
- Each pixel will have a value lying btw 0-255.
- 0 implies black, 255 implies white

# Coloured Image
- 3 channels called RGB channels
- R: Red, G: Green, B: Blue Channels
- Each of these channels has its own independent pixels



# Hidden layers of CNN

- Convolution layer
- Activation layer
- Pooling layer
- Fattening layer
- Dense layer


# Cross Entropy

- Cross entropy is a commonly used loss function in Convolutional Neural Networks (CNNs).  
- It measures the difference between the model’s predicted values and the actual labels.  
- When predictions are close to the true values, the loss is small; when they differ, the loss increases.  
- Binary Cross Entropy is defined as:  $L = -[ y \log(p) + (1 - y) \log(1 - p)]$
- Where:  
    - y = actual label (0 or 1)  
    - p = predicted probability  
- Cross entropy is particularly effective because it works directly with probabilities.  
- For binary classification, binary cross entropy is used.  
- For multi-class classification, categorical cross entropy is applied, typically combined with a softmax output layer.  
- While mean squared error (MSE) can also serve as a loss function, cross entropy is generally preferred for CNN tasks
- The ultimate goal is to minimize the loss function, thereby improving the model’s predictive accuracy.  


# Classification Error
- It does not care about the actual probability values instead, just check if the prediction is correct or wrong
- It is the percentage of incorrect predictions
- $\text{Classification Error} = \frac{\text{No of incorrect predictions}}{\text{Total no of predictions}}$
- OR $Error = 1 - Accuracy$
- Eg: If CNN predicts 90 images correctly and 10 images wrongly then the error is $\frac{10}{100} = 0.1$

# Why cross entropy is used when compared to MSE in  classification models?
- The output of CNN is probability and Cross Entropy is designed to compare probability distributions  
- Cross entropy penalizes wrong predictions heavily, whereas MSE treats all errors more uniformly
- MSE is better for regression models
- Cross entropy provides larger, more useful gradients