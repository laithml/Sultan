const {query,where,doc, setDoc, deleteDoc, getDoc, updateDoc, collection, getDocs} = require("firebase/firestore");
const {db} = require("../config/Firebase");

exports.getCategories = async (req, res) => {
    try {
        const categories = await getDocs(collection(db, "categories"));
        const categoriesList = [];
        categories.forEach((doc) => {
            categoriesList.push({
                id: doc.id,
                ...doc.data()
            });
        });
        res.status(200).json(categoriesList);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories", details: error.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { categoryName, categoryColor } = req.body;

        if (!categoryName || !categoryColor) {
            return res.status(400).json({ error: 'Category name and color are required' });
        }

        const categoriesCollection = collection(db, 'categories');

        // Check if the category already exists
        const existingCategoryQuery = await getDocs(query(categoriesCollection, where('name', '==', categoryName)));
        if (existingCategoryQuery.size > 0) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Add the new category to Firestore with color
        const newCategoryDocRef = await setDoc(doc(categoriesCollection), {
            name: categoryName,
            color: categoryColor,
        });

        res.status(201).json({ message: 'Category added successfully', categoryId: newCategoryDocRef.id });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category', details: error.message });
    }
};
