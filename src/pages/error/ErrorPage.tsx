import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unexpected route error';

  return (
    <section className="page-section">
      <header className="page-header">
        <p className="page-kicker">Error</p>
        <h1>화면을 불러오지 못했습니다</h1>
      </header>
      <div className="empty-panel">{message}</div>
    </section>
  );
}
