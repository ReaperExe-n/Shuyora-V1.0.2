import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Error from "./pages/Error"
import HomeSkeleton from "./components/Loader/HomeSkeleton"
import Skeleton from "./components/Loader/Skeleton"
import OAuthCallback from "./pages/OAuthCallback"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import { Toaster } from "react-hot-toast"

const Home = lazy(() => import("./pages/Home"))
const Airing = lazy(() => import("./pages/Airing"))
const Genre = lazy(() => import("./pages/Genre"))
const Main = lazy(() => import("./pages/Main"))
const Movies = lazy(() => import("./pages/Movies"))
const Popular = lazy(() => import("./pages/Popular"))
const Series = lazy(() => import("./pages/Series"))
const Watch = lazy(() => import("./pages/Watch"))
const Info = lazy(() => import("./pages/Info"))
const Search = lazy(() => import("./pages/Search"))
const History = lazy(() => import("./pages/History"))
const Jukebox = lazy(() => import("./pages/Jukebox"))
const WatchParty = lazy(() => import("./pages/WatchParty"))
const Profile = lazy(() => import("./pages/Profile"))
import Footer from './components/Footer';
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        <BrowserRouter>
          <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<HomeSkeleton />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/home"
            element={
              <Suspense fallback={<HomeSkeleton />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/movies"
            element={
              <Suspense fallback={<Skeleton />}>
                <Movies />
              </Suspense>
            }
          />
          <Route
            path="/tv-series"
            element={
              <Suspense fallback={<Skeleton />}>
                <Series />
              </Suspense>
            }
          />
          <Route
            path="/most-popular"
            element={
              <Suspense fallback={<Skeleton />}>
                <Popular />
              </Suspense>
            }
          />
          <Route
            path="/top-airing"
            element={
              <Suspense fallback={<Skeleton />}>
                <Airing />
              </Suspense>
            }
          />
          <Route
            path="/search/:query"
            element={
              <Suspense fallback={<Skeleton />}>
                <Search />
              </Suspense>
            }
          />
          <Route
            path="/search"
            element={
              <Suspense fallback={<Skeleton />}>
                <Search />
              </Suspense>
            }
          />
          <Route
            path="/watch/:animeName"
            element={
              <Suspense fallback={<Skeleton />}>
                <Watch />
              </Suspense>
            }
          />
          <Route
            path="/anime/:id"
            element={
              <Suspense fallback={<Skeleton />}>
                <Info />
              </Suspense>
            }
          />
          <Route
            path="/genre/:genreName"
            element={
              <Suspense fallback={<Skeleton />}>
                <Genre />
              </Suspense>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Skeleton />}>
                  <History />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/jukebox" element={<ProtectedRoute><Suspense fallback={<Skeleton />}><Jukebox /></Suspense></ProtectedRoute>} />
          <Route path="/watch-party" element={<ProtectedRoute><Suspense fallback={<Skeleton />}><WatchParty /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Suspense fallback={<Skeleton />}><Profile /></Suspense></ProtectedRoute>} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/*" element={<Error />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
