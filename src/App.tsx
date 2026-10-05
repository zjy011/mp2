import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PokemonDataProvider } from './context/PokemonDataProvider';
import Layout from './components/Layout';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PokemonDataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/list" replace />} />
            <Route path="list" element={<ListView />} />
            <Route path="gallery" element={<GalleryView />} />
            <Route path="details/:id" element={<DetailView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </PokemonDataProvider>
    </BrowserRouter>
  );
}
