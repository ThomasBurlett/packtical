import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthGate } from "@/auth/AuthGate";
import { HomePage } from "@/pages/HomePage";
import { ChecklistPage } from "@/pages/ChecklistPage";

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:slug" element={<ChecklistRoute />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AuthGate>
  );
}

function ChecklistRoute() {
  const { slug = "" } = useParams();
  return <ChecklistPage key={slug} slug={slug} />;
}
