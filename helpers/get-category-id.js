function getCategoryId(categoryValue) {
    let category = categoryValue
    let categoryId = 1;

    switch (category) {
        case "events-and-parties":
            categoryId = 1;
            break;
        case "tech-and-gadgets":
            categoryId = 2;
            break;
        case "clothing-and-accessories":
            categoryId = 3;
            break;
        case "sports-and-outdoor-gear":
            categoryId = 4;
            break;
        case "tools-and-equipment":
            categoryId = 5;
            break;
        case "musical-instruments":
            categoryId = 6;
            break;
        case "home-and-office":
            categoryId = 7;
            break;
        case "pets-accessories":
            categoryId = 8;
            break;
    }
    return categoryId;
}

module.exports = getCategoryId;