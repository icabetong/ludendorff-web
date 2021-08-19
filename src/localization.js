import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            app_name: "Ludendorff",
            manage: "Manage",
            account: "Account",
            home: "Home",
            scan: "Scan",
            assets: "Assets",
            users: "Users",
            assignments: "Assignments",
            categories: "Categories",
            departments: "Departments",
            settings: "Settings",
            signout: "Sign-out",
            continue: "Continue",
            cancel: "Cancel",
            add: "Add",
            save: "Save",
            select: "Select",
            previous: "Previous",
            next: "Next",
            close: "Close",
            delete: "Delete",
            show_menu: "Show menu",
            show_drawer: "Show drawer",
            unknown: "Unknown",
            email: "Email",
            password: "Password",
            authenticating: "Authenticating",
            sign_in: "Sign in",
            id: 'ID',
            name: 'Name',
            date_created: 'Date Created',
            date_assigned: 'Date Assigned',
            date_returned: 'Date Returned',
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
            count: "Count: {{count}}",
            asset_create: "Create Asset",
            asset_update: "Edit Asset",
            category_create: "Create Category",
            category_update: "Edit Category",
            specification_create: "Create Specification",
            specification_update: "Edit Specification",
            hello: "Hello",
            welcome_back: "Welcome Back",
            view_qr_code: "View QR-Code",
            view_qr_code_summary: "To save the code, right-click the image then select \"Save Image\".",
            confirm_signout: "Sign out?",
            confirm_signout_message: "Are you sure you want to end your session? You will need to enter your credentials again next time.",
            empty_category: "No Categories Added",
            empty_category_summary: "There are no categories available that can be used to organize the assets.",
            feedback_category_created: "Category created successfully",
            feedback_category_updated: "Category updated successfully",
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