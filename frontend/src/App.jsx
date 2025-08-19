import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage.jsx';
import Register from './Register.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import AccountSettings from './AccountSettings.jsx';
import Document from './Document.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<WelcomePage />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/accountsettings' element={<AccountSettings />} />
                <Route path='/document/:documentid' element={<Document />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;