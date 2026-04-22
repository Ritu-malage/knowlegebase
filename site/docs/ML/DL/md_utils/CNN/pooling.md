# Pooling

- Of there are n images of cheetah where the placement of this animal in each of the images will be different but our model must be still be able to predict that there is cheetah.
- This implies our model must be special invariant
- So pooling is applied
- It keeps the most important information
- Usually the size of the kernel that’s used for pooling is 2x2
- A small window (e.g., 2×2) slides over the feature map and summarizes values.
- The size of the feature map is reduced (in case of Max pooling using 2x2 kernel only 1 Max value is picked up out of the 4 values within that region)
- It will help in avoiding overfitting
- Also called down sampling
- Pooling is removing what is not required and important but convolution is identifying the patterns and features
- The output is called as the polled feature map


# Types of pooling

1. Max Pooling
- Takes the **maximum value** in each window
- Keeps strongest features

2. Average Pooling

- Takes the **average value**
- Smooths the feature map
1. Sum pooling
- Talking the sum of all the values