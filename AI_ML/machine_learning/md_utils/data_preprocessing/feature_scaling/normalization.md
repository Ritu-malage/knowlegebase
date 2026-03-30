# Normalization / Min Max normalization
- Also called as **scaling or Linear scaling**
- Converting values to a standard range like between **0-1 or -1 to 1**(If there are negative values in the dataset).
- MinMax normalization works best when **outliers are minimal or absent**.  
- It is highly **sensitive to extreme outliers**, since the scaling process relies on the minimum and maximum values of the dataset.  
- If those min/max values are outliers, the normalized feature range can become distorted, negatively impacting model performance.  


# Formula
- x' = $\frac{x - xmin}{xmax - xmin}$
- Where,
    - x': Scaled value/ Normalized value
    - x: Original value
    - xmin: Minimum value of the feature x
    - xmax: Maximum value of the feature x

# Implementation
- Use MinMaxScaler

```python
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
scaler.fit(data)
scaled_values = scaler.transform(data)
```

# When to Use Linear Scaling or min max normalization?
- Best suited when the **lower and upper bounds of the data remain stable** over time.  
- Works well when the feature contains **few or no outliers**, since extreme values can distort the scaling (as the formula depends on `xmin` and `xmax`).  
- Effective when the data distribution is **uniform or relatively flat**.  
- Examples:
    - **Age**: Linear scaling is appropriate because the bounds (0–100) are consistent and outliers are rare.  
    - **Net Worth**: Not ideal, since values vary widely and the distribution is highly skewed. Most individuals fall into the lower range, while a few extreme outliers dominate the upper range, making linear scaling misleading.  
