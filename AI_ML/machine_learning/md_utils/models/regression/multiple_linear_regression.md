# Multiple Linear Regression
- Multiple Linear Regression (MLR) is an extension of simple linear regression where: Instead of one independent feature, you use multiple features to predict a target variable.
- For instance predicting the price of the house based on features like size of the house, no of rooms, location etc.
- The assumption while using this model is that there exists linear relationship between the features and the target variable


# Formula
- $y = w_1*x_1 + w_2*x_2 + w_3*x_3 + .... + w_{n}*x_{n} + b$
- Where,
    - $x_1, x_2, x_3 .. x_{n}$: Input features
    - $w_1, w_2, w_3 ... w_{n}$: Wights associated with each feature
    - b: Bias
    - y: Dependent Variable

# Limitations
- Sensitive to outliers
- Struggles with non-linear relationships
- Multicollinearity can distort coefficients


# How to prepare the data to the model?
- As there are n no of factors that is possible in multiple linear regression, passing all of them will confuse the model. Its more like stuffing garbage to the model
- Keep only those variables which are important

# Variable selection methods (Which variables must be used for training the model)
- Pass all the variables/features to the model
- Backward elimination
	- Begin by training the model with all available features.
	- For each feature, check if the feature’s p-value exceeds the chosen significance level ($\alpha$), remove that feature from the model.
	- Rebuild the model and repeat the process until all remaining features have p-values below the significance level.
- Forward selection
	- Choose a significance level (e.g., 0.05).
	- For each independent variable, build a regression model with 1 variable and select the variable with the lowest p-value.
	- Add this selected variable to each remaining independent variable and build regression models with two features (the chosen variable + one new independent variable).
	- From these models, pick the variable with the lowest p-value that is below the significance level.
	- Repeat the process by adding one variable at a time, always checking p-values against the significance level.
	- Continue until no variables have a P value less than the significance level.
- Bidirectional elimination/ Step wise regression
	- Start of with no variables like forward selection
	- At each step 
		- Add the variables which have the lowest P value which is less than the significance level
		- Remove variables which are resulting in P values greater than significance level
	- Continue until all the variables in the model are statistically significant i.e. P value is less than significance value
- All possible models
    - Build all possible regression models
    - And choose that model which meets your expectations
    - This is highly resource consuming

# Implementation
- [Predicting the profit of a startup](./practicals/multiple_linear_regression.ipynb)