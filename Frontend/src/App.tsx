import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ElementDetail from "./pages/Detail";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Elements from "./pages/Element";
import LoginSuccess from "./pages/Login/LoginSuccess";
import AddElement from "./pages/AddElement";
import ProfilePage from "./pages/Profile";
import FavouritePage from "./pages/Favourite";
import SettingProfile, { Profile } from "./pages/Setting";
import AccountSettings from "./pages/Setting/Account";
import Achievements from "./pages/Setting/Achivements";
import EmailSettings from "./pages/Setting/Email";
import StatsPage from "./pages/Setting/Stats";
import AdminPage from "./pages/AdminPage";
import AdminRoute from "./AdminRoute";
import Spotlight from "./pages/Spotlight";

import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import AdminChallenges from "./pages/AdminChallenges";
import CreateChallengeEntry from "./pages/CreateChallengeEntry";
import AdminUsers from "./pages/AdminUsers";

import SidebarLayout from "./components/SidebarLayout";
import Footer from "./components/Footer";
import { CartProvider } from "./contexts/CartContext";
function App() {
  return (
    <CartProvider>
    <Suspense fallback={<div>Loading page...</div>}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/elements/new" element={<AddElement mode="add" />} />

        <Route path="/elements/:id/edit" element={<AddElement mode="edit" />} />

        <Route path="/element/:id" element={<ElementDetail />} />

        <Route path="/login/success" element={<LoginSuccess />} />

        <Route element={<SidebarLayout />}>
          <Route path="/elements/:category" element={<Elements />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favourite" element={<FavouritePage />} />
        </Route>
        <Route
          path="/elements"
          element={<Navigate to="/elements/all" replace />}
        />
        <Route path="/settings" element={<SettingProfile />}>
          <Route index element={<Profile />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="email" element={<EmailSettings />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>

        <Route path="/spotlight" element={<Spotlight />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route
          path="/challenges/:challengeId/create-entry"
          element={<CreateChallengeEntry />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/challenges"
          element={
            <AdminRoute>
              <AdminChallenges />
            </AdminRoute>
          }
        />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Footer />
    </Suspense>
    </CartProvider>
  );
}

export default App;
