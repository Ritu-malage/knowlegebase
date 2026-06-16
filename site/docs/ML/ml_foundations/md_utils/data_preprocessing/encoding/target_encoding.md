
# Simple Average Target Encoding
- If we have a column called country and a target variable, which is a continuous variable, then each category in the country column is replaced by the average of it’s target values
- For example, if Germany is one of the categories, we find all the rows with country equal to Germany, and we find the average of the target values of these corresponding rows and then replace the country Germany by that average
- We are converting the categorical value with a continuous variable


# Weighted average target encoding

- If we consider country as a column then we find all the rows were country is equal to Germany and then replace it with

$\text{Encoded Value for Germany} = \frac{sum(\text{Target variables where country is equal to Germany}) + Weight \times Avg(Target)}{\text{No if rows with country Germany} + Weight}$

- This is resulting in data leakage as the target variable is used to convert the categorical value into numerical. 
- To reduce the amount of data leakage use K fold target encoding

# K fold target encoding

- Break your dataset into k folds which are not overlapping
- For each folds we find the weighted target encoding and replace its value in the next fold. For example if we find the weighted target encoding for Germany in fold 1 then we replace the Germany in fold 2 with this value and value obtained in fold 2 will be used in fold 3 and so on

# Ordered Target Encoding
- To find the encoded value we just use the previous rows and not future rows
- The idea is to treat the data as a sequential data i.e. 2nd row is recorded only after 1st row is recorded.
- If there is a time column then we order the target variable by time else we assume the rows are appearing sequentially 
- For example if row 1 has country Spain and row 2 has Germany then while encoding Germany in row 2 we just consider the target values of those rows which have Germany as its country before row 2
- Other target encodings finds all the rows where country was Germany and then we were finding the average.
- This reduces target data leakage 
- Usually used in CatBoost
