function getCategoryName(categoryValue) {
    let category = categoryValue
    let categoryName = "";

    switch (category) {
        case "1":
            categoryName = "events-and-parties";
            break;
        case "2":
            categoryName = "tech-and-gadgets";
            break;
        case "3":
            categoryName = "clothing-and-accessories";
            break;
        case "4":
            categoryName = "sports-and-outdoor-gear";
            break;
        case "5":
            categoryName = "tools-and-equipment";
            break;
        case "6":
            categoryName = "musical-instruments";
            break;
        case "7":
            categoryName = "home-and-office";
            break;
        case "8":
            categoryName = "pets-accessories";
            break;
        case "9":
            categoryName = "books-and-literature";
            break;
    }
    return categoryName;
}
