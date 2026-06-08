
# Simple Average Target Encoding
- If we have a column called country and a target variable, which is a continuous variable, then each category in the country column is replaced by the average of it’s target values
- For example, if Germany is one of the categories, we find all the rows with country equal to Germany, and we find the average of the target values of these corresponding rows and then replace the country Germany by that average
- We are converting the categorical value with a continuous variable