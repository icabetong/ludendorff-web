import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            manage: "Manage",
            account: "Account",
            home: "Home",
            scan: "Scan",
            assets: "Assets",
            users: "Users",
            assignments: "Assignments",
            categories: "Categories",
            settings: "Settings",
            signout: "Sign-out",
            continue: "Continue",
            cancel: "Cancel",
            add: "Add",
            save: "Save",
            select: "Select",
            unknown: "Unknown",
            email: "Email",
            password: "Password",
            authenticating: "Authenticating",
            sign_in: "Sign in",
            category: "Category",
            category_name: "Category Name", 
            specification: "Specification",
            specification_key: "Name",
            specification_value: "Value",
            status: "Status",
            status_operational: "Operational",
            status_idle: "Idle",
            status_under_maintenance: "Under Maintenance",
            status_retired: "Retired",
            asset_name: "Asset Name",
            asset_create: "Create Asset",
            asset_update: "Edit Asset",
            category_create: "Create Category",
            category_update: "Edit Category",
            specification_create: "Create Specification",
            specification_update: "Edit Specification",
            hello: "",
            welcome_back: "",
            confirm_signout: "Sign out?",
            confirm_signout_message: "Are you sure you want to end your session? You will need to enter your credentials again next time.",
            empty_category: "No Categories Added",
            empty_category_summary: "There are no categories available that can be used to organize the assets."
        }
    }
}

i18n.use(initReactI18next)
    .init({
        resources, 
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;