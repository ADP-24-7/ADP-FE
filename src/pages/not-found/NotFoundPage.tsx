import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-section">
      <header className="page-header">
        <p className="page-kicker">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
      </header>
      <div className="empty-panel">
        <Link to="/overview">운영 개요로 이동</Link>
      </div>
    </section>
  );
}
