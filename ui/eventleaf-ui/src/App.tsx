import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrganizerDashboardPage } from "./pages/OrganizerDashboardPage";
import { VenueBrowserPage } from "./pages/VenueBrowserPage";
import { OrganizerPlaceholderPage } from "./pages/OrganizerPlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/organizer" element={<OrganizerDashboardPage />} />
        <Route path="/organizer/venues" element={<VenueBrowserPage />} />
        <Route path="/organizer/events" element={<OrganizerPlaceholderPage />} />
        <Route path="/organizer/events/create" element={<OrganizerPlaceholderPage />} />
        <Route path="/organizer/settings" element={<OrganizerPlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
