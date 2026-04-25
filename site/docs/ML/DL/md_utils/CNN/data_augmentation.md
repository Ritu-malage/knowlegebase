# Data augmentation

- **Data augmentation** is a technique used to **artificially increase the size and diversity of a dataset** by creating modified versions of existing data.
- Create more training data without collecting new data
- Working
    - You take an image and apply transformations like:
        - Rotation
        - Flipping
        - Cropping
        - Zooming
        - Brightness/contrast changes
        - Adding noise
- Each transformed image is treated as a **new training example**
- We will have **multiple variations of the same image**
- The label **does not change** after transformation (e.g., a rotated cat is still a cat)

# Why is data augmentation required?

- Reduces **overfitting**
- Improves **generalization**
- Helps when data is **limited**
- Makes model robust to real-world variations