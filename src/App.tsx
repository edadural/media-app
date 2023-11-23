import { Routes, Route } from 'react-router-dom'
import './globals.css';

const App = () => {
    return (
        <main className='flex h-screen'>
            <Routes>
                {/* public routes (herkesin kullandığı rotalar) */}
                <Route path='/sign-in' element={<SiginForm />} />

                {/* private routes (özel rotalar) */}
                <Route index element={<Home />} />

            </Routes>
        </main>
    )
}

export default App;