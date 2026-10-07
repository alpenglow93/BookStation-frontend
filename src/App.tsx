import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom"
import BookListPage from "./pages/BookListPage.tsx"
import LibraryPage from "./pages/LibraryPage.tsx"
import RecommendPage from "./pages/RecommendPage.tsx"

function App() {

  return (
    <BrowserRouter>
        <header className="app-header">
            <Link to="/" className="app-brand">
                <img src="/logo.png" alt="" className="app-logo" />
                <h1 className="app-title">북스테이션</h1>
            </Link>
            <nav className="app-nav">
                <NavLink to="/" end>내 서재</NavLink>
                <NavLink to="/books">도서 검색</NavLink>
                <NavLink to="/recommend">추천</NavLink>
            </nav>
        </header>

        <main className="app-main">
            <Routes>
                <Route path="/" element={<LibraryPage/>}/>
                <Route path="/books" element={<BookListPage/>}/>
                <Route path="/recommend" element={<RecommendPage/>}/>
            </Routes>
        </main>

    </BrowserRouter>
  )
}

export default App
