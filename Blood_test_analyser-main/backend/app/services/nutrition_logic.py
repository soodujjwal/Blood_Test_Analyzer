from typing import List, Dict, Set

# Mapping of biomarker status to specific vegetarian food recommendations
VEG_NUTRITION_MAPPING = {
    "LDL Cholesterol": {
        "high": ["Oats and barley", "Walnuts and Almonds", "Olive oil", "Beans and legumes", "Avocado", "Apples and Citrus fruits"],
    },
    "HDL Cholesterol": {
        "low": ["Extra virgin olive oil", "Purple-skinned fruits (Berries)", "Flaxseeds", "Fiber-rich foods", "Nuts"],
    },
    "Glucose": {
        "high": ["Leafy greens (Spinach, Kale)", "Chia seeds", "Greek yogurt", "Broccoli", "Apple cider vinegar", "Berries", "Garlic"],
    },
    "HbA1c": {
        "high": ["Cinnamon", "Fenugreek seeds", "Whole grains (Quinoa, Brown rice)", "Nuts", "Okra", "Tofu"],
    },
    "Hemoglobin": {
        "low": ["Spinach", "Lentils", "Pumpkin seeds", "Dark chocolate (>70% cacao)", "Quinoa"],
    },
    "Ferritin": {
        "low": ["Spinach", "Beans", "Fortified cereals", "Cashews", "Dried apricots"],
    },
    "Triglycerides": {
        "high": ["Cruciferous vegetables", "Walnuts", "Soy protein", "Berries", "Green tea"],
    },
    "ALT": {
        "high": ["Grapefruit", "Blueberries", "Cruciferous vegetables", "Nuts", "Coffee", "Prickly pear"],
    },
    "AST": {
        "high": ["Tofu", "Green tea", "Beetroot juice", "Brussels sprouts"],
    },
    "Vitamin D": {
        "low": ["Egg yolks", "Mushrooms (UV exposed)", "Fortified milk/Juice"],
    },
    "Vitamin B12": {
        "low": ["Nutritional yeast (fortified)", "Eggs", "Greek yogurt"],
    },
    "Creatinine": {
        "high": ["Red bell peppers", "Cabbage", "Cauliflower", "Garlic", "Onions", "Apples", "Cranberries"],
    },
    "Uric Acid": {
        "high": ["Cherries", "Low-fat dairy", "Vitamin C rich fruits", "Whole grains", "Coffee", "Nuts"],
    },
    "TSH": {
        "high": ["Iodized salt", "Seaweed/Kelp", "Brazil nuts (Selenium)", "Roasted dairy"],
        "low": ["Cruciferous vegetables", "Soy products", "Strawberries", "Peaches"]
    }
}

# Mapping of biomarker status to specific non-vegetarian food recommendations
NON_VEG_NUTRITION_MAPPING = {
    "LDL Cholesterol": {
        "high": ["Fatty fish (Salmon, Mackerel)"],
    },
    "HDL Cholesterol": {
        "low": ["Fatty fish"],
    },
    "HbA1c": {
        "high": ["Lean poultry", "Salmon"],
    },
    "Hemoglobin": {
        "low": ["Grass-fed beef", "Oysters"],
    },
    "Ferritin": {
        "low": ["Red meat"],
    },
    "Triglycerides": {
        "high": ["Salmon", "Sardines"],
    },
    "AST": {
        "high": ["Lean poultry"],
    },
    "Vitamin D": {
        "low": ["Wild-caught salmon", "Cod liver oil"],
    },
    "Vitamin B12": {
        "low": ["Clams", "Sardines", "Beef liver"],
    },
    "TSH": {
        "high": ["Fresh fish"],
    }
}

def get_targeted_groceries(details: List[Dict]) -> Dict[str, List[str]]:
    """
    Examines blood test details and returns a dictionary with 
    vegetarian and non-vegetarian grocery recommendations.
    """
    veg_groceries = set()
    non_veg_groceries = set()
    
    for detail in details:
        name = detail.get("name", "")
        status = detail.get("status", "").lower() # low, high, normal
        
        if status == "normal":
            continue
            
        # Check Vegetarian Mapping
        for biomarker, recommendations in VEG_NUTRITION_MAPPING.items():
            if biomarker.lower() in name.lower() or name.lower() in biomarker.lower():
                if status in recommendations:
                    veg_groceries.update(recommendations[status])
                break

        # Check Non-Vegetarian Mapping
        for biomarker, recommendations in NON_VEG_NUTRITION_MAPPING.items():
            if biomarker.lower() in name.lower() or name.lower() in biomarker.lower():
                if status in recommendations:
                    non_veg_groceries.update(recommendations[status])
                break
    
    # If no specific abnormal markers, give a general health list
    if not veg_groceries and not non_veg_groceries:
        return {
            "veg": [
                "Mixed organic greens", "Blueberries", "Raw almonds", 
                "Avocados", "Extra virgin olive oil", "Greek yogurt", 
                "Quinoa", "Broccoli", "Mixed nuts"
            ],
            "non_veg": ["Wild-caught Salmon"]
        }
        
    return {
        "veg": sorted(list(veg_groceries)),
        "non_veg": sorted(list(non_veg_groceries))
    }
