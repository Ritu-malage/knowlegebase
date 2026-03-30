# Binary Encoding
- Its a process of converting categorical variables into binary numbers


# How it works
- Each category is first assigned a unique integer (like label encoding).
- That integer is then converted into its binary representation.
- The binary digits are split into separate columns.
- Ex:
    - Suppose we have a categorical feature "color" with 4 categories:
        - "red" → 1
        - "blue" → 2
        - "green" → 3
        - "yellow" → 4
    - Each of these categories will now be converted into Binary numbers
        - red → 01
        - blue → 10
        - green → 11
        - yellow → 100
    - Split them into columns
        - red → [0, 1]
        - blue → [1, 0]
        - green → [1,1]
        - yellow → [1,0,0]

# Advantages
- Creates few columns than one hot encoding, one hot encoding would have created 4 new columns because 4 categories exists for the color feature
- Thereby reduces the dimenstionality and use of memory

