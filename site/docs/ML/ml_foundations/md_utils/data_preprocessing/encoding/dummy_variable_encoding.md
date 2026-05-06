# Dummy Variable Encoding
# What are dummy variables?
- It is similar to one hot encoding just that 1 of the columns will be dropped
- For instance if 1 hot encoding for the column "colours" is 
    - Red   → [1, 0, 0]
    - Blue  → [0, 1, 0]
    - Green → [0, 0, 1]
- In the dataset we will now have colours, dummy column 1, dummy column 2, and dummy column 3 
- The 3 dummy columns were created because of the one hot encoding vector size which is 3, that is because colours have 3 categories
- While using dummy variables we drop 1 of the columns so in one hot encoding there will be 3 columns created whereas there will be 2 columns created on using dummy encoding
- If there are 2 columns which are categorical and both have to be converted into dummy variables and each set will have to eliminate 1 dummy variable

# Dummy Variable Trap
- The dummy variable trap occurs when **all dummy variables of a categorical feature are included** in a model, leading to **perfect multicollinearity**.
- When categorical data is converted into dummy variables, they become **linearly dependent**.
- For a feature "colour" with three categories: red, blue, and green. We know that red + blue + green = 1. As at a point in time, either 1 of them can be 1 the rest will be 0. 
- Using this 1 column can be derived from other i.e. red = 1 - blue - green. This creates perfect multicollinearity between these variables
- Its like saying "If not red or green then it must be blue", this the model will already know, thus its like we are passing an extra column unnecessarily. Thus 1 of the dummy variables is dropped
If both columns are 0 then it implies the 3rd column is set to 1

