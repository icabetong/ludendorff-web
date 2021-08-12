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
            unknown: "Unknown",
            category: "Category", 
            status: "Status",
            status_operational: "Operational",
            status_idle: "Idle",
            status_under_maintenance: "Under Maintenance",
            status_retired: "Retired",
            asset_name: "Asset Name",
            asset_create: "Create Asset",
            asset_update: "Edit Asset",
            confirm_signout: "Sign out?",
            confirm_signout_message: "Are you sure you want to end your session? You will need to enter your credentials again next time."
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