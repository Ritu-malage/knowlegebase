# Light GBM

- Light Gradient Boosting Machine


# Advantages

- Faster training
- Lower memory usage
- Better accuracy
- Can handle large scale data
 this record is null these kinds of records will are favourable for exclusive feature bundling
- But let’s say if 2 features of the same record is not null then this will result in loss of accuracy
- If there are only minimal number of such cases then it’s ok else will drop the accuracy


# Optimisation techniques used by light, GBM

- Histogram based split
- Exclusive feature bundling
- Leaf wise tree growth
- Gradient based one side sampling

# Histogram splits

- Technique used to make decision tree training much faster
- When there is continuous variable instead of having different break points for each continuous variable, we bin the values, there by reducing the no of splits
- For eg: Age = [18, 19, 20, 21, 22, 23, 24, ...]. It traditional tree based algorithms the split points will be age < 18.5, age > 50, age < 17 etc, thereby slowing the training process
- Instead LightGBM groups these values

| Original Values | Bin |
| --- | --- |
| 18–20 | Bin 1 |
| 21–23 | Bin 2 |
| 24–26 | Bin 3 |
- Now the only split points will be bin1, bin2, or other
- This will result in the loss of some information, but that reasonable


# Advantages of histogram splitting

- Faster training
- Lower memory usage
- Efficient for larger data sets







# Feature bundling

- Also called Exclusive Feature Bundling – EFB
- Technique used to reduce the number of features and speed up training
- Some datasets have thousands or millions of sparse features i.e. most of the values are 0's. Due to this the training becomes more memory expensive and computationally slow
- If 2 features are mutually exclusive i.e. at the same time both dont have the non 0 values then LightGBM clubs these 2 features into a single feature 
- For eg

|feature 1|feature 2|feature 3|
|---|---|---|
|50|0|0|
|0|20|0|
|0|80|0|
|0|0|70|

- If we just do new feature (clubbed) = 50, 20, 80, 70. Then we will not be able to tell was 50 from feature1, feature2, or feature 3. Thus some offset value is added to each column so that we will be able to know where the value is coming from
- For the feature 1 no offset is added
- For feature2, we need to add a non 0 offset. 
- To find the offset we find the max possible value in the previous feature and add +1 to it and add this value to every feature in the current feature
- So max value possible is 50 thus 50+1 = 51 is added to every non zero value present in feature 2 so it will be 20+51 = 71, 80+51=131
- Next for feature 3 we need to add 80+1 = 81, thus 70 -> 70+81 = 151 


|Clubbed Feature|
|---|
|50|
|71|
|131|
|151|

- Looking at the values in the clubbed feature, if the value is between 0-50 then its because of feature1 if the value is between 51 and 131 then its due to feature2 else due to feature 3








# Working of feature bundling

- Find those features which are sparse and have only 1 non null value and the rest are null
- Let’s say 4 features are present
- All of these 4 features will be bundled into a single feature
- Take feature 1 then find the Max from that column and add + 1 to it





# Exclusive Feature Bundling (EFB)

- Exclusive Feature Bundling (EFB) is a technique used in **LightGBM** to reduce the number of features and speed up training, especially for datasets with thousands or millions of **sparse features** (i.e., most values are 0). 
- Sparse features make training memory-expensive and computationally slow.

- Key Idea
    - If two features are **mutually exclusive** (they never have non-zero values at the same time), LightGBM can **bundle** them into a single feature.
    - This reduces dimensionality while preserving information about which original feature contributed the value.

- Example: Original Features
| feature 1 | feature 2 | feature 3 |
|-----------|-----------|-----------|
| 50        | 0         | 0         |
| 0         | 20        | 0         |
| 0         | 80        | 0         |
| 0         | 0         | 70        |

- Problem: If we simply club values into one feature: [50,20,80,70], then we lose track of whether the value came from feature 1, feature 2, or feature 3.
- Solution: Add Offsets
    - **Feature 1**: No offset.
    - **Feature 2**: Add `(max of feature 1 + 1) = 50 + 1 = 51` to all non-zero values.
        - 20 → 71, 80 → 131
    - **Feature 3**: Add `(max of feature 2 + 1) = 80 + 1 = 81` to all non-zero values.
        - 70 → 151
- Clubbed Feature

| Clubbed Feature |
|-----------------|
| 50              |
| 71              |
| 131             |
| 151             |

- Interpretation
    - Values **0–50** → from *feature 1*
    - Values **51–131** → from *feature 2*
    - Values **≥151** → from *feature 3*

- This way, LightGBM can efficiently train with fewer features while still distinguishing the source feature.

