import React, { useEffect, useState } from "react";
import { Category, CategoryRepository } from "./Category";

export const CategoryComponent: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        console.log("use effect");
        CategoryRepository.fetch()
            .then((categories) => {
                setCategories(categories)
            })
    }, []);

    return (
        <div>
            {
            categories.map((cat: Category) => {
                {console.log(cat.categoryId)}
                <div key={cat.categoryId}>{cat.categoryName}</div>
            })
            }
        </div>
    )
}