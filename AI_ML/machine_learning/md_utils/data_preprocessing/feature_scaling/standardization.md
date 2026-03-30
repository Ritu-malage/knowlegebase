
# Standardization or Z-score
- **How many standard deviations away from the mean the value is.**
- Eg: If a value has a standard deviation of 2 greater than the mean then the value has a Z-score of +2. While a value that has 1.5 standard deviations less than the mean then it has a Z-score of -1.5
- $Z-Score$ OR $x'$ = $\frac{x-Mean}{StandardDeviation}$
- **Better choice** over linear scaling because most of the **real world datasets are not normally distributed**.
- This **does not bring the values to lie within a specific range** like the min max normalization instead  it **transforms the data** such that the **mean becomes 0 and the standard deviation will become 1**
- Useful for SVM, Logistic regression, Neural networks where data is normally distributed
- If the data is normal then usually the values will lie between -3 and +3



# When to use Z-score?
- Min Max normalization works when the data is normally distributed, but Standarization will work in any situations thus Standarization is usually used




# Implementation
- In sklearn use StandardScaler

```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
scaler.fit(data)
scaled_values = scaler.transform(data)
```