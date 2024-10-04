import { Routes, Route } from 'react-router-dom';

import JoinPage from './join-page/join-page';
import QueuePage from './queue-page/queue-page';
import LoginForm from './admin-login/login';
import AdminPage from './admin-page/admin';
import "./App.css"
import Home from './main-website/home/Home';
import About from './main-website/about/About';
import Pricing from './main-website/pricing/Pricing';

export default function App() {

 

  return (
    <div className="App">
      <Routes>
        <Route path="join-page" element={<JoinPage />} />
        <Route path="queue-page" element={<QueuePage />} />
        <Route path="admin-login" element={<LoginForm />} />
        <Route path="admin-page" element={<AdminPage />} />
        <Route path="" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="pricing" element={<Pricing />} />
      </Routes>
    </div>
  );
}