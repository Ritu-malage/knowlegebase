# Robust Scaling
- Its designed to handle datasets with outliers
- When outliers exists Robust Scaling outperforms both Min Max Normalization and Standardization(Z-score)
- Instead of using the mean and standard deviation (which are sensitive to outliers), robust scaling uses the median and the interquartile range (IQR).
- This makes the transformation less influenced by extreme values.


# Formula
$X' = \frac{x - Median(X)}{IQR(X)} $
- Where,
    - x: Original Value
    - Median(X): Median of the feature
    - IQR(X): Q3 - Q1 (difference between the 75th and 25th percentiles)

# How it works?
- Scales the spread of values based on IQR which ignores extreme outliers
- Outliers remain in the dataset but will have lesser influence on the scaling process

# When to use?
- Datasets with many outliers 
- When you want to preserve outliers but reduce their impact on training.