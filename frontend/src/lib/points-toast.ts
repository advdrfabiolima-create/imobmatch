import toast from "react-hot-toast";

export function showPointsToast(points: number, reason: string) {
  toast(`+${points} pontos! ${reason}`, {
    icon: "⭐",
    duration: 4000,
    style: {
      background: "#1e3a5f",
      color: "#fff",
      fontWeight: "600",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    },
    iconTheme: {
      primary: "#facc15",
      secondary: "#1e3a5f",
    },
  });
}
