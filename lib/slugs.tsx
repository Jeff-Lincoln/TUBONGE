import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-root-toast";

export const formatSlug = (slug: string | null): string => {
    if (!slug) return "";
    
    try {
        const slugString = String(slug);
        const words = slugString.split(/[-_]/);  // Handles both hyphens and underscores
        return words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    } catch {
        return "";
    }
};

export const inverseFormatSlug = (title: string | null): string => {
    if (!title) return "";
    return title.toLowerCase().split(" ").join("-");
};

export const copySlug = async (slug: string | null): Promise<void> => {
    if (!slug) return;

    try {
        const formattedSlug = formatSlug(slug);
        await Clipboard.setStringAsync(formattedSlug);

        Toast.show("Copied Call ID to clipboard!", {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            backgroundColor: "#333",
            textColor: "#fff",
        });
    } catch {
        Toast.show("Failed to copy Call ID", {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            backgroundColor: "#ff4444",
            textColor: "#fff",
        });
    }
};
